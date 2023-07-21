import { getAllSongs, getCoverArtUrl } from '@/lib/firebase'
import BlogCard from '../components/BlogCard'

export default async function Music() {
  const songs = await getAllSongs()

  return (
    <ul className='container'>
      {songs.map(async (song) => {
        let coverArt = await getCoverArtUrl(song.cover_art)
        return (
          <li key={song.title}>
            <BlogCard
              title={song.title}
              image={coverArt}
              description={song.sonic_description}
              link={`/music/${song.slug}`}
            />
          </li>
        )
      })}
    </ul>
  )
}
