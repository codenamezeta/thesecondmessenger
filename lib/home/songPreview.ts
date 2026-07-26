import type { Song, Tag } from '@/payload-types'
import type {
  SongPreview,
  PremiereTeaser,
} from '@/components/home/homeSectionTypes'

function tagNamesFrom(
  ...relations: Array<Song['genres'] | Song['moods'] | undefined>
): string[] {
  const names: string[] = []
  for (const relation of relations) {
    if (!Array.isArray(relation)) continue
    for (const entry of relation) {
      if (entry && typeof entry === 'object' && 'name' in entry) {
        names.push((entry as Tag).name)
      }
    }
  }
  return [...new Set(names)]
}

/** Trim a full Song doc down to the serializable homepage preview shape. */
export function toSongPreview(song: Song): SongPreview {
  return {
    id: song.id,
    title: song.title,
    coverArt: song.coverArt,
    youtubeId: song.youtubeId,
    slug: song.slug,
    releaseDate: song.releaseDate,
    tagline: song.tagline,
    durationText: song.durationText,
    bpm: song.bpm,
    popularity: song.popularity,
    tagNames: tagNamesFrom(song.genres, song.subGenres, song.moods),
  }
}

/**
 * Safe teaser for an unreleased scheduled premiere — only fields the public
 * countdown needs. Never pass the full doc (gated audio/lyrics/stems).
 */
export function toPremiereTeaser(song: Song): PremiereTeaser | null {
  if (!song.premiereAt) return null
  return {
    id: song.id,
    title: song.title,
    slug: song.slug,
    coverArt: song.coverArt,
    premiereAt: song.premiereAt,
    releaseDate: song.releaseDate,
    tagline: song.tagline,
  }
}
