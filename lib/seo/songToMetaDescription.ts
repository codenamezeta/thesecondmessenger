import { formatList } from './formatList'

/**
 * Programmatic generator for `<meta name="description">` copy on song pages.
 *
 * Weaves the 11-layer Sonic Tag Ontology (see `.cursor/rules/sonic-tag-ontology.mdc`)
 * into a grammatical, length-capped sentence so search engines and AI
 * chatbots see consistent, intent-rich copy on every track without our
 * having to write meta descriptions by hand.
 *
 * Design contract:
 *   - PURE: no I/O, no DB calls. Caller resolves tag relations to name[]
 *     arrays first (use `resolveTags()` in the song page route).
 *   - DETERMINISTIC: same input → same output. Trivial to unit-test.
 *   - DEFENSIVE: every clause is conditional. Empty layers are silently
 *     dropped; missing required layers fall back to project constants.
 *   - LENGTH-AWARE: output capped at `maxLength` (default 155 — Google's
 *     desktop snippet sweet spot). When over budget, optional clauses
 *     are dropped in priority order rather than truncating mid-word.
 *
 * Anti-stuffing caps default to:
 *   moods 2, subGenres 1, genres 1, instruments 2, themes 3,
 *   activities 2, influences 2
 *
 * Override via `options.caps` for niche cases (e.g. landing pages that
 * want every theme listed).
 */

import { PRIMARY_ARTIST } from '@/lib/branding'

export type SongDescriptionInput = {
  title: string
  /** Optional human-written hook. If present it leads the description and
   *  the auto-generated robot sentence follows it. */
  tagline?: string | null
  // The 11 ontology layers, expressed as resolved tag-name arrays.
  // production / arrangements / gear / otherTags are deliberately omitted
  // from the default template — they live in `keywords` and JSON-LD instead
  // because they read awkwardly inside a sentence.
  genres?: string[] | null
  subGenres?: string[] | null
  moods?: string[] | null
  themes?: string[] | null
  instruments?: string[] | null
  activities?: string[] | null
  influences?: string[] | null
}

export type SongDescriptionCaps = {
  moods?: number
  subGenres?: number
  genres?: number
  instruments?: number
  themes?: number
  activities?: number
  influences?: number
}

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

const DEFAULT_MAX_LENGTH = 155

/**
 * Optional clauses are dropped in this order when the description exceeds
 * `maxLength`. "subject" and "classification" are NEVER dropped — they're
 * the minimum viable description.
 */
const DROP_PRIORITY = [
  'influences',
  'activities',
  'themes',
  'instruments',
] as const
type DroppableClause = (typeof DROP_PRIORITY)[number]

function take(items: string[] | null | undefined, n: number): string[] {
  if (!items || n <= 0) return []
  return items.filter((s): s is string => typeof s === 'string' && s.trim().length > 0).slice(0, n)
}

/** Choose 'a' vs 'an' based on the leading sound of the next word. */
function articleFor(word: string): string {
  const ch = word.trim().charAt(0).toLowerCase()
  return /[aeiou]/.test(ch) ? 'an' : 'a'
}

/** Lowercase a string but preserve hyphenated or inner-case proper nouns
 *  (e.g. keep 'Pop-punk' lowercase as 'pop-punk', not 'POP-PUNK'). */
function softLower(s: string): string {
  return s.toLowerCase()
}

/**
 * Build the classification fragment ("an energetic pop-punk rock track"
 * or just "an energetic track" if no genre/sub-genre is known).
 *
 * If the sub-genre name already contains the broad genre word
 * ("Hard Rock" contains "Rock"; "Pop-punk" contains "Pop"), the genre
 * is dropped from the visible fragment to avoid stutter ("Hard Rock Rock").
 */
function buildClassification(args: {
  moods: string[]
  subGenres: string[]
  genres: string[]
  defaultGenre: string
}): string {
  const moodWord = args.moods.length > 0 ? formatList(args.moods.map(softLower)) : ''

  const subRaw = args.subGenres[0]?.trim() ?? ''
  const genreRaw = args.genres[0]?.trim() ?? ''
  const subLower = subRaw.toLowerCase()
  const genreLower = genreRaw.toLowerCase()

  let subGenreWord = subRaw
  let genreWord: string
  if (genreRaw && subLower && subLower.includes(genreLower)) {
    // Sub-genre already implies the genre — only show the sub-genre.
    genreWord = ''
  } else if (genreRaw) {
    genreWord = genreRaw
  } else if (subRaw) {
    genreWord = ''
  } else {
    genreWord = args.defaultGenre
  }
  // Lowercase descriptive sub-genres for sentence-case copy. Sub-genre names
  // are usually compound common nouns ("pop-punk", "synthwave"), not proper.
  if (subGenreWord) subGenreWord = subGenreWord.toLowerCase()
  const genreOut = genreWord ? genreWord.toLowerCase() : ''

  const descriptors = [moodWord, subGenreWord, genreOut]
    .map((w) => w.trim())
    .filter(Boolean)

  if (descriptors.length === 0) return 'a track'

  const article = articleFor(descriptors[0])
  return `${article} ${descriptors.join(' ')} track`
}

type Clauses = {
  /** "Title is a/an … track by Artist" or "{tagline} a/an … track by Artist" */
  subject: string
  /** Comma fragment appended to subject ("featuring …"). */
  instruments: string
  /** Comma fragment appended to subject ("exploring themes of …"). */
  themes: string
  /** Standalone sentence ("Perfect for …."). */
  activities: string
  /** Standalone sentence ("For fans of …."). */
  influences: string
}

function composeDescription(c: Clauses, dropped: Set<DroppableClause>): string {
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

/** Strip a trailing period from a tagline so we don't end up with ".." in copy. */
function normalizeTagline(tagline: string | null | undefined): string | null {
  const t = tagline?.trim()
  if (!t) return null
  return t.replace(/[.!?]+$/u, '').trim() || null
}

export function buildSongMetaDescription(
  input: SongDescriptionInput,
  options: SongDescriptionOptions = {},
): string {
  const caps = { ...DEFAULT_CAPS, ...(options.caps ?? {}) }
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH
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

  // Subject sentence. classification already starts with "a "/"an ".
  const tagline = normalizeTagline(input.tagline)
  const subject = tagline
    ? `${tagline}. ${input.title} is ${classification} by ${artistName}`
    : `${input.title} is ${classification} by ${artistName}`

  const clauses: Clauses = {
    subject,
    instruments: instruments.length > 0 ? formatList(instruments.map(softLower)) : '',
    themes: themes.length > 0 ? formatList(themes.map(softLower)) : '',
    activities: activities.length > 0 ? formatList(activities.map(softLower)) : '',
    // Influences keep their original case — they're proper nouns ("Blink-182").
    influences: influences.length > 0 ? formatList(influences) : '',
  }

  // Start with the full description; drop optional clauses one at a time
  // until we fit under `maxLength`. Subject + classification are never dropped.
  const dropped = new Set<DroppableClause>()
  let result = composeDescription(clauses, dropped)

  for (const clause of DROP_PRIORITY) {
    if (result.length <= maxLength) break
    dropped.add(clause)
    result = composeDescription(clauses, dropped)
  }

  return result
}
