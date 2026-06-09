import type { Song } from '@/payload-types'
import { getSongTagField, getTagNames } from './tagFields'
import type { SongCopyInput } from '@/lib/seo/songCopyComposer'

/**
 * Convert a Payload `Song` doc into the `SongCopyInput` shape SEO copy
 * generators consume.
 *
 * Caller is responsible for loading the song with sufficient `depth`
 * that the relationship arrays contain resolved Tag objects rather
 * than bare numeric IDs.
 */
export function songToCopyInput(song: Song): SongCopyInput {
  const featuredArtists =
    song.featuredArtists
      ?.map((entry) => entry.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? null

  return {
    title: song.title,
    featuredArtists,
    genres: getTagNames(getSongTagField(song, 'genres')),
    subGenres: getTagNames(getSongTagField(song, 'subGenres')),
    moods: getTagNames(getSongTagField(song, 'moods')),
    themes: getTagNames(getSongTagField(song, 'themes')),
    instruments: getTagNames(getSongTagField(song, 'instruments')),
    activities: getTagNames(getSongTagField(song, 'activities')),
    influences: getTagNames(getSongTagField(song, 'influences')),
    production: getTagNames(getSongTagField(song, 'production')),
    arrangements: getTagNames(getSongTagField(song, 'arrangements')),
    bpm: song.bpm ?? null,
    key: song.key ?? null,
  }
}
