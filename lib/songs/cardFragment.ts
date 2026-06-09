import type { Song } from '@/payload-types'
import { getSongTagField, getTagNames } from './tagFields'

/**
 * Non-prose "dossier" fragment used as the SongCard flavor line when a
 * song has no human-written `tagline`. Joins distinguishing tag fragments
 * with a middot — no sentence grammar, so it cannot render broken prose
 * ("a energetic", bad list commas, etc.).
 *
 *   "ENERGETIC · POP-PUNK · FOR RUNNING · RIYL BLINK-182"
 *
 * Returns `null` when there isn't enough signal to be worth showing.
 */

const SEP = ' · '

function first(song: Song, field: Parameters<typeof getSongTagField>[1]): string | null {
  return getTagNames(getSongTagField(song, field))[0] ?? null
}

export function buildCardFragment(song: Song, maxParts = 4): string | null {
  const parts: string[] = []

  const mood = first(song, 'moods')
  if (mood) parts.push(mood.toUpperCase())

  const subGenre = first(song, 'subGenres') ?? first(song, 'genres')
  if (subGenre) parts.push(subGenre.toUpperCase())

  const activity = first(song, 'activities')
  if (activity) parts.push(`FOR ${activity.toUpperCase()}`)

  const influence = first(song, 'influences')
  if (influence) parts.push(`RIYL ${influence.toUpperCase()}`)

  // Backfill with a theme if we're thin on signal.
  if (parts.length < 2) {
    const theme = first(song, 'themes')
    if (theme) parts.push(`ON ${theme.toUpperCase()}`)
  }

  if (parts.length === 0) return null
  return parts.slice(0, maxParts).join(SEP)
}
