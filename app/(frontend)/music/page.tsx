import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Header } from '@/components/Header'
import { MusicArchive } from '@/components/MusicArchive'
import { Metadata } from 'next'

// ISR — re-generate the song list at most every 10 minutes. Songs change
// infrequently and Releases hooks already revalidate via their own paths,
// so this gives us static-fast page loads with a sane staleness window.
export const revalidate = 600

export const metadata: Metadata = {
  title: 'Music by The Second Messenger',
  description: 'Full music archive and audio logs.',
  openGraph: {
    images: [
      {
        url: 'https://thesecondmessenger.com/imgs/michael-today.jpg',
      },
    ],
  },
  twitter: {
    images: [
      {
        url: 'https://thesecondmessenger.com/imgs/michael-today.jpg',
      },
    ],
  },
}

export default async function MusicPage() {
  const payload = await getPayload({ config: configPromise })

  // Fetch ALL songs (we will handle sorting/filtering on the client for instant feedback)
  const songs = await payload.find({
    collection: 'songs',
    where: {
      and: [
        { releaseDate: { exists: true } },
        { releaseDate: { not_equals: null } },
      ],
    },
    sort: '-releaseDate', // Default to newest first
    limit: 100,
    depth: 1, // We just need basic info (title, slug, date, cover)
  })

  return (
    <article className="space-y-12 bg-transparent">
      <Header
        eyebrow="// ACCESSING AUDIO ARCHIVE"
        title="Music"
        description="Accessing complete music archive. Select a song to initiate playback or retrieve song data."
        highlightStat={{
          value: songs.docs.length,
          label: 'Songs Released... so far',
        }}
      />

      <main className="container">
        <MusicArchive initialSongs={songs.docs} />
      </main>
    </article>
  )
}
