import { getAllSongs, getCoverArtUrl } from '@/lib/firebase'
import BlogCard from '@/app/components/BlogCard'

export default async function Music() {
  const songs = await getAllSongs()
  console.log('🚀 ~ file: Music/page.tsx:6 ~ Music ~ songs:', songs)

  return (
    <ul className='container'>
      {songs.map(async (song) => {
        let coverArt = await getCoverArtUrl(song.cover_art)
        console.log('🚀 ~ file: page.tsx:12 ~ {songs.map ~ coverArt:', coverArt)
        return (
          <BlogCard
            key={song.title}
            title={song.title}
            image={coverArt}
            description={song.sonic_description}
            link={`/music/${song.slug}`}
          />
        )
      })}
    </ul>
  )
}
