// app/(frontend)/videos/page.tsx
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getChannelVideos } from '@/actions/youtube'
import { Header } from '@/components/Header'
import { VisualLog } from '@/components/VisualLog'
import { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Visual Logs | The Second Messenger',
  description: 'Archived video transmissions and live feeds.',
}

export default async function VideosPage() {
  const payload = await getPayload({ config: configPromise })

  // 1. Fetch Live Data from YouTube
  const youtubeVideos = await getChannelVideos(50)

  // 2. Fetch All Songs that have a YouTube ID
  // We only need the ID, Title, and Slug to make the link.
  const songs = await payload.find({
    collection: 'songs',
    where: {
      youtubeId: { exists: true },
    },
    limit: 100,
    select: { youtubeId: true, title: true, slug: true },
  })

  // 3. The "Data Merge"
  // Create a lookup map for faster matching
  const songMap = new Map(songs.docs.map((s) => [s.youtubeId, s]))

  const mergedVideos = youtubeVideos.map((video) => {
    // Check if we have a song for this video
    const matchedSong = songMap.get(video.youtubeId)

    return {
      ...video,
      linkedSong: matchedSong || null, // Attach the song data if found!
    }
  })

  return (
    <article className="min-h-screen space-y-12">
      <Header
        eyebrow="// ACCESSING VIDEO ARCHIVE"
        title="Visual Logs"
        description="Accessing video archive. Select a file to initiate playback and establish comms."
        highlightStat={{ value: mergedVideos.length, label: 'Files Found' }}
      />

      <main className="container">
        <VisualLog videos={mergedVideos} />
      </main>
    </article>
  )
}
