/**
 * "Play something..." category engine.
 *
 * Each category resolves to a queue of released songs by fuzzy-matching the
 * song's genre/sub-genre/mood tag names against the matcher lists below.
 * Categories with no matches fall back to the full catalog by popularity so
 * the button always plays something.
 */

export const PLAY_CATEGORIES = [
  'Catchy',
  'Upbeat',
  'Ambient',
  'Mellow',
  'Heavy',
  'Recent',
] as const

export type PlayCategory = (typeof PLAY_CATEGORIES)[number]

type CategorizableSong = {
  id: string | number
  youtubeId?: string | null
  popularity?: number | null
  /** Flattened genre + sub-genre + mood tag names (see `toSongPreview`) */
  tagNames: string[]
}

// TODO: tune these substrings against the actual mood/genre tags in the CMS
// (Tags collection, categories `mood` / `genre` / `subgenre`). Matching is
// case-insensitive substring, so 'anthem' catches both "Anthemic" and "Anthem".
const CATEGORY_TAG_MATCHERS: Record<
  Exclude<PlayCategory, 'Recent'>,
  string[]
> = {
  Catchy: ['catchy', 'hook', 'anthem', 'earworm', 'sing', 'power pop', 'pop'],
  Upbeat: ['upbeat', 'energetic', 'uplift', 'happy', 'fun', 'driving', 'danc'],
  Ambient: ['ambient', 'atmospher', 'dream', 'space', 'cinematic', 'ethereal'],
  Mellow: ['mellow', 'chill', 'calm', 'soft', 'acoustic', 'relax', 'ballad'],
  Heavy: ['heavy', 'hard rock', 'aggress', 'distort', 'metal', 'punk', 'grunge'],
}

function byPopularity(a: CategorizableSong, b: CategorizableSong): number {
  return (b.popularity ?? 0) - (a.popularity ?? 0)
}

function matchesCategory(
  song: CategorizableSong,
  matchers: string[],
): boolean {
  return song.tagNames.some((name) => {
    const lower = name.toLowerCase()
    return matchers.some((m) => lower.includes(m))
  })
}

/**
 * Build the category → song-id queue map. `songs` must already be released,
 * published, and sorted by `-releaseDate` (the homepage query guarantees it).
 */
export function buildCategoryQueues(
  songs: CategorizableSong[],
): Record<PlayCategory, Array<string | number>> {
  const playable = songs.filter((song) => Boolean(song.youtubeId))
  const fallback = [...playable].sort(byPopularity).map((song) => song.id)

  const queues = {} as Record<PlayCategory, Array<string | number>>

  for (const category of PLAY_CATEGORIES) {
    if (category === 'Recent') {
      queues[category] = playable.map((song) => song.id)
      continue
    }

    const matched = playable
      .filter((song) => matchesCategory(song, CATEGORY_TAG_MATCHERS[category]))
      .sort(byPopularity)
      .map((song) => song.id)

    queues[category] = matched.length > 0 ? matched : fallback
  }

  return queues
}
