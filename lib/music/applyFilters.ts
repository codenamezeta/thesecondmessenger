import type { Song } from '@/payload-types'
import {
  SONG_TAG_FIELDS,
  getResolvedTags,
  getSongTagField,
} from '@/lib/songs/tagFields'
import { songMatchesQuery } from '@/lib/songs/searchableTokens'
import type { FilterState, SortMode } from './filterState'

/** True when `song` carries every tag (in `field`) whose slug is in `slugs`. */
function hasAllTagSlugs(
  song: Song,
  field: (typeof SONG_TAG_FIELDS)[number],
  slugs: string[],
): boolean {
  if (slugs.length === 0) return true
  const tags = getResolvedTags(getSongTagField(song, field))
  const songSlugs = new Set(
    tags.map((tag) => tag.slug).filter((slug): slug is string => Boolean(slug)),
  )
  return slugs.every((slug) => songSlugs.has(slug))
}

/**
 * Apply the full filter pipeline to a song list.
 *
 * Order matters for the facet-count helper: the tag-filter pass is
 * partitioned per layer so that, when computing counts for a given
 * layer, callers can cheaply re-run with that layer's filter dropped
 * (see `lib/music/facetCounts.ts`).
 *
 * Filter semantics:
 *   - q:           OR over searchable tokens.
 *   - composition: AND.
 *   - recording:   AND.
 *   - explicit:    AND (hide explicit when set to 'hide').
 *   - tags:        AND across layers; AND within a layer (all selected tags required).
 */
export function filterSongs(songs: Song[], state: FilterState): Song[] {
  const q = state.q.trim().toLowerCase()
  let data = songs

  if (q) data = data.filter((s) => songMatchesQuery(s, q))

  if (state.composition !== 'all') {
    data = data.filter((s) => s.compositionType === state.composition)
  }
  if (state.recording !== 'all') {
    data = data.filter((s) => s.recordingType === state.recording)
  }
  if (state.explicit === 'hide') {
    data = data.filter((s) => !s.isExplicit)
  }

  for (const field of SONG_TAG_FIELDS) {
    const slugs = state.tags[field]
    if (slugs && slugs.length > 0) {
      data = data.filter((s) => hasAllTagSlugs(s, field, slugs))
    }
  }

  return data
}

const releaseTime = (song: Song): number =>
  song.releaseDate ? new Date(song.releaseDate).getTime() : 0

const durationOf = (song: Song): number => song.duration ?? 0

const popularityOf = (song: Song): number => song.popularity ?? 0

const bpmOf = (song: Song): number => song.bpm ?? 0

export function sortSongs(songs: Song[], sort: SortMode): Song[] {
  const out = [...songs]
  switch (sort) {
    case 'az':
      out.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'za':
      out.sort((a, b) => b.title.localeCompare(a.title))
      break
    case 'shortest':
      out.sort((a, b) => durationOf(a) - durationOf(b))
      break
    case 'longest':
      out.sort((a, b) => durationOf(b) - durationOf(a))
      break
    case 'popular':
      out.sort((a, b) => popularityOf(b) - popularityOf(a))
      break
    case 'bpm-low':
      out.sort((a, b) => bpmOf(a) - bpmOf(b))
      break
    case 'bpm-high':
      out.sort((a, b) => bpmOf(b) - bpmOf(a))
      break
    case 'oldest':
      out.sort((a, b) => releaseTime(a) - releaseTime(b))
      break
    case 'newest':
      out.sort((a, b) => releaseTime(b) - releaseTime(a))
      break
    default: {
      const _exhaustive: never = sort
      return _exhaustive
    }
  }
  return out
}

/** Combined filter + sort. */
export function applyFilterState(songs: Song[], state: FilterState): Song[] {
  return sortSongs(filterSongs(songs, state), state.sort)
}
