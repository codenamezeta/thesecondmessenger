/**
 * Shared sentence-grammar primitives for song-derived SEO copy.
 *
 * Primary caller: `songToMetaDescription.ts` — `<meta name="description">`
 * copy capped at 155 chars (Google desktop snippet sweet spot).
 *
 * Pure / deterministic / defensive — no I/O, empty layers silently drop.
 */

import { formatList } from './formatList'

/**
 * Resolved tag-name arrays per ontology layer. The `production`,
 * `arrangements`, `gear`, and `otherTags` layers are deliberately
 * absent — they read awkwardly inside a sentence and live in
 * `keywords` on the JSON-LD instead.
 */
export type SongCopyInput = {
  title: string
  /** Optional human-written hook used as a lead-in in meta descriptions. */
  tagline?: string | null
  /** Guest artist display names — composed into the artist clause when present. */
  featuredArtists?: string[] | null
  genres?: string[] | null
  subGenres?: string[] | null
  moods?: string[] | null
  themes?: string[] | null
  instruments?: string[] | null
  activities?: string[] | null
  influences?: string[] | null
}

export type SongCopyCaps = {
  moods?: number
  subGenres?: number
  genres?: number
  instruments?: number
  themes?: number
  activities?: number
  influences?: number
}

/** Default Google snippet sweet spot for `<meta name="description">`. */
export const DEFAULT_META_MAX_LENGTH = 155

/** Max characters kept from a CMS tagline before it becomes the meta lead-in. */
export const DEFAULT_TAGLINE_MAX_LENGTH = 60

/** Take the first `n` non-empty entries from a string array. */
export function take(items: string[] | null | undefined, n: number): string[] {
  if (!items || n <= 0) return []
  return items
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, n)
}

/** Choose 'a' vs 'an' based on the leading sound of the next word. */
export function articleFor(word: string): string {
  const ch = word.trim().charAt(0).toLowerCase()
  return /[aeiou]/.test(ch) ? 'an' : 'a'
}

/**
 * Lowercase a string but preserve hyphens and inner-case so compound
 * common nouns like 'Pop-punk' come out as 'pop-punk', not 'POP-PUNK'.
 */
export function softLower(s: string): string {
  return s.toLowerCase()
}

/** Strip trailing punctuation from a tagline so it composes without ".." artifacts. */
export function normalizeTagline(
  tagline: string | null | undefined,
  maxLength = DEFAULT_TAGLINE_MAX_LENGTH,
): string | null {
  const t = tagline?.trim()
  if (!t) return null
  let normalized = t.replace(/[.!?]+$/u, '').trim()
  if (!normalized) return null
  if (maxLength > 0 && normalized.length > maxLength) {
    normalized = truncateAtWord(normalized, maxLength)
  }
  return normalized || null
}

/** Truncate at the last word boundary, appending an ellipsis when shortened. */
export function truncateAtWord(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  const budget = Math.max(1, maxLength - 1)
  const slice = text.slice(0, budget)
  const lastSpace = slice.lastIndexOf(' ')
  const cut =
    lastSpace > budget * 0.5 ? slice.slice(0, lastSpace) : slice.slice(0, budget)
  return `${cut.trim()}…`
}

/**
 * Build the classification fragment ("an energetic pop-punk rock track"
 * or just "an energetic track" if no genre/sub-genre is known).
 *
 * Anti-stutter: if the sub-genre name already contains the broad genre
 * word ("Hard Rock" contains "Rock"; "Pop-punk" contains "Pop"), the
 * genre is dropped from the visible fragment to avoid "Hard Rock Rock".
 */
export function buildClassification(args: {
  moods: string[]
  subGenres: string[]
  genres: string[]
  defaultGenre: string
  /** Trailing noun. Default 'track'. */
  noun?: string
}): string {
  const noun = args.noun ?? 'track'
  const moodWord =
    args.moods.length > 0 ? formatList(args.moods.map(softLower)) : ''

  const subRaw = args.subGenres[0]?.trim() ?? ''
  const genreRaw = args.genres[0]?.trim() ?? ''
  const subLower = subRaw.toLowerCase()
  const genreLower = genreRaw.toLowerCase()

  let subGenreWord = subRaw
  let genreWord: string
  if (genreRaw && subLower && subLower.includes(genreLower)) {
    genreWord = ''
  } else if (genreRaw) {
    genreWord = genreRaw
  } else if (subRaw) {
    genreWord = ''
  } else {
    genreWord = args.defaultGenre
  }
  if (subGenreWord) subGenreWord = subGenreWord.toLowerCase()
  const genreOut = genreWord ? genreWord.toLowerCase() : ''

  const descriptors = [moodWord, subGenreWord, genreOut]
    .map((w) => w.trim())
    .filter(Boolean)

  const tail = noun ? ` ${noun}` : ''
  if (descriptors.length === 0) {
    return noun ? `a ${noun}` : ''
  }

  const article = articleFor(descriptors[0])
  return `${article} ${descriptors.join(' ')}${tail}`
}
