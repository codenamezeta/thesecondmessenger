import type { Media, Release, Song, Tag } from '@/payload-types'
import { ARTIST_HOMEPAGE, PRIMARY_ARTIST } from '@/lib/branding'

/**
 * Generate a `MusicRecording` JSON-LD object for a Song. The same CMS
 * fields that drive ID3 tag writing (see `mapSongToTagSpec`) drive the
 * structured data here so the website, the audio file, and the SEO
 * payload all agree.
 *
 * Drops any field whose source is empty.
 *
 * Caller should:
 *   - Pass a Song hydrated to depth ≥ 2 (so genres, primaryRelease,
 *     credits resolve to objects).
 *   - Embed the result inside a `<script type="application/ld+json">`
 *     tag in the song's page.
 */

type FeaturedArtist = { name: string }
type SongCredit = NonNullable<Song['credits']>[number] & {
  legalName?: string | null
}
type SongForSeo = Omit<Song, 'credits'> & {
  featuredArtists?: FeaturedArtist[] | null
  primaryRelease?: number | Release | null
  phonogramCopyrightOwner?: string | null
  compositionCopyrightOwner?: string | null
  publisher?: string | null
  credits?: SongCredit[] | null
}

type Person = {
  '@type': 'Person'
  name: string
}
type MusicGroup = {
  '@type': 'MusicGroup'
  name: string
  url?: string
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

function isoDuration(seconds: number | null | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined
  const total = Math.round(seconds)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `PT${m}M${s}S`
}

function albumProductionType(
  type: Release['type'] | undefined,
): string | undefined {
  if (!type) return undefined
  switch (type) {
    case 'Single':
      return 'https://schema.org/SingleMusicAlbumProductionType'
    case 'EP':
      return 'https://schema.org/EPMusicAlbumProductionType'
    case 'Album':
      return 'https://schema.org/StudioMusicAlbumProductionType'
    case 'Double':
    case 'Other':
      return 'https://schema.org/StudioMusicAlbumProductionType'
    default:
      return undefined
  }
}

function buildArtists(song: SongForSeo): MusicGroup[] {
  const out: MusicGroup[] = [
    { '@type': 'MusicGroup', name: PRIMARY_ARTIST, url: ARTIST_HOMEPAGE },
  ]
  for (const f of song.featuredArtists ?? []) {
    if (f.name) out.push({ '@type': 'MusicGroup', name: f.name })
  }
  return out
}

function buildPeople(
  credits: SongCredit[] | null | undefined,
  predicate: (c: SongCredit) => boolean,
): Person[] {
  if (!credits) return []
  const seen = new Set<string>()
  const out: Person[] = []
  for (const c of credits) {
    if (!predicate(c)) continue
    const name = c.legalName?.trim() || c.name?.trim()
    if (!name || seen.has(name)) continue
    seen.add(name)
    out.push({ '@type': 'Person', name })
  }
  return out
}

function buildImageUrl(
  song: SongForSeo,
  serverUrl: string,
): string | undefined {
  const cover = song.coverArt
  if (!cover || !isResolved<Media>(cover) || !cover.url) return undefined
  return cover.url.startsWith('/') ? `${serverUrl}${cover.url}` : cover.url
}

function buildStreamingTargets(song: SongForSeo): string[] {
  const links = song.streamingLinks ?? []
  return links.map((l) => l.url).filter((u): u is string => Boolean(u))
}

export type SongToStructuredDataArgs = {
  song: SongForSeo
  /** Production server URL, used to absolutize relative media URLs. */
  serverUrl?: string
}

export function songToStructuredData({
  song,
  serverUrl = ARTIST_HOMEPAGE,
}: SongToStructuredDataArgs): Record<string, unknown> {
  const release =
    song.primaryRelease && isResolved<Release>(song.primaryRelease)
      ? song.primaryRelease
      : null

  const composers = buildPeople(
    song.credits,
    (c) => c.category === 'Songwriter',
  )
  const producers = buildPeople(
    song.credits,
    (c) => c.category === 'Producer/Engineer',
  )

  const year = song.releaseDate
    ? new Date(song.releaseDate).getUTCFullYear()
    : undefined

  const url = song.slug ? `${serverUrl}/music/${song.slug}` : undefined

  const allGenres = tagNames(song.genres)

  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url,
    byArtist: buildArtists(song),
    isrcCode: song.isrc ?? undefined,
    iswcCode: song.iswc ?? undefined,
    duration: isoDuration(song.duration),
    genre: allGenres.length > 0 ? allGenres : undefined,
    composer: composers.length > 0 ? composers : undefined,
    producer: producers.length > 0 ? producers : undefined,
    datePublished: song.releaseDate
      ? new Date(song.releaseDate).toISOString().slice(0, 10)
      : undefined,
    image: buildImageUrl(song, serverUrl),
    copyrightYear: year,
    copyrightHolder: song.phonogramCopyrightOwner
      ? { '@type': 'Person', name: song.phonogramCopyrightOwner }
      : { '@type': 'Person', name: 'Michael Zeta' },
  }

  if (release) {
    data.inAlbum = {
      '@type': 'MusicAlbum',
      name: release.title,
      datePublished: release.releaseDate
        ? new Date(release.releaseDate).toISOString().slice(0, 10)
        : undefined,
      albumProductionType: albumProductionType(release.type),
    }
  }

  if (composers.length > 0 || song.iswc) {
    data.recordingOf = {
      '@type': 'MusicComposition',
      name: song.title,
      composer: composers.length > 0 ? composers : undefined,
      iswcCode: song.iswc ?? undefined,
    }
  }

  if (song.lyrics) {
    data.lyrics = {
      '@type': 'CreativeWork',
      text: song.lyrics,
    }
  }

  const targets = buildStreamingTargets(song)
  if (targets.length > 0) {
    data.potentialAction = {
      '@type': 'ListenAction',
      target: targets,
    }
  }

  // Drop undefined values for a clean payload.
  return prune(data)
}

function prune<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      const cleaned = v
        .map((item) =>
          item && typeof item === 'object' && !Array.isArray(item)
            ? prune(item as Record<string, unknown>)
            : item,
        )
        .filter((item) => item !== undefined && item !== null)
      if (cleaned.length > 0) out[k] = cleaned
      continue
    }
    if (typeof v === 'object') {
      const cleaned = prune(v as Record<string, unknown>)
      if (Object.keys(cleaned).length > 0) out[k] = cleaned
      continue
    }
    out[k] = v
  }
  return out as T
}
