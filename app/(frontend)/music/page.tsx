import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Header } from '@/components/Header'
import { MusicArchive } from '@/components/MusicArchive'
import { parseSearchParams } from '@/lib/music/filterState'
import { Metadata } from 'next'

// Reading `searchParams` opts the page into dynamic rendering per
// request (Next 15 behavior). Filtering is purely client-side from
// `initialFilters`, so URL changes stay snappy without re-fetching.
// If catalog growth ever makes the per-request `payload.find` a
// bottleneck, wrap it in `unstable_cache` keyed on the song list
// rather than the URL — the song fetch is independent of filters.
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

interface MusicPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function MusicPage({ searchParams }: MusicPageProps) {
  const payload = await getPayload({ config: configPromise })

  const resolvedSearchParams = await searchParams
  const initialFilters = parseSearchParams(resolvedSearchParams)

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
        <MusicArchive
          initialSongs={songs.docs}
          initialFilters={initialFilters}
        />
      </main>
    </article>
  )
}
