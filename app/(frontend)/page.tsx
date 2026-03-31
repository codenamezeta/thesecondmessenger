import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { MusicGroupSchema } from '@/schema/MusicGroup'
import { HomeSections } from '@/components/home/HomeSections'
import type { SongPreview } from '@/components/home/HomeSections'

export const metadata: Metadata = {
  title: 'The Second Messenger — Foreground Music',
  description:
    'Independent artist. 100% unfiltered. Music built from scratch with real instruments. Enter the archive.',
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const { docs: songs } = await payload.find({
    collection: 'songs',
    sort: '-releaseDate',
    limit: 6,
    depth: 1,
    where: {
      _status: { equals: 'published' },
    },
  })

  return (
    <>
      <MusicGroupSchema />
      <HomeSections songs={songs as unknown as SongPreview[]} />
    </>
  )
}
