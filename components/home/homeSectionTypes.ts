import type { Song, Media } from '@/payload-types'
import type { YoutubeChannelVideo } from '@/actions/youtube'

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
>

export interface HomeProps {
  songs: SongPreview[]
  videos: YoutubeChannelVideo[]
}
