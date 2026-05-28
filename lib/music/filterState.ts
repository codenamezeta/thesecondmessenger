import {
  CATEGORY_TO_FIELD,
  FIELD_TO_CATEGORY,
  SONG_TAG_FIELDS,
  type SongTagField,
  type TagCategory,
} from '@/lib/songs/tagFields'

/**
 * Single source of truth for the `/music` page's filter / sort / view
 * state. Round-trips losslessly to URL search params via
 * `parseSearchParams` / `serializeFilterState`, so back/forward,
 * sharing, and bookmarking all just work.
 *
 * Tag filters are keyed by the SONG field name (e.g. `subGenres`,
 * `activities`) — same vocabulary as everywhere else in `lib/songs/`.
 * URL params, however, are keyed by the singular Payload tag CATEGORY
 * (`subgenre`, `activity`) for prettier shareable URLs:
 *
 *     /music?activity=running&mood=dark,energetic&subgenre=pop-punk
 *
 * Tag values are tag SLUGS (not names) — stable, URL-safe, and what
 * Payload generates by default on the Tags collection.
 *
 * Multiple values per layer use OR semantics; multiple layers AND.
 */

export type ViewMode = 'grid' | 'list' | 'timeline'
export type SortMode =
  | 'newest'
  | 'oldest'
  | 'az'
  | 'za'
  | 'shortest'
  | 'longest'

export type CompositionFilter = 'all' | 'Original' | 'Cover' | 'Public Domain'
export type RecordingFilter = 'all' | 'Studio' | 'Live' | 'Demo'
export type ExplicitFilter = 'show' | 'hide'

export type TagFilters = Record<SongTagField, string[]>

export type FilterState = {
  q: string
  view: ViewMode
  sort: SortMode
  composition: CompositionFilter
  recording: RecordingFilter
  explicit: ExplicitFilter
  /** Slug arrays per layer — empty array means no filter on that layer. */
  tags: TagFilters
}

const SORT_VALUES: readonly SortMode[] = [
  'newest',
  'oldest',
  'az',
  'za',
  'shortest',
  'longest',
]
const VIEW_VALUES: readonly ViewMode[] = ['grid', 'list', 'timeline']
const COMPOSITION_VALUES: readonly CompositionFilter[] = [
  'all',
  'Original',
  'Cover',
  'Public Domain',
]
const RECORDING_VALUES: readonly RecordingFilter[] = [
  'all',
  'Studio',
  'Live',
  'Demo',
]

function emptyTagFilters(): TagFilters {
  return SONG_TAG_FIELDS.reduce<TagFilters>((acc, field) => {
    acc[field] = []
    return acc
  }, {} as TagFilters)
}

export const DEFAULT_FILTER_STATE: FilterState = {
  q: '',
  view: 'grid',
  sort: 'newest',
  composition: 'all',
  recording: 'all',
  explicit: 'show',
  tags: emptyTagFilters(),
}

function pickEnum<T extends string>(
  raw: string | null | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (!raw) return fallback
  return (allowed as readonly string[]).includes(raw) ? (raw as T) : fallback
}

function splitCsv(raw: string | null | undefined): string[] {
  if (!raw) return []
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

/** Accepts either a Next.js searchParams object or a URLSearchParams. */
type LooseSearchParams =
  | URLSearchParams
  | Record<string, string | string[] | undefined>
  | undefined
  | null

function readParam(source: LooseSearchParams, key: string): string | null {
  if (!source) return null
  if (source instanceof URLSearchParams) {
    return source.get(key)
  }
  const raw = source[key]
  if (Array.isArray(raw)) return raw.join(',')
  return raw ?? null
}

/**
 * Parse `searchParams` (from Next.js page props or `useSearchParams`)
 * into a typed `FilterState`. Unknown / malformed values silently fall
 * back to defaults so a hand-rolled URL never crashes the page.
 */
export function parseSearchParams(
  searchParams: LooseSearchParams,
): FilterState {
  const q = readParam(searchParams, 'q') ?? ''

  const tags = emptyTagFilters()
  for (const field of SONG_TAG_FIELDS) {
    const category = FIELD_TO_CATEGORY[field]
    const values = splitCsv(readParam(searchParams, category))
    if (values.length > 0) tags[field] = values
  }

  return {
    q,
    view: pickEnum(readParam(searchParams, 'view'), VIEW_VALUES, 'grid'),
    sort: pickEnum(readParam(searchParams, 'sort'), SORT_VALUES, 'newest'),
    composition: pickEnum(
      readParam(searchParams, 'composition'),
      COMPOSITION_VALUES,
      'all',
    ),
    recording: pickEnum(
      readParam(searchParams, 'recording'),
      RECORDING_VALUES,
      'all',
    ),
    explicit: readParam(searchParams, 'explicit') === 'hide' ? 'hide' : 'show',
    tags,
  }
}

/**
 * Inverse of `parseSearchParams`. Returns a `URLSearchParams` with
 * default-valued keys omitted so the URL stays clean
 * (`/music` rather than `/music?view=grid&sort=newest&...`).
 */
export function serializeFilterState(state: FilterState): URLSearchParams {
  const out = new URLSearchParams()
  if (state.q) out.set('q', state.q)
  if (state.view !== DEFAULT_FILTER_STATE.view) out.set('view', state.view)
  if (state.sort !== DEFAULT_FILTER_STATE.sort) out.set('sort', state.sort)
  if (state.composition !== DEFAULT_FILTER_STATE.composition) {
    out.set('composition', state.composition)
  }
  if (state.recording !== DEFAULT_FILTER_STATE.recording) {
    out.set('recording', state.recording)
  }
  if (state.explicit !== DEFAULT_FILTER_STATE.explicit) {
    out.set('explicit', state.explicit)
  }
  for (const field of SONG_TAG_FIELDS) {
    const slugs = state.tags[field]
    if (slugs && slugs.length > 0) {
      out.set(FIELD_TO_CATEGORY[field], slugs.join(','))
    }
  }
  return out
}

/**
 * Build a URL string for navigating to `/music` with a single tag
 * pre-applied. Used by SongCard / SonicDNA chip click-throughs.
 */
export function musicHrefForTag(category: TagCategory, slug: string): string {
  const params = new URLSearchParams()
  params.set(category, slug)
  return `/music?${params.toString()}`
}

/** Add a tag slug to the appropriate layer. Returns a new state. */
export function addTagFilter(
  state: FilterState,
  field: SongTagField,
  slug: string,
): FilterState {
  if (!slug) return state
  const current = state.tags[field] ?? []
  if (current.includes(slug)) return state
  return {
    ...state,
    tags: { ...state.tags, [field]: [...current, slug] },
  }
}

/** Remove a tag slug from the appropriate layer. Returns a new state. */
export function removeTagFilter(
  state: FilterState,
  field: SongTagField,
  slug: string,
): FilterState {
  const current = state.tags[field] ?? []
  if (!current.includes(slug)) return state
  return {
    ...state,
    tags: {
      ...state.tags,
      [field]: current.filter((s) => s !== slug),
    },
  }
}

/** Toggle a tag slug on/off in the appropriate layer. */
export function toggleTagFilter(
  state: FilterState,
  field: SongTagField,
  slug: string,
): FilterState {
  return state.tags[field]?.includes(slug)
    ? removeTagFilter(state, field, slug)
    : addTagFilter(state, field, slug)
}

/** Wipe every tag filter and the search box; preserve view/sort. */
export function clearTagFilters(state: FilterState): FilterState {
  return {
    ...state,
    q: '',
    composition: 'all',
    recording: 'all',
    explicit: 'show',
    tags: emptyTagFilters(),
  }
}

/** Number of currently-active tag filters across all layers. */
export function activeTagFilterCount(state: FilterState): number {
  let total = 0
  for (const field of SONG_TAG_FIELDS) {
    total += state.tags[field]?.length ?? 0
  }
  return total
}

/** True when nothing but defaults are set. */
export function isFilterStateEmpty(state: FilterState): boolean {
  return (
    !state.q &&
    state.composition === 'all' &&
    state.recording === 'all' &&
    state.explicit === 'show' &&
    activeTagFilterCount(state) === 0
  )
}

export { CATEGORY_TO_FIELD, FIELD_TO_CATEGORY, SONG_TAG_FIELDS }
