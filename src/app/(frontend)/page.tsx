import { getPayload } from 'payload'
import configPromise from '@payload-config'
import LatestReleases from '@/components/LatestReleases'
// import { VideoCard } from '@/components/VideoCard'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Button } from '@/components/ui/button'

// Keep your existing metadata export if you are using it
export { generateMetadata } from './[slug]/page'

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Songs
  const songs = await payload.find({
    collection: 'songs',
    depth: 2,
    limit: 10,
    sort: '-releaseDate',
  })

  // console.log(songs)

  return (
    <main className="pt-44 container">
      <h1
        className="pb-12 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent tracking-widest font-heading text-center"
        style={{ fontSize: '12vw', lineHeight: '0.85' }}
      >
        The Second Messenger
      </h1>

      <NewsletterSignup />
      <LatestReleases songs={songs} />
      {/* <VideoCard video={{ title: 'Test Video', youtubeId: 'e4uenzs0Lfs' }} /> */}
    </main>
  )
}
