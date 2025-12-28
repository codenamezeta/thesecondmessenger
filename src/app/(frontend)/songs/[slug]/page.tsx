import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import RichText from '@/components/RichText'

type Args = {
  params: Promise<{
    slug?: string
  }>
}

export default async function SongPage({ params: paramsPromise }: Args) {
  const { slug = '' } = await paramsPromise
  const payload = await getPayload({ config: configPromise })

  const { docs: songs } = await payload.find({
    collection: 'songs',
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  })

  const song = songs[0]

  if (!song) return notFound()

  return (
    <main className="container">
      {song.about && <RichText data={song.about} className="rich-text" />}

      {!song.about && <p>No rich text content found in the "About" field for this song.</p>}
    </main>
  )
}
