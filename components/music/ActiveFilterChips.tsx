'use client'

import { X } from 'lucide-react'
import type { Song } from '@/payload-types'
import { cn } from '@/utilities/ui'
import {
  FIELD_LABELS,
  SONG_TAG_FIELDS,
  type SongTagField,
} from '@/lib/songs/tagFields'
import {
  activeTagFilterCount,
  type FilterState,
} from '@/lib/music/filterState'
import { findTagBySlug } from '@/lib/music/facetCounts'

interface ActiveFilterChipsProps {
  state: FilterState
  /** Source of song data for resolving slug → display name. */
  songs: Song[]
  onRemoveTag: (field: SongTagField, slug: string) => void
  onResetComposition: () => void
  onResetRecording: () => void
  onResetExplicit: () => void
  onClearAll: () => void
  onClearQuery: () => void
}

type Chip = {
  key: string
  label: string
  prefix: string
  remove: () => void
}

/**
 * Renders the bar above the result grid summarizing every currently-
 * active filter as a removable chip. Hidden when no filters are set.
 *
 * Each chip lists the layer prefix ("Activity:") so users always see
 * which dimension they're filtering on.
 */
export const ActiveFilterChips = ({
  state,
  songs,
  onRemoveTag,
  onResetComposition,
  onResetRecording,
  onResetExplicit,
  onClearAll,
  onClearQuery,
}: ActiveFilterChipsProps) => {
  const chips: Chip[] = []

  if (state.q) {
    chips.push({
      key: 'q',
      prefix: 'Search',
      label: state.q,
      remove: onClearQuery,
    })
  }

  if (state.composition !== 'all') {
    chips.push({
      key: 'composition',
      prefix: 'Composition',
      label: state.composition,
      remove: onResetComposition,
    })
  }
  if (state.recording !== 'all') {
    chips.push({
      key: 'recording',
      prefix: 'Recording',
      label: state.recording,
      remove: onResetRecording,
    })
  }
  if (state.explicit === 'hide') {
    chips.push({
      key: 'explicit',
      prefix: 'Explicit',
      label: 'Hidden',
      remove: onResetExplicit,
    })
  }

  for (const field of SONG_TAG_FIELDS) {
    const slugs = state.tags[field] ?? []
    for (const slug of slugs) {
      const tag = findTagBySlug(songs, field, slug)
      const label = tag?.name ?? slug
      chips.push({
        key: `${field}:${slug}`,
        prefix: FIELD_LABELS[field],
        label,
        remove: () => onRemoveTag(field, slug),
      })
    }
  }

  if (chips.length === 0) return null

  const tagCount = activeTagFilterCount(state)
  const showClearAll = chips.length > 1 || tagCount > 0

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-card/40 px-3 py-2',
      )}
      aria-label="Active filters"
    >
      <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        Active:
      </span>
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          className="group/chip inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-mono text-[10px] tracking-wider text-primary uppercase transition-colors hover:border-destructive/50 hover:bg-destructive/15 hover:text-destructive"
          aria-label={`Remove filter ${chip.prefix}: ${chip.label}`}
        >
          <span className="text-primary/70 group-hover/chip:text-destructive/70">
            {chip.prefix}:
          </span>
          <span className="font-bold normal-case">{chip.label}</span>
          <X className="size-3" aria-hidden />
        </button>
      ))}
      {showClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="ml-auto font-mono text-[10px] tracking-wider text-muted-foreground uppercase underline-offset-2 transition-colors hover:text-destructive hover:underline"
        >
          Clear all
        </button>
      ) : null}
    </div>
  )
}
