import { SongCard } from './SongCard'
import { Song } from '@/payload-types'

// TODO: Properly type Songs. Don't use any.

export default function LatestReleases({ songs }: { songs: any }) {
  return (
    <section className="my-12">
      <h2 className="font-heading text-2xl mb-6 border-b border-white/20 pb-2">Latest Releases</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {songs.docs.map((song: Song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  )
}
