import type { Song } from '@/payload-types'
import { SONG_TAG_FIELDS, getSongTagField, getTagNames } from './tagFields'

/**
 * Build a single lowercase haystack string for a Song. Used by the
 * `/music` archive's client-side search to give a single
 * `.includes(query)` check across everything a user might reasonably
 * type when looking for a track.
 *
 * Covers:
 *   - title, tagline, lyrics
 *   - identifiers a user might paste (ISRC, key)
 *   - composition + recording type words ("cover", "live", "demo")
 *   - all 11 tag-name layers (genres, sub-genres, activities, themes,
 *     moods, production, instruments, gear, arrangements, influences,
 *     other)
 *   - credit display names
 *
 * Returns lowercase. Caller is expected to lowercase the query once
 * and call `.includes()` — keeps the hot loop tight.
 */
export function songSearchableTokens(song: Song): string {
  const parts: string[] = []

  if (song.title) parts.push(song.title)
  if (song.tagline) parts.push(song.tagline)
  if (song.lyrics) parts.push(song.lyrics)
  if (song.isrc) parts.push(song.isrc)
  if (song.key) parts.push(song.key)
  if (song.compositionType) parts.push(song.compositionType)
  if (song.recordingType) parts.push(song.recordingType)

  for (const field of SONG_TAG_FIELDS) {
    const names = getTagNames(getSongTagField(song, field))
    if (names.length > 0) parts.push(names.join(' '))
  }

  for (const credit of song.credits ?? []) {
    if (credit.name) parts.push(credit.name)
  }

  return parts.join(' ').toLowerCase()
}

/**
 * Predicate form: does `song` match the given (already-lowercased)
 * query? Memoization is intentionally left to the caller, since the
 * `/music` page derives results inside a `useMemo` block where the
 * full song list is already in scope.
 */
export function songMatchesQuery(song: Song, lowercaseQuery: string): boolean {
  if (!lowercaseQuery) return true
  return songSearchableTokens(song).includes(lowercaseQuery)
}
