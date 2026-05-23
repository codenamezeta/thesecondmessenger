/**
 * Shared sentence-grammar primitives for song-derived copy generators.
 *
 * Two callers use this:
 *   - `songToMetaDescription.ts` — long-form `<meta name="description">`
 *     copy capped at 155 chars (Google desktop snippet sweet spot).
 *   - `songToCardFlavor.ts` — short trading-card flavor line under the
 *     title on `SongCard`, capped at ~90 chars.
 *
 * Both presets share these primitives so the wording stays consistent
 * (e.g. the "Hard Rock Rock" anti-stutter rule is enforced once, here).
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
  /** Optional human-written hook. Meta uses it as a lead-in; card preset ignores it. */
  tagline?: string | null
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

/** Default soft cap for in-card flavor lines. Sized to fit one ~90-char line on the card data panel without wrapping awkwardly on common viewport widths. */
export const DEFAULT_CARD_MAX_LENGTH = 90

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
): string | null {
  const t = tagline?.trim()
  if (!t) return null
  return t.replace(/[.!?]+$/u, '').trim() || null
}

/**
 * Build the classification fragment ("an energetic pop-punk rock track"
 * or just "an energetic track" if no genre/sub-genre is known).
 *
 * Anti-stutter: if the sub-genre name already contains the broad genre
 * word ("Hard Rock" contains "Rock"; "Pop-punk" contains "Pop"), the
 * genre is dropped from the visible fragment to avoid "Hard Rock Rock".
 *
 * Set `noun = ''` to omit the trailing "track" word — useful for the
 * card preset which wants a tighter fragment ("an energetic pop-punk
 * for running" rather than "an energetic pop-punk track for running").
 */
export function buildClassification(args: {
  moods: string[]
  subGenres: string[]
  genres: string[]
  defaultGenre: string
  /** Trailing noun. Default 'track'. Pass '' to omit. */
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
