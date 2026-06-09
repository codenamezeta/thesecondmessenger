import type { Song, Tag } from '@/payload-types'
import {
  SONG_TAG_FIELDS,
  getResolvedTags,
  getSongTagField,
  type SongTagField,
} from '@/lib/songs/tagFields'
import { filterSongs } from './applyFilters'
import type { FilterState } from './filterState'

/** A single selectable option inside a facet group on the filter drawer. */
export type FacetOption = {
  /** Tag slug — what we put in the URL. */
  slug: string
  /** Display name — what the user sees on the checkbox label. */
  name: string
  /** Tag id — stable React key. */
  id: number
  /**
   * Number of songs that would match if this tag were added to the
   * current filter state (and the layer's existing filter dropped).
   * `0` means "this option would yield zero results from where you
   * are now"; UI typically dims those rows.
   */
  count: number
  /** True when this slug is currently part of the active filter. */
  selected: boolean
}

export type FacetGroup = {
  field: SongTagField
  options: FacetOption[]
  /** Total songs touched by *any* tag in this layer (post other-layer filters). */
  totalCoverage: number
}

/**
 * Build all 11 facet groups for the drawer, with counts that respect
 * other-layer filters but ignore this layer's own filter — the
 * standard "ANDed across layers and within a layer" facet UX so
 * users can see how each in-layer choice would expand the result set.
 *
 * Pure / O(songs * layers * tags) — fine at our catalog size.
 */
export function computeFacetGroups(
  songs: Song[],
  state: FilterState,
): FacetGroup[] {
  const groups: FacetGroup[] = []

  for (const field of SONG_TAG_FIELDS) {
    // Songs in scope for this layer = songs matching every OTHER filter
    // (every other layer + non-tag filters), but with this layer's
    // tag-slug filter dropped so the layer can show what's reachable.
    const scopedState: FilterState = {
      ...state,
      tags: { ...state.tags, [field]: [] },
    }
    const inScope = filterSongs(songs, scopedState)

    const optionMap = new Map<string, FacetOption>()
    let coverageHits = 0
    for (const song of inScope) {
      const tags = getResolvedTags(getSongTagField(song, field))
      let touched = false
      for (const tag of tags) {
        const slug = tag.slug
        if (!slug) continue
        touched = true
        const existing = optionMap.get(slug)
        if (existing) {
          existing.count += 1
        } else {
          optionMap.set(slug, {
            slug,
            name: tag.name,
            id: tag.id,
            count: 1,
            selected: state.tags[field]?.includes(slug) ?? false,
          })
        }
      }
      if (touched) coverageHits += 1
    }

    const options = Array.from(optionMap.values()).sort((a, b) => {
      // Selected first, then by descending count, then alphabetical.
      if (a.selected !== b.selected) return a.selected ? -1 : 1
      if (a.count !== b.count) return b.count - a.count
      return a.name.localeCompare(b.name)
    })

    groups.push({
      field,
      options,
      totalCoverage: coverageHits,
    })
  }

  return groups
}

/**
 * Find a `Tag` by slug across every layer of every song in the given
 * list. Used by `<ActiveFilterChips />` to render a human-readable
 * label ("Activity: Running") given only the slug from the URL.
 */
export function findTagBySlug(
  songs: Song[],
  field: SongTagField,
  slug: string,
): Tag | null {
  for (const song of songs) {
    const tags = getResolvedTags(getSongTagField(song, field))
    for (const tag of tags) {
      if (tag.slug === slug) return tag
    }
  }
  return null
}
