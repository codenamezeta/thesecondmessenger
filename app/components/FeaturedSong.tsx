import SongLinks from './SongLinks'
import selectors from './FeaturedSong.module.scss'
import { getCoverArtUrl } from '@/lib/firebase'
import { DocumentData } from 'firebase/firestore'

interface FeaturedSongProps {
  song: DocumentData
  sectionHeading?: string
  titleAsH1?: boolean
}

export default function FeaturedSong({
  song,
  sectionHeading = '',
  titleAsH1 = true,
}: FeaturedSongProps) {
  const coverArtUrl = getCoverArtUrl(song.cover_art)
  return (
    <section
      id={selectors['featured_song']}
      style={{ backgroundImage: `url(${coverArtUrl})` }}
    >
      {/* div.backdrop-filter is needed because it's a layer that blurs the image under it */}
      <div className={selectors['backdrop-filter']}>
        <div className='container'>
          {sectionHeading ? <h5>{sectionHeading}</h5> : null}
          {titleAsH1 ? <h1>{song.title}</h1> : <h3>{song.title}</h3>}
          <blockquote>{song.sonic_description}</blockquote>
          <SongLinks links={song.stream_links} />
        </div>
      </div>
    </section>
  )
}
