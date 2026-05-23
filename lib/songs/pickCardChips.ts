import {
  Activity,
  Disc,
  Globe,
  Mic2,
  Music2,
  Star,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { Song, Tag } from '@/payload-types'
import {
  FIELD_TO_CATEGORY,
  getResolvedTags,
  getSongTagField,
  type SongTagField,
} from './tagFields'

export type CardChip = {
  /** Display text — the resolved `Tag.name`. */
  text: string
  /** Lucide icon component for the chip leading-glyph. */
  icon: LucideIcon
  /** Tailwind text-color utility for the icon tint. */
  color: string
  /** Source field on the song. Used by PR B for click-through routing. */
  field: SongTagField
  /** Underlying tag id — stable across renders, used as a React key. */
  tagId: number
  /** Tag slug (when present) — used by PR B for URL filter values. */
  slug?: string | null
}

/**
 * Per-layer presentation order for SongCard chips. Index = priority:
 * the round-robin picker (below) takes one tag from each layer in this
 * order before any layer contributes a second tag. This guarantees that
 * a song with content in 6+ layers fills its card with maximum variety.
 *
 * Genres sit last because most songs have one and it would otherwise
 * dominate the chip strip while saying very little ("Rock"). Sub-genre
 * leads because it carries the most identity signal ("Pop-punk").
 */
const LAYER_PRESENTATION: ReadonlyArray<{
  field: SongTagField
  icon: LucideIcon
  color: string
}> = [
  { field: 'subGenres', icon: Music2, color: 'text-primary' },
  { field: 'moods', icon: Zap, color: 'text-accent' },
  { field: 'activities', icon: Activity, color: 'text-chart-2' },
  { field: 'instruments', icon: Mic2, color: 'text-chart-4' },
  { field: 'influences', icon: Star, color: 'text-special' },
  { field: 'themes', icon: Globe, color: 'text-chart-5' },
  { field: 'genres', icon: Disc, color: 'text-muted-foreground' },
]

function chipFromTag(
  tag: Tag,
  layer: (typeof LAYER_PRESENTATION)[number],
): CardChip {
  return {
    text: tag.name,
    icon: layer.icon,
    color: layer.color,
    field: layer.field,
    tagId: tag.id,
    slug: tag.slug ?? null,
  }
}

/**
 * Pick up to `max` chips from a Song, drawing across layers in priority
 * order so each card feels uniquely characterized rather than bunching
 * up on moods + themes alone (the legacy behavior).
 *
 * Strategy: round-robin through `LAYER_PRESENTATION`. On each pass,
 * pull the next unused tag from each layer until we hit `max` or
 * exhaust all layers. A song with content across all 7 displayed
 * layers therefore gets one chip from each before any layer doubles up.
 */
export function pickCardChips(song: Song, max = 6): CardChip[] {
  const cursors = new Map<SongTagField, number>()
  for (const { field } of LAYER_PRESENTATION) cursors.set(field, 0)

  const chips: CardChip[] = []
  let progressed = true

  while (chips.length < max && progressed) {
    progressed = false
    for (const layer of LAYER_PRESENTATION) {
      if (chips.length >= max) break
      const tags = getResolvedTags(getSongTagField(song, layer.field))
      const idx = cursors.get(layer.field) ?? 0
      const next = tags[idx]
      if (next) {
        chips.push(chipFromTag(next, layer))
        cursors.set(layer.field, idx + 1)
        progressed = true
      }
    }
  }

  return chips
}

/** Convenience: derive the Payload tag category for a chip. */
export function chipCategory(chip: CardChip) {
  return FIELD_TO_CATEGORY[chip.field]
}
