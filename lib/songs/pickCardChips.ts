import type { LucideIcon } from 'lucide-react'
import type { Song, Tag } from '@/payload-types'
import {
  FIELD_TO_CATEGORY,
  getResolvedTags,
  getSongTagField,
  type SongTagField,
} from './tagFields'
import { resolveTagIcon } from './tagIcons'

export type CardChip = {
  /** Display text — the resolved `Tag.name`. */
  text: string
  /** Source field on the song. Used for click-through routing. */
  field: SongTagField
  /** Underlying tag id — stable across renders, used as a React key. */
  tagId: number
  /** Tag slug (when present) — used for URL filter values. */
  slug?: string | null
}

/**
 * Ordered, LABELED tag groups for the SongCard. Each becomes a
 * "Question → answers" row (e.g. `Sounds like:  Blink-182  Green Day`)
 * so the chips themselves carry the description — no prose line restating
 * the same tags, and no ambiguity about what a bare chip means.
 *
 * Sub-genre is intentionally absent: it follows industry convention
 * (hard-rock, pop-punk) rather than answering a question, so it stays in
 * the card's title type-line. Genre / instruments / gear / arrangement
 * are catalog metadata and live on the song page, not the card.
 *
 * `otherTags` is the only catch-all — a narrow "Also" bucket so genuinely
 * uncategorized tags can surface without dragging the broad, un-enticing
 * layers back onto the card.
 *
 * Order leads with the strongest hooks (mood, sounds-like).
 */
const GROUP_LAYOUT: readonly { field: SongTagField; label: string }[] = [
  { field: 'moods', label: 'Mood' },
  { field: 'influences', label: 'Sounds like' },
  { field: 'activities', label: 'Great for' },
  { field: 'themes', label: 'About' },
  { field: 'otherTags', label: 'Also' },
]

export type CardTagGroup = {
  /** Source field — used for click-through routing + React keys. */
  field: SongTagField
  /** Heading text shown before the chips (e.g. "Sounds like"). */
  label: string
  /** Category-default Lucide icon for the heading glyph. */
  icon: LucideIcon
  /** The (capped) tags in this group. */
  chips: CardChip[]
}

function chipFromTag(tag: Tag, field: SongTagField): CardChip {
  return {
    text: tag.name,
    field,
    tagId: tag.id,
    slug: tag.slug ?? null,
  }
}

/**
 * Build the labeled tag groups for a SongCard. Returns only non-empty
 * groups (so the card renders a heading only when it has answers), each
 * capped at `perGroup` tags to keep card heights even across a grid.
 */
export function pickCardTagGroups(song: Song, perGroup = 3): CardTagGroup[] {
  const groups: CardTagGroup[] = []
  for (const { field, label } of GROUP_LAYOUT) {
    const tags = getResolvedTags(getSongTagField(song, field)).slice(0, perGroup)
    if (tags.length === 0) continue
    groups.push({
      field,
      label,
      icon: resolveTagIcon(FIELD_TO_CATEGORY[field]),
      chips: tags.map((tag) => chipFromTag(tag, field)),
    })
  }
  return groups
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
