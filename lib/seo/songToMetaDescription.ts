/**
 * Programmatic generator for `<meta name="description">` copy on song
 * pages.
 *
 * Weaves the 11-layer Sonic Tag Ontology (see
 * `.cursor/rules/sonic-tag-ontology.mdc`) into a grammatical,
 * length-capped sentence so search engines and AI chatbots see
 * consistent, intent-rich copy on every track without our having to
 * write meta descriptions by hand.
 *
 * Design contract:
 *   - PURE: no I/O, no DB calls. Caller resolves tag relations to
 *     name[] arrays first (use `resolveTags()` in the song page route).
 *   - DETERMINISTIC: same input → same output. Trivial to unit-test.
 *   - DEFENSIVE: every clause is conditional. Empty layers are
 *     silently dropped; missing required layers fall back to project
 *     constants.
 *   - LENGTH-AWARE: output capped at `maxLength` (default 155 —
 *     Google's desktop snippet sweet spot). When over budget, optional
 *     clauses are dropped in priority order rather than truncating
 *     mid-word.
 *
 * Anti-stuffing caps default to:
 *   moods 2, subGenres 1, genres 1, instruments 2, themes 3,
 *   activities 2, influences 2
 *
 * Override via `options.caps` for niche cases (e.g. landing pages
 * that want every theme listed).
 *
 * Sentence grammar (`buildClassification`, article selection,
 * tagline normalization, etc.) lives in `songCopyComposer.ts` and is
 * shared with the trading-card flavor preset in `songToCardFlavor.ts`.
 */

import { PRIMARY_ARTIST } from '@/lib/branding'
import { formatList } from './formatList'
import {
  buildClassification,
  DEFAULT_META_MAX_LENGTH,
  normalizeTagline,
  softLower,
  take,
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
  genres: 1,
  instruments: 2,
  themes: 3,
  activities: 2,
  influences: 2,
}

/**
 * Optional clauses are dropped in this order when the description
 * exceeds `maxLength`. "subject" and "classification" are NEVER
 * dropped — they're the minimum viable description.
 */
const DROP_PRIORITY = [
  'influences',
  'activities',
  'themes',
  'instruments',
] as const
type DroppableClause = (typeof DROP_PRIORITY)[number]

type Clauses = {
  subject: string
  instruments: string
  themes: string
  activities: string
  influences: string
}

function composeDescription(
  c: Clauses,
  dropped: Set<DroppableClause>,
): string {
  let head = c.subject
  if (!dropped.has('instruments') && c.instruments) {
    head += ` featuring ${c.instruments}`
  }
  if (!dropped.has('themes') && c.themes) {
    head += `, exploring themes of ${c.themes}`
  }

  const sentences: string[] = [`${head}.`]
  if (!dropped.has('activities') && c.activities) {
    sentences.push(`Perfect for ${c.activities}.`)
  }
  if (!dropped.has('influences') && c.influences) {
    sentences.push(`For fans of ${c.influences}.`)
  }

  return sentences.join(' ').replace(/\s+/g, ' ').trim()
}

export function buildSongMetaDescription(
  input: SongDescriptionInput,
  options: SongDescriptionOptions = {},
): string {
  const caps = { ...DEFAULT_CAPS, ...(options.caps ?? {}) }
  const maxLength = options.maxLength ?? DEFAULT_META_MAX_LENGTH
  const artistName = options.artistName ?? PRIMARY_ARTIST
  const defaultGenre = options.defaultGenre ?? 'Rock'

  const moods = take(input.moods, caps.moods)
  const subGenres = take(input.subGenres, caps.subGenres)
  const genres = take(input.genres, caps.genres)
  const instruments = take(input.instruments, caps.instruments)
  const themes = take(input.themes, caps.themes)
  const activities = take(input.activities, caps.activities)
  const influences = take(input.influences, caps.influences)

  const classification = buildClassification({
    moods,
    subGenres,
    genres,
    defaultGenre,
  })

  const tagline = normalizeTagline(input.tagline)
  const subject = tagline
    ? `${tagline}. ${input.title} is ${classification} by ${artistName}`
    : `${input.title} is ${classification} by ${artistName}`

  const clauses: Clauses = {
    subject,
    instruments:
      instruments.length > 0 ? formatList(instruments.map(softLower)) : '',
    themes: themes.length > 0 ? formatList(themes.map(softLower)) : '',
    activities:
      activities.length > 0 ? formatList(activities.map(softLower)) : '',
    influences: influences.length > 0 ? formatList(influences) : '',
  }

  const dropped = new Set<DroppableClause>()
  let result = composeDescription(clauses, dropped)

  for (const clause of DROP_PRIORITY) {
    if (result.length <= maxLength) break
    dropped.add(clause)
    result = composeDescription(clauses, dropped)
  }

  return result
}
