import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { MusicGroupSchema } from '@/schema/MusicGroup'
import { HomeSections } from '@/components/home/HomeSections'
import type { SongPreview } from '@/components/home/HomeSections'

export const metadata: Metadata = {
  title: 'The Second Messenger • Melodic Modern Rock',
  description:
    'Independent artist. 100% unfiltered. Music built from scratch with real instruments. Enter the archive.',
  openGraph: {
    images: [
      {
        url: 'https://thesecondmessenger.com/imgs/michael/michael-today.jpg',
      },
    ],
    title: 'The Second Messenger • Melodic Modern Rock',
    description:
      'Independent artist. 100% unfiltered. Music built from scratch with real instruments. Enter the archive.',
    url: 'https://thesecondmessenger.com',
    siteName: 'The Second Messenger',
    locale: 'en_US',
    type: 'website',
  },
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: songs } = await payload.find({
    collection: 'songs',
    sort: '-releaseDate',
    limit: 12,
    depth: 1,
    where: {
      and: [
        { releaseDate: { less_than_equal: new Date().toISOString() } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  return (
    <>
      <MusicGroupSchema />
      <HomeSections songs={songs as unknown as SongPreview[]} />
    </>
  )
}
