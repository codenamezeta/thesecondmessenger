import type { Song } from '@/payload-types'
import {
  SONG_TAG_FIELDS,
  getResolvedTags,
  getSongTagField,
  type SongTagField,
} from '@/lib/songs/tagFields'

/**
 * Per-layer overlap weight for the related-songs scoring.
 *
 * Higher = a single shared tag from this layer pushes the candidate
 * higher in the recommendations. Sub-genre matches are the strongest
 * signal of "two songs that scratch the same itch"; broad genre
 * matches are the weakest because almost every song shares a genre.
 *
 * These weights are local to recommendations and don't bind any
 * other consumer of the ontology.
 */
const LAYER_WEIGHTS: Record<SongTagField, number> = {
  subGenres: 5,
  activities: 5,
  influences: 4,
  moods: 3,
  themes: 3,
  arrangements: 2,
  production: 2,
  instruments: 2,
  gear: 1,
  genres: 1,
  otherTags: 1,
}

/**
 * Build a `Set<number>` of tag IDs (per layer) for a song. Used as
 * the lookup target by the scoring loop below.
 */
function tagIdSet(song: Song): Map<SongTagField, Set<number>> {
  const map = new Map<SongTagField, Set<number>>()
  for (const field of SONG_TAG_FIELDS) {
    const ids = new Set<number>()
    const tags = getResolvedTags(getSongTagField(song, field))
    for (const tag of tags) ids.add(tag.id)
    map.set(field, ids)
  }
  return map
}

/**
 * Rank `candidates` by weighted tag-overlap with `subject`. Returns
 * the top `limit` results, sorted by score descending.
 *
 * Pure / O(candidates * layers * tags) — fine at our catalog size.
 */
export function pickRelatedSongs(
  subject: Song,
  candidates: Song[],
  limit = 4,
): Song[] {
  const subjectTags = tagIdSet(subject)

  const scored: Array<{ song: Song; score: number }> = []
  for (const candidate of candidates) {
    if (candidate.id === subject.id) continue
    let score = 0
    for (const field of SONG_TAG_FIELDS) {
      const subjectIds = subjectTags.get(field)
      if (!subjectIds || subjectIds.size === 0) continue
      const candidateTags = getResolvedTags(getSongTagField(candidate, field))
      let layerHits = 0
      for (const tag of candidateTags) {
        if (subjectIds.has(tag.id)) layerHits += 1
      }
      score += layerHits * LAYER_WEIGHTS[field]
    }
    if (score > 0) scored.push({ song: candidate, score })
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    // Tiebreak on release date — newer first.
    const aDate = a.song.releaseDate
      ? new Date(a.song.releaseDate).getTime()
      : 0
    const bDate = b.song.releaseDate
      ? new Date(b.song.releaseDate).getTime()
      : 0
    return bDate - aDate
  })

  return scored.slice(0, limit).map((r) => r.song)
}
