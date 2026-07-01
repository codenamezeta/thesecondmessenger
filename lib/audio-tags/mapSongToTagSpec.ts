import type { GatedContent, Media, Release, Song, Tag } from '@/payload-types'
import {
  ARTIST_HOMEPAGE,
  PRIMARY_ARTIST,
  TAGGING_SCHEMA_VERSION,
} from '@/lib/branding'
import type { TagSpec, TrackPosition } from './types'
import { normalizeKey } from './normalizeKey'

export type TaggableUploadCollection = 'media' | 'gated-content'

export type TaggableUploadInfo = {
  collection: TaggableUploadCollection
  id: number
  url: string | null
  mimeType: string | null
  filename: string | null
  prefix?: string | null
}

type MasterMediaInfo = TaggableUploadInfo

/**
 * Fields the mapper expects to see on a Song doc. The auto-generated
 * `Song` type from `payload-types.ts` may lag behind the collection
 * config (e.g. while regenerating), so we declare the additional fields
 * as a structural extension here. This keeps the mapper compilable
 * regardless of generation order.
 */
type FeaturedArtist = { name: string; id?: string | null }

type SongCredit = NonNullable<Song['credits']>[number] & {
  legalName?: string | null
}

type MusicBrainzIds = {
  recordingId?: string | null
  trackId?: string | null
  releaseId?: string | null
  releaseGroupId?: string | null
  artistId?: string | null
  workId?: string | null
}

type SongForTagging = Omit<Song, 'credits'> & {
  featuredArtists?: FeaturedArtist[] | null
  primaryRelease?: number | Release | null
  phonogramCopyrightOwner?: string | null
  compositionCopyrightOwner?: string | null
  publisher?: string | null
  termsOfUse?: 'all-rights' | 'cc-attrib-nc' | 'custom' | null
  termsOfUseCustom?: string | null
  comment?: string | null
  discNumber?: number | null
  credits?: SongCredit[] | null
  musicBrainz?: MusicBrainzIds | null
  masterAudioFlac?: number | GatedContent | null
  masterAudioWav?: number | GatedContent | null
}

const TERMS_OF_USE_PRESETS: Record<
  Exclude<NonNullable<SongForTagging['termsOfUse']>, 'custom'>,
  string
> = {
  'all-rights': 'All rights reserved',
  'cc-attrib-nc': 'Free for non-commercial use with attribution',
}

function isResolved<T>(value: T | number | null | undefined): value is T {
  return typeof value === 'object' && value !== null
}

function tagNames(tags: Song['genres']): string[] {
  if (!tags) return []
  return tags
    .filter((t): t is Tag => isResolved<Tag>(t))
    .map((t) => t.name)
    .filter(Boolean)
}

function featuredArtistsString(featured: FeaturedArtist[] | null | undefined) {
  if (!featured || featured.length === 0) return ''
  const names = featured.map((f) => f.name).filter(Boolean)
  if (names.length === 0) return ''
  return `feat. ${names.join(', ')}`
}

function buildArtist(featured: FeaturedArtist[] | null | undefined) {
  const suffix = featuredArtistsString(featured)
  return suffix ? `${PRIMARY_ARTIST} ${suffix}` : PRIMARY_ARTIST
}

function buildCopyright(
  year: number | undefined,
  compositionType: Song['compositionType'],
  phonogramOwner: string,
  compositionOwner: string,
): string | undefined {
  if (!year) return undefined
  const isCover = compositionType === 'Cover'
  if (isCover) return `℗ ${year} ${phonogramOwner}`
  // Originals: claim both phonogram and composition. Collapse to one
  // line if the two owners are identical (the common case for a
  // self-released singer-songwriter).
  if (phonogramOwner === compositionOwner) {
    return `℗ © ${year} ${phonogramOwner}`
  }
  return `℗ ${year} ${phonogramOwner} | © ${year} ${compositionOwner}`
}

function buildMusicBrainz(
  mb: MusicBrainzIds | null | undefined,
): TagSpec['musicBrainz'] {
  if (!mb) return undefined
  const clean = (v: string | null | undefined) => v?.trim() || undefined
  const out = {
    recordingId: clean(mb.recordingId),
    trackId: clean(mb.trackId),
    releaseId: clean(mb.releaseId),
    releaseGroupId: clean(mb.releaseGroupId),
    artistId: clean(mb.artistId),
    workId: clean(mb.workId),
  }
  return Object.values(out).some(Boolean) ? out : undefined
}

function buildTermsOfUse(song: SongForTagging): string | undefined {
  const choice = song.termsOfUse ?? 'all-rights'
  if (choice === 'custom') {
    const custom = song.termsOfUseCustom?.trim()
    return custom || undefined
  }
  return TERMS_OF_USE_PRESETS[choice]
}

function buildTrackPosition(
  song: SongForTagging,
  release: Release | null,
): TrackPosition | undefined {
  if (!release || !release.tracks || release.tracks.length === 0) {
    return { n: 1, total: 1 }
  }
  const trackIds = release.tracks.map((t) => (isResolved<Song>(t) ? t.id : t))
  const idx = trackIds.indexOf(song.id)
  if (idx < 0) return { n: 1, total: 1 }
  return { n: idx + 1, total: trackIds.length }
}

function buildDiscPosition(
  song: SongForTagging,
  release: Release | null,
): TrackPosition {
  const n = song.discNumber ?? 1
  // discCount lives on Release; if not present (e.g. older docs), default to 1.
  const total =
    (release as (Release & { discCount?: number | null }) | null)?.discCount ??
    1
  return { n, total: Math.max(total, n) }
}

function isInstrumentRole(role: string): boolean {
  // Heuristic: anything that doesn't smell like a production verb.
  // Production-style roles get their own TXXX descriptors.
  const r = role.toLowerCase()
  return !/^(mix|master|produc|record|engineer|arrang|compos|writ)/.test(r)
}

function classifyCredits(credits: SongCredit[] | null | undefined) {
  const composers: string[] = []
  const customText: Record<string, string[]> = {}

  const push = (descriptor: string, value: string) => {
    if (!value) return
    customText[descriptor] = customText[descriptor]
      ? [...customText[descriptor], value]
      : [value]
  }

  for (const credit of credits ?? []) {
    const display = credit.name
    if (!display) continue
    const legal = credit.legalName?.trim() || display

    if (credit.category === 'Songwriter') {
      composers.push(legal)
      continue
    }

    if (credit.category === 'Visuals') {
      push('Visuals', display)
      continue
    }

    if (credit.category === 'Special Thanks') {
      push('Special Thanks', display)
      continue
    }

    const roles = (credit.roles ?? [])
      .map((r) => r.role?.trim())
      .filter((r): r is string => Boolean(r))

    if (roles.length === 0) {
      // Generic fallback by category.
      const descriptor =
        credit.category === 'Performer' ? 'Performed By' : 'Produced By'
      push(descriptor, display)
      continue
    }

    for (const role of roles) {
      if (credit.category === 'Producer/Engineer') {
        const lower = role.toLowerCase()
        if (lower.startsWith('mix')) push('Mixed By', display)
        else if (lower.startsWith('master')) push('Mastered By', display)
        else if (lower.startsWith('record') || lower.startsWith('engineer'))
          push('Recorded By', display)
        else if (lower.startsWith('produc')) push('Produced By', display)
        else push(role, display)
      } else if (credit.category === 'Performer') {
        if (isInstrumentRole(role)) {
          push(role, display)
        } else {
          push('Performed By', display)
        }
      } else {
        push(role, display)
      }
    }
  }

  return { composers, customText }
}

function buildGrouping(song: SongForTagging): string | undefined {
  const parts: string[] = []
  const allGenres = tagNames(song.genres)
  // Aggregation order matches `.cursor/rules/song-tag-mapping.mdc` §4.
  // Secondary genres only — primary lives in TCON.
  parts.push(...allGenres.slice(1))
  parts.push(...tagNames(song.subGenres))
  parts.push(...tagNames(song.activities))
  parts.push(...tagNames(song.themes))
  parts.push(...tagNames(song.moods))
  parts.push(...tagNames(song.production))
  parts.push(...tagNames(song.instruments))
  parts.push(...tagNames(song.gear))
  parts.push(...tagNames(song.arrangements))
  parts.push(...tagNames(song.influences))
  parts.push(...tagNames(song.otherTags))

  if (song.changesTempo && song.bpm && song.bpmEnd) {
    parts.push(`Tempo Change: ${song.bpm}→${song.bpmEnd}`)
  }
  if (song.changesKey && song.key && song.keyEnd) {
    const a = normalizeKey(song.key)
    const b = normalizeKey(song.keyEnd)
    if (a && b) parts.push(`Key Change: ${a}→${b}`)
  }

  const filtered = parts.map((p) => p?.trim()).filter(Boolean) as string[]
  if (filtered.length === 0) return undefined
  return filtered.join('; ')
}

function buildCustomText(
  song: SongForTagging,
  creditsCustomText: Record<string, string[]>,
): Record<string, string[]> {
  const out: Record<string, string[]> = { ...creditsCustomText }

  out['TaggingSchemaVersion'] = [TAGGING_SCHEMA_VERSION]

  if (song.iswc) out['ISWC'] = [song.iswc]

  if (song.changesTempo && song.bpm && song.bpmEnd) {
    out['Tempo Range'] = [`${song.bpm}-${song.bpmEnd} BPM`]
  }

  if (song.changesKey && song.key && song.keyEnd) {
    const a = normalizeKey(song.key)
    const b = normalizeKey(song.keyEnd)
    if (a && b) out['Key Range'] = [`${a} → ${b}`]
  }

  return out
}

export type MapSongToTagSpecArgs = {
  song: SongForTagging
  /** Optional resolved cover art bytes. The orchestrator fetches and resizes. */
  coverArt?: TagSpec['coverArt']
  /** Override host for URL frames; defaults to the production constant. */
  hostUrl?: string
}

/**
 * Convert a Payload Song document into the canonical TagSpec described
 * in `.cursor/rules/song-tag-mapping.mdc`.
 *
 * Caller responsibilities:
 *   - Resolve the Song with sufficient `depth` so `genres`, `styles`,
 *     `primaryRelease`, etc. are objects rather than IDs.
 *   - Pre-fetch and resize cover art bytes (the mapper is sync).
 */
export function mapSongToTagSpec({
  song,
  coverArt,
  hostUrl = ARTIST_HOMEPAGE,
}: MapSongToTagSpecArgs): TagSpec {
  const release =
    song.primaryRelease && isResolved<Release>(song.primaryRelease)
      ? song.primaryRelease
      : null

  const year = song.releaseDate
    ? new Date(song.releaseDate).getUTCFullYear()
    : undefined

  const phonogramOwner = song.phonogramCopyrightOwner?.trim() || PRIMARY_ARTIST
  const compositionOwner =
    song.compositionCopyrightOwner?.trim() || PRIMARY_ARTIST

  const { composers, customText: creditsCustomText } = classifyCredits(
    song.credits,
  )

  const allGenres = tagNames(song.genres)
  const primaryGenre = allGenres[0]

  const audioPageUrl = song.slug ? `${hostUrl}/music/${song.slug}` : undefined

  const spec: TagSpec = {
    title: song.title,
    artist: buildArtist(song.featuredArtists),
    albumArtist: PRIMARY_ARTIST,
    album: release?.title ?? undefined,
    trackNumber: buildTrackPosition(song, release),
    discNumber: buildDiscPosition(song, release),
    year,
    genre: primaryGenre,
    coverArt,
    composer: composers.length > 0 ? composers : undefined,
    isrc: song.isrc?.trim() || undefined,
    iswc: song.iswc?.trim() || undefined,
    copyright: buildCopyright(
      year,
      song.compositionType,
      phonogramOwner,
      compositionOwner,
    ),
    publisher: song.publisher?.trim() || 'Michael Zeta',
    termsOfUse: buildTermsOfUse(song),
    customText: buildCustomText(song, creditsCustomText),
    bpm: song.bpm ?? undefined,
    initialKey: normalizeKey(song.key) ?? undefined,
    lyrics: song.lyrics?.trim() || undefined,
    grouping: buildGrouping(song),
    comment: song.comment?.trim() || 'Thank you for being a fan',
    artistUrl: hostUrl,
    audioFileUrl: audioPageUrl,
    paymentUrl: audioPageUrl,
    lengthMs:
      typeof song.duration === 'number'
        ? Math.round(song.duration * 1000)
        : undefined,
    musicBrainz: buildMusicBrainz(song.musicBrainz),
  }

  return spec
}

/** Re-export so consumers don't have to depend on internal types. */
export type { SongForTagging, FeaturedArtist, SongCredit }

// Helper: resolves a coverArt media doc to a fetchable URL. Lives here
// rather than in the writer module so the mapper module stays the
// canonical "Song → write-shape" surface.
export function coverArtMediaUrl(
  song: SongForTagging,
  serverUrl: string,
): string | null {
  const cover = song.coverArt
  if (!cover) return null
  if (!isResolved<Media>(cover)) return null
  if (!cover.url) return null
  return cover.url.startsWith('/') ? `${serverUrl}${cover.url}` : cover.url
}

function mediaInfo(value: number | Media | null | undefined): MasterMediaInfo | null {
  if (!value) return null
  if (!isResolved<Media>(value)) return null
  return {
    collection: 'media',
    id: value.id,
    url: value.url ?? null,
    mimeType: value.mimeType ?? null,
    filename: value.filename ?? null,
  }
}

function gatedInfo(
  value: number | GatedContent | null | undefined,
): MasterMediaInfo | null {
  if (!value) return null
  if (!isResolved<GatedContent>(value)) return null
  return {
    collection: 'gated-content',
    id: value.id,
    url: value.url ?? null,
    mimeType: value.mimeType ?? null,
    filename: value.filename ?? null,
    prefix: value.prefix ?? null,
  }
}

export function masterAudioMediaInfo(
  song: SongForTagging,
): MasterMediaInfo | null {
  return mediaInfo(song.masterAudio)
}

/**
 * All taggable master files for a song, keyed by format. MP3 + FLAC support
 * rich embedded tags via taglib-wasm; WAV is intentionally excluded from the
 * tag-write pipeline because its tag support is minimal and lossy across tools.
 */
export function taggableMasterMedia(song: SongForTagging): MasterMediaInfo[] {
  const out: MasterMediaInfo[] = []
  const mp3 = mediaInfo(song.masterAudio)
  if (mp3) out.push(mp3)
  const flac = gatedInfo(song.masterAudioFlac)
  if (flac) out.push(flac)
  return out
}
