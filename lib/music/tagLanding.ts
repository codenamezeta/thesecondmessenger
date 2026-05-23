import type { Song, Tag } from '@/payload-types'
import { CATEGORY_TO_FIELD, type TagCategory } from '@/lib/songs/tagFields'
import { PRIMARY_ARTIST } from '@/lib/branding'

/**
 * The 11 Payload tag-category slugs. Re-exported here so route
 * `generateStaticParams` and validation functions don't have to know
 * about the songs-tag mapping.
 */
export const TAG_CATEGORIES: readonly TagCategory[] = [
  'genre',
  'subgenre',
  'activity',
  'theme',
  'mood',
  'production',
  'instrument',
  'gear',
  'arrangement',
  'influence',
  'other',
]

/** Type-guard a raw URL category string into the typed `TagCategory` union. */
export function isTagCategory(value: string): value is TagCategory {
  return (TAG_CATEGORIES as readonly string[]).includes(value)
}

/**
 * Category-aware page title templates. Each template surfaces the
 * search-intent of the category as a natural-language phrase.
 *
 * "Rock music by The Second Messenger"
 * "Music for running by The Second Messenger"
 * "Songs about heartbreak by The Second Messenger"
 */
export function tagLandingTitle(
  category: TagCategory,
  tagName: string,
  artist = PRIMARY_ARTIST,
): string {
  switch (category) {
    case 'genre':
      return `${tagName} music by ${artist}`
    case 'subgenre':
      return `${tagName} songs by ${artist}`
    case 'activity':
      return `Music for ${tagName.toLowerCase()} by ${artist}`
    case 'theme':
      return `Songs about ${tagName.toLowerCase()} by ${artist}`
    case 'mood':
      return `${tagName} music by ${artist}`
    case 'production':
      return `${tagName} music by ${artist}`
    case 'instrument':
      return `Songs featuring ${tagName.toLowerCase()} by ${artist}`
    case 'gear':
      return `Songs recorded with ${tagName} by ${artist}`
    case 'arrangement':
      return `Songs with ${tagName.toLowerCase()} by ${artist}`
    case 'influence':
      return `Songs for ${tagName} fans by ${artist}`
    case 'other':
      return `${tagName} \u2014 ${artist}`
    default: {
      const _exhaustive: never = category
      return _exhaustive
    }
  }
}

/**
 * Category-specific meta description. Tries to read like an editorial
 * intro rather than a stat dump. Falls back gracefully when `count`
 * is small.
 */
export function tagLandingMetaDescription(
  category: TagCategory,
  tagName: string,
  count: number,
  artist = PRIMARY_ARTIST,
): string {
  const songsWord = count === 1 ? 'track' : 'tracks'
  const suffix = `Browse ${count} ${songsWord} from ${artist}.`
  switch (category) {
    case 'genre':
      return `Every ${tagName} release from ${artist}. ${suffix}`
    case 'subgenre':
      return `${tagName} cuts and deep tracks from ${artist}. ${suffix}`
    case 'activity':
      return `${artist} music curated for ${tagName.toLowerCase()}. ${suffix}`
    case 'theme':
      return `${artist} songs about ${tagName.toLowerCase()}. ${suffix}`
    case 'mood':
      return `${tagName} ${artist} tracks for when you need that vibe. ${suffix}`
    case 'production':
      return `${tagName} sounds across the ${artist} catalog. ${suffix}`
    case 'instrument':
      return `${artist} tracks built around ${tagName.toLowerCase()}. ${suffix}`
    case 'gear':
      return `${artist} sessions recorded with ${tagName}. ${suffix}`
    case 'arrangement':
      return `${artist} tracks featuring ${tagName.toLowerCase()}. ${suffix}`
    case 'influence':
      return `${artist} songs for fans of ${tagName}. ${suffix}`
    case 'other':
      return `${tagName} \u2014 ${artist}. ${suffix}`
    default: {
      const _exhaustive: never = category
      return _exhaustive
    }
  }
}

/** Pretty label used in breadcrumbs and section headers. */
export function tagLandingEyebrow(category: TagCategory): string {
  switch (category) {
    case 'genre':
      return 'Genre'
    case 'subgenre':
      return 'Sub-genre'
    case 'activity':
      return 'Activity'
    case 'theme':
      return 'Theme'
    case 'mood':
      return 'Mood'
    case 'production':
      return 'Production'
    case 'instrument':
      return 'Instrument'
    case 'gear':
      return 'Gear'
    case 'arrangement':
      return 'Arrangement'
    case 'influence':
      return 'Influence'
    case 'other':
      return 'Tag'
    default: {
      const _exhaustive: never = category
      return _exhaustive
    }
  }
}

/**
 * True when `song` carries `tag` in the relationship array for this
 * category's corresponding song field. Defensive against unresolved
 * IDs and missing slug values.
 */
export function songHasTag(
  song: Song,
  category: TagCategory,
  tagId: number,
): boolean {
  const field = CATEGORY_TO_FIELD[category]
  const arr = song[field] as (number | Tag)[] | null | undefined
  if (!arr) return false
  for (const entry of arr) {
    if (typeof entry === 'object' && entry?.id === tagId) return true
    if (typeof entry === 'number' && entry === tagId) return true
  }
  return false
}
