import SongLinks from './SongLinks'
import selectors from './FeaturedSong.module.scss'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'

interface FeaturedSongProps {
  song: any
  sectionHeading?: string
  titleAsH1?: boolean
}

export default async function FeaturedSong({
  song,
  sectionHeading = '',
  titleAsH1 = true,
}: FeaturedSongProps) {
  //* Get album art from firebase storage
  const storage = getStorage() //- Creates a reference to the firebase storage bucket
  const coverArtRef = ref(storage, song.cover_art) //- Creates a reference to the specific song's image
  const htmlURL = await getDownloadURL(coverArtRef) //- Creates a URL that can be passed to CSS
    .then((url) => {
      return url
    })
    .catch((err) => {
      return err
    })

  return (
    <section
      id={selectors['featured_song']}
      style={{ backgroundImage: `url(${htmlURL})` }}
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
