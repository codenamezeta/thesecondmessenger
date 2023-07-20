import { getAllSongs } from '@/lib/firebase'
import FeaturedSong from '../components/FeaturedSong'

export default async function test() {
  const songs: any[] = await getAllSongs()

  return (
    <div>
      {songs.map((song) => (
        <FeaturedSong key={song.isrc} song={song} />
      ))}
    </div>
  )
}
