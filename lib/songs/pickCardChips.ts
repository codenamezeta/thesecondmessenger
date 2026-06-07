import type { LucideIcon } from 'lucide-react'
import type { Song, Tag } from '@/payload-types'
import {
  FIELD_TO_CATEGORY,
  getResolvedTags,
  getSongTagField,
  type SongTagField,
} from './tagFields'
import { resolveTagColor, resolveTagIcon } from './tagIcons'

export type CardChip = {
  /** Display text — the resolved `Tag.name`. */
  text: string
  /** Lucide icon component for the chip leading-glyph. */
  icon: LucideIcon
  /** Tailwind text-color utility for the icon tint. */
  color: string
  /** Source field on the song. Used for click-through routing. */
  field: SongTagField
  /** Underlying tag id — stable across renders, used as a React key. */
  tagId: number
  /** Tag slug (when present) — used for URL filter values. */
  slug?: string | null
}

/**
 * Per-layer presentation ORDER for SongCard chips. Index = priority: the
 * round-robin picker takes one tag from each layer in this order before
 * any layer contributes a second tag, so a song with content in many
 * layers fills its card with maximum variety.
 *
 * Icons + colors are NO LONGER hard-coded per layer — they resolve from
 * each tag's own `icon` field (editor-set, see `tagIcons.ts`) with a
 * per-category fallback, so a "Guitar" instrument shows a guitar rather
 * than a one-size-fits-all microphone.
 *
 * `arrangements` is deliberately absent here: it gets a dedicated
 * "keyword / ability" treatment via `getArrangementKeywords`.
 */
const LAYER_PRESENTATION: readonly SongTagField[] = [
  'subGenres',
  'moods',
  'activities',
  'instruments',
  'influences',
  'themes',
  'genres',
]

function chipFromTag(tag: Tag, field: SongTagField): CardChip {
  return {
    text: tag.name,
    icon: resolveTagIcon(tag),
    color: resolveTagColor(tag.category),
    field,
    tagId: tag.id,
    slug: tag.slug ?? null,
  }
}

/**
 * Pick up to `max` chips from a Song, drawing across layers in priority
 * order so each card feels uniquely characterized rather than bunching
 * up on moods + themes alone.
 */
export function pickCardChips(song: Song, max = 6): CardChip[] {
  const cursors = new Map<SongTagField, number>()
  for (const field of LAYER_PRESENTATION) cursors.set(field, 0)

  const chips: CardChip[] = []
  let progressed = true

  while (chips.length < max && progressed) {
    progressed = false
    for (const field of LAYER_PRESENTATION) {
      if (chips.length >= max) break
      const tags = getResolvedTags(getSongTagField(song, field))
      const idx = cursors.get(field) ?? 0
      const next = tags[idx]
      if (next) {
        chips.push(chipFromTag(next, field))
        cursors.set(field, idx + 1)
        progressed = true
      }
    }
  }

  return chips
}

/**
 * Arrangement tags ("Instrumental", "Guitar Solo", "Odd Time Signature")
 * read like trading-card abilities/keywords. Surfaced separately from the
 * generic chip strip so they can get a distinct, bolder treatment.
 */
export function getArrangementKeywords(song: Song, max = 3): CardChip[] {
  return getResolvedTags(getSongTagField(song, 'arrangements'))
    .slice(0, max)
    .map((tag) => chipFromTag(tag, 'arrangements'))
}

/** Convenience: derive the Payload tag category for a chip. */
export function chipCategory(chip: CardChip) {
  return FIELD_TO_CATEGORY[chip.field]
}
