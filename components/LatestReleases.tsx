import { SongCard } from './SongCard'
import { Song } from '@/payload-types'

interface PaginatedSongs {
  docs: Song[]
  [key: string]: unknown // Allow for other pagination fields from Payload
}

export default function LatestReleases({ songs }: { songs: PaginatedSongs }) {
  return (
    <section className="my-12">
      <h2 className="mb-6 border-b border-white/20 pb-2 font-heading text-2xl">
        Latest Releases
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {songs.docs.map((song: Song) => (
          <SongCard key={song.id} song={song} />
        ))}
      </div>
    </section>
  )
}
