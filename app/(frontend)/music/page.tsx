import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { MusicArchive } from '@/components/MusicArchive'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Archives | The Second Messenger',
  description: 'Full transmission history and audio logs.',
}

export default async function MusicPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch ALL songs (we will handle sorting/filtering on the client for instant feedback)
  const songs = await payload.find({
    collection: 'songs',
    sort: '-releaseDate', // Default to newest first
    limit: 100,
    depth: 1, // We just need basic info (title, slug, date, cover)
  })

  return (
    <main className="container bg-transparent pt-24">
      {/* Header */}
      <div className="mb-12 border-b border-border/50 pb-8">
        <h1 className="mb-4 font-heading text-4xl tracking-widest text-foreground uppercase md:text-6xl">
          Transmission Log
        </h1>
        <p className="max-w-2xl font-mono text-muted-foreground">
          Accessing complete audio database. Select a file to initiate playback
          or retrieve data cache.
        </p>
      </div>

      {/* The Interactive Component */}
      <MusicArchive initialSongs={songs.docs} />
    </main>
  )
}
