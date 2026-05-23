import type { Song, Tag } from '@/payload-types'

/**
 * Canonical list of the 11 ontology-aligned relationship fields on a
 * `Song` document. Source of truth for any frontend code that needs to
 * iterate over all tag layers (search indexing, faceting, card chips,
 * SEO copy, etc.).
 *
 * Order matches the priority documented in
 * `.cursor/rules/sonic-tag-ontology.mdc`. Higher-priority layers come
 * first and are preferred when a consumer has to pick a small number of
 * representative tags.
 *
 * Mirrors `SONG_TAG_RELATIONSHIP_KEYS` in `collections/Songs.ts` but
 * lives outside the Payload server module so client components can
 * import it without dragging server-only deps into the client bundle.
 */
export const SONG_TAG_FIELDS = [
  'genres',
  'subGenres',
  'activities',
  'themes',
  'moods',
  'production',
  'instruments',
  'gear',
  'arrangements',
  'influences',
  'otherTags',
] as const satisfies readonly (keyof Song)[]

export type SongTagField = (typeof SONG_TAG_FIELDS)[number]

/** The literal `Tag.category` union from the generated Payload types. */
export type TagCategory = Tag['category']

/** Field name → Payload tag category. */
export const FIELD_TO_CATEGORY: Record<SongTagField, TagCategory> = {
  genres: 'genre',
  subGenres: 'subgenre',
  activities: 'activity',
  themes: 'theme',
  moods: 'mood',
  production: 'production',
  instruments: 'instrument',
  gear: 'gear',
  arrangements: 'arrangement',
  influences: 'influence',
  otherTags: 'other',
}

/** Payload tag category → field name on `Song`. */
export const CATEGORY_TO_FIELD: Record<TagCategory, SongTagField> = {
  genre: 'genres',
  subgenre: 'subGenres',
  activity: 'activities',
  theme: 'themes',
  mood: 'moods',
  production: 'production',
  instrument: 'instruments',
  gear: 'gear',
  arrangement: 'arrangements',
  influence: 'influences',
  other: 'otherTags',
}

/** Human-readable label for each layer. UI surfaces should prefer this. */
export const FIELD_LABELS: Record<SongTagField, string> = {
  genres: 'Genre',
  subGenres: 'Sub-genre',
  activities: 'Activity',
  themes: 'Theme',
  moods: 'Mood',
  production: 'Production',
  instruments: 'Instrument',
  gear: 'Gear',
  arrangements: 'Arrangement',
  influences: 'Influence',
  otherTags: 'Other',
}

type TagRelationshipArray = (number | Tag)[] | null | undefined

/**
 * Filter a song's relationship array down to fully-resolved `Tag` objects.
 * Bare numeric IDs (which appear when the document was loaded with
 * insufficient `depth`) are silently dropped.
 */
export function getResolvedTags(field: TagRelationshipArray): Tag[] {
  if (!field) return []
  return field.filter((t): t is Tag => typeof t === 'object' && t !== null)
}

/** Extract non-empty `name` strings from a relationship array. */
export function getTagNames(field: TagRelationshipArray): string[] {
  return getResolvedTags(field)
    .map((t) => t.name)
    .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
}

/**
 * Read the relationship array off a song for a given field, with the
 * generic union narrowed to a single, useful array type. Saves callers
 * from repeating the cast.
 */
export function getSongTagField(
  song: Song,
  field: SongTagField,
): TagRelationshipArray {
  return song[field] as TagRelationshipArray
}
