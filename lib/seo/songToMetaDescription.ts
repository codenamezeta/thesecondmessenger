/**
 * Programmatic generator for `<meta name="description">` copy on song
 * pages.
 *
 * Weaves the Sonic Tag Ontology (see `.cursor/rules/sonic-tag-ontology.mdc`)
 * into a grammatical, length-capped description optimized for search
 * intent. Taglines are UI-only and are not used here — every character
 * is reserved for tags and technical metadata.
 *
 * Design contract:
 *   - PURE: no I/O, no DB calls. Caller resolves tag relations to
 *     name[] arrays first (use `resolveTags()` in the song page route).
 *   - DETERMINISTIC: same input → same output. Trivial to unit-test.
 *   - DEFENSIVE: every clause is conditional. Empty layers are
 *     silently dropped; missing required layers fall back to project
 *     constants.
 *   - LENGTH-AWARE: output capped at `maxLength` (default 155).
 *     Optional clauses drop in priority order; hard-truncates as a
 *     last resort.
 *
 * Default per-layer caps:
 *   moods 2, subGenres 1, genres 2, instruments 3, themes 3,
 *   activities 2, influences 2, production 2, arrangements 2
 *
 * Sentence grammar lives in `songCopyComposer.ts`.
 */

import { PRIMARY_ARTIST } from '@/lib/branding'
import { formatList } from './formatList'
import {
  buildClassification,
  DEFAULT_META_MAX_LENGTH,
  softLower,
  take,
  truncateAtWord,
  type SongCopyCaps,
  type SongCopyInput,
} from './songCopyComposer'

export type SongDescriptionInput = SongCopyInput
export type SongDescriptionCaps = SongCopyCaps

export type SongDescriptionOptions = {
  /** Soft cap on final length. Optional clauses drop until the result fits. Default 155. */
  maxLength?: number
  /** Per-layer item limits. Defaults documented in module header. */
  caps?: SongDescriptionCaps
  /** Override the artist name used in the subject clause. */
  artistName?: string
  /** Default genre word when both `genres` and `subGenres` are empty. */
  defaultGenre?: string
}

const DEFAULT_CAPS: Required<SongDescriptionCaps> = {
  moods: 2,
  subGenres: 1,
  genres: 2,
  instruments: 3,
  themes: 3,
  activities: 2,
  influences: 2,
  production: 2,
  arrangements: 2,
}

/**
 * Optional clauses drop in this order when over `maxLength`.
 * The opening subject + classification line is never dropped.
 */
const DROP_PRIORITY = [
  'technical',
  'influences',
  'activities',
  'arrangements',
  'production',
  'themes',
  'instruments',
  'secondaryTags',
] as const
type DroppableClause = (typeof DROP_PRIORITY)[number]

type Clauses = {
  subject: string
  secondaryTags: string
  instruments: string
  production: string
  arrangements: string
  themes: string
  activities: string
  influences: string
  technical: string
}

function buildSecondaryTags(
  genres: string[],
  subGenres: string[],
): string {
  const extras = [
    ...genres.slice(1).map(softLower),
    ...subGenres.slice(1).map(softLower),
  ].filter(Boolean)
  return extras.length > 0 ? formatList(extras) : ''
}

function buildTechnicalClause(bpm?: number | null, key?: string | null): string {
  const parts: string[] = []
  if (typeof bpm === 'number' && bpm > 0) {
    parts.push(`${Math.round(bpm)} BPM`)
  }
  const normalizedKey = key?.trim()
  if (normalizedKey) {
    parts.push(normalizedKey)
  }
  if (parts.length === 0) return ''
  return parts.join(', ')
}

function composeDescription(
  c: Clauses,
  dropped: Set<DroppableClause>,
): string {
  let head = c.subject
  if (!dropped.has('secondaryTags') && c.secondaryTags) {
    head += `, blending ${c.secondaryTags}`
  }
  if (!dropped.has('instruments') && c.instruments) {
    head += `, featuring ${c.instruments}`
  }
  if (!dropped.has('production') && c.production) {
    head += ` with ${c.production} production`
  }
  if (!dropped.has('themes') && c.themes) {
    head += `, exploring themes of ${c.themes}`
  }

  const sentences: string[] = [`${head}.`]

  if (!dropped.has('arrangements') && c.arrangements) {
    sentences.push(`Includes ${c.arrangements}.`)
  }
  if (!dropped.has('activities') && c.activities) {
    sentences.push(`Perfect for ${c.activities}.`)
  }
  if (!dropped.has('influences') && c.influences) {
    sentences.push(`For fans of ${c.influences}.`)
  }
  if (!dropped.has('technical') && c.technical) {
    sentences.push(`${c.technical}.`)
  }

  return sentences.join(' ').replace(/\s+/g, ' ').trim()
}

function buildArtistClause(
  artistName: string,
  featuredArtists: string[],
): string {
  if (featuredArtists.length === 0) return artistName
  return `${artistName} feat. ${formatList(featuredArtists)}`
}

export function buildSongPageTitle(
  title: string,
  featuredArtists?: string[] | null,
  artistName = PRIMARY_ARTIST,
): string {
  const featured = take(featuredArtists, 3)
  const featSuffix =
    featured.length > 0 ? ` (feat. ${formatList(featured)})` : ''
  return `${title}${featSuffix} | ${artistName}`
}

export function buildSongMetaDescription(
  input: SongDescriptionInput,
  options: SongDescriptionOptions = {},
): string {
  const caps = { ...DEFAULT_CAPS, ...(options.caps ?? {}) }
  const maxLength = options.maxLength ?? DEFAULT_META_MAX_LENGTH
  const artistName = options.artistName ?? PRIMARY_ARTIST
  const defaultGenre = options.defaultGenre ?? 'Rock'
  const featuredArtists = take(input.featuredArtists, 3)

  const moods = take(input.moods, caps.moods)
  const subGenres = take(input.subGenres, caps.subGenres)
  const genres = take(input.genres, caps.genres)
  const instruments = take(input.instruments, caps.instruments)
  const themes = take(input.themes, caps.themes)
  const activities = take(input.activities, caps.activities)
  const influences = take(input.influences, caps.influences)
  const production = take(input.production, caps.production)
  const arrangements = take(input.arrangements, caps.arrangements)

  const classification = buildClassification({
    moods,
    subGenres,
    genres,
    defaultGenre,
  })

  const artistClause = buildArtistClause(artistName, featuredArtists)
  const subject = `${input.title} is ${classification} by ${artistClause}`

  const clauses: Clauses = {
    subject,
    secondaryTags: buildSecondaryTags(genres, subGenres),
    instruments:
      instruments.length > 0 ? formatList(instruments.map(softLower)) : '',
    production:
      production.length > 0 ? formatList(production.map(softLower)) : '',
    arrangements:
      arrangements.length > 0 ? formatList(arrangements.map(softLower)) : '',
    themes: themes.length > 0 ? formatList(themes.map(softLower)) : '',
    activities:
      activities.length > 0 ? formatList(activities.map(softLower)) : '',
    influences: influences.length > 0 ? formatList(influences) : '',
    technical: buildTechnicalClause(input.bpm, input.key),
  }

  const dropped = new Set<DroppableClause>()
  let result = composeDescription(clauses, dropped)

  for (const clause of DROP_PRIORITY) {
    if (result.length <= maxLength) break
    dropped.add(clause)
    result = composeDescription(clauses, dropped)
  }

  if (result.length > maxLength) {
    result = truncateAtWord(result, maxLength)
  }

  return result
}
