import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Metadata } from 'next'
import { MusicGroupSchema } from '@/schema/MusicGroup'
import { HomeSections } from '@/components/home/HomeSections'
import { getChannelVideos, YoutubeChannelVideo } from '@/actions/youtube'
import { buildCategoryQueues } from '@/lib/home/playCategories'
import { toSongPreview, toPremiereTeaser } from '@/lib/home/songPreview'

export const metadata: Metadata = {
  title: 'The Second Messenger • Melodic Modern Rock',
  description:
    'Independent artist. 100% unfiltered. Music built from scratch with real instruments. Enter the archive.',
  openGraph: {
    images: [
      {
        url: 'https://thesecondmessenger.com/imgs/michael-today.jpg',
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
  const now = new Date().toISOString()

  // Full released catalog (~20 songs): feeds the Music grid AND the
  // "Play something..." category queues, so tags come along at depth 1.
  const { docs: songDocs } = await payload.find({
    collection: 'songs',
    sort: '-releaseDate',
    limit: 100,
    depth: 1,
    where: {
      and: [
        { releaseDate: { less_than_equal: now } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  // Nearest upcoming scheduled premiere (if any) — powers the fixed featured
  // slot's countdown. Trimmed to safe teaser fields before leaving the server.
  const { docs: premiereDocs } = await payload.find({
    collection: 'songs',
    sort: 'premiereAt',
    limit: 1,
    depth: 1,
    where: {
      and: [
        { premiereAt: { greater_than: now } },
        { _status: { equals: 'published' } },
      ],
    },
  })

  const songs = songDocs.map(toSongPreview)
  const premiere = premiereDocs[0] ? toPremiereTeaser(premiereDocs[0]) : null
  const categoryQueues = buildCategoryQueues(songs)

  // TODO: mixed-content data model (posts as feed cards) is a Phase 3 build
  // task — for now the feed mixes songs + YouTube channel videos.
  const videos = (await getChannelVideos(3)) as YoutubeChannelVideo[]

  return (
    <>
      <MusicGroupSchema />
      <HomeSections
        songs={songs}
        videos={videos}
        premiere={premiere}
        categoryQueues={categoryQueues}
      />
    </>
  )
}
