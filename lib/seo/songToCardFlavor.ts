/**
 * Trading-card flavor caption generator for `SongCard`.
 *
 * Same 11-layer ontology as `songToMetaDescription.ts` but a much
 * tighter sentence template: no title, no artist, optional clauses
 * trimmed aggressively, capped at ~90 chars so the line fits on one
 * row of the card data panel without wrapping awkwardly.
 *
 * Examples (from real ontology layers):
 *
 *   "An energetic pop-punk for running. For fans of Blink-182."
 *   "A dark synthwave for late-night drives."
 *   "A melancholy folk song about heartbreak."
 *
 * Pure / deterministic. Returns `null` when there isn't enough data
 * to compose anything coherent — caller decides whether to fall back
 * to the human `tagline`.
 */

import { formatList } from './formatList'
import {
  buildClassification,
  DEFAULT_CARD_MAX_LENGTH,
  softLower,
  take,
  type SongCopyCaps,
  type SongCopyInput,
} from './songCopyComposer'

export type SongCardFlavorInput = SongCopyInput

export type SongCardFlavorOptions = {
  /** Soft cap on final length. Optional clauses drop until the result fits. Default 90. */
  maxLength?: number
  /** Per-layer item limits. Defaults documented in `DEFAULT_CARD_CAPS`. */
  caps?: SongCopyCaps
  /** Default genre word when both `genres` and `subGenres` are empty. */
  defaultGenre?: string
}

/**
 * Card flavor caps are tighter than meta caps — one mood / one
 * sub-genre / one genre, plus the most distinguishing themes,
 * activities, and influences.
 *
 * Instruments default to 0 because the card already shows an
 * instrument chip in the chip strip; repeating it in flavor copy
 * would feel redundant.
 */
const DEFAULT_CARD_CAPS: Required<SongCopyCaps> = {
  moods: 1,
  subGenres: 1,
  genres: 1,
  instruments: 0,
  themes: 1,
  activities: 2,
  influences: 1,
}

/**
 * Drop priority for the card preset. Order is "least informative
 * first" — themes go before activities because activities are
 * typically the highest search-intent layer.
 */
const DROP_PRIORITY = ['themes', 'influences', 'activities'] as const
type DroppableClause = (typeof DROP_PRIORITY)[number]

type Clauses = {
  /** "An energetic pop-punk" or "a dark synthwave" — no trailing noun. */
  classification: string
  activities: string
  themes: string
  influences: string
}

function composeCardFlavor(
  c: Clauses,
  dropped: Set<DroppableClause>,
): string | null {
  if (!c.classification) return null

  let head = c.classification
  if (head) {
    head = head.charAt(0).toUpperCase() + head.slice(1)
  }
  if (!dropped.has('activities') && c.activities) {
    head += ` for ${c.activities}`
  } else if (!dropped.has('themes') && c.themes) {
    head += ` about ${c.themes}`
  }

  const sentences: string[] = [`${head}.`]
  if (!dropped.has('influences') && c.influences) {
    sentences.push(`For fans of ${c.influences}.`)
  }

  return sentences.join(' ').replace(/\s+/g, ' ').trim()
}

export function buildSongCardFlavor(
  input: SongCardFlavorInput,
  options: SongCardFlavorOptions = {},
): string | null {
  const caps = { ...DEFAULT_CARD_CAPS, ...(options.caps ?? {}) }
  const maxLength = options.maxLength ?? DEFAULT_CARD_MAX_LENGTH
  const defaultGenre = options.defaultGenre ?? 'song'

  const moods = take(input.moods, caps.moods)
  const subGenres = take(input.subGenres, caps.subGenres)
  const genres = take(input.genres, caps.genres)
  const themes = take(input.themes, caps.themes)
  const activities = take(input.activities, caps.activities)
  const influences = take(input.influences, caps.influences)

  // No `noun` so the fragment ends with the genre word itself
  // ("an energetic pop-punk") — feels more like card lore than prose.
  const classification = buildClassification({
    moods,
    subGenres,
    genres,
    defaultGenre,
    noun: '',
  })

  // If we couldn't even compose a classification, give up — caller
  // will fall back to the human tagline or render nothing.
  if (!classification || classification.trim() === defaultGenre) {
    if (
      moods.length === 0 &&
      subGenres.length === 0 &&
      genres.length === 0 &&
      activities.length === 0 &&
      themes.length === 0 &&
      influences.length === 0
    ) {
      return null
    }
  }

  const clauses: Clauses = {
    classification,
    activities:
      activities.length > 0 ? formatList(activities.map(softLower)) : '',
    themes: themes.length > 0 ? formatList(themes.map(softLower)) : '',
    influences: influences.length > 0 ? formatList(influences) : '',
  }

  const dropped = new Set<DroppableClause>()
  let result = composeCardFlavor(clauses, dropped)

  for (const clause of DROP_PRIORITY) {
    if (result === null) return null
    if (result.length <= maxLength) break
    dropped.add(clause)
    result = composeCardFlavor(clauses, dropped)
  }

  return result
}
