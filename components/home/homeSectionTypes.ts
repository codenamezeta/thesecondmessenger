import type { Song } from '@/payload-types'
import type { YoutubeChannelVideo } from '@/actions/youtube'
import type { PlayCategory } from '@/lib/home/playCategories'

export type SongPreview = Pick<
  Song,
  | 'id'
  | 'title'
  | 'coverArt'
  | 'youtubeId'
  | 'slug'
  | 'releaseDate'
  | 'tagline'
  | 'durationText'
  | 'bpm'
  | 'popularity'
> & {
  /** Flattened genre + sub-genre + mood tag names (card chips + category matching) */
  tagNames: string[]
}

/**
 * Safe teaser fields for an upcoming scheduled premiere. Built server-side —
 * never expose gated fields (audio, stems, lyrics) for unreleased songs.
 */
export type PremiereTeaser = {
  id: Song['id']
  title: string
  slug?: string | null
  coverArt: Song['coverArt']
  premiereAt: string
  releaseDate?: string | null
  tagline?: string | null
}

export interface HomeProps {
  /** All released songs, sorted `-releaseDate` (feed slices what it needs) */
  songs: SongPreview[]
  videos: YoutubeChannelVideo[]
  premiere: PremiereTeaser | null
  /** Category → ordered song-id queue for the "Play something..." button */
  categoryQueues: Record<PlayCategory, Array<string | number>>
}
