import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getChannelVideos } from '@/actions/youtube'
import { VisualLog } from '@/components/VisualLog'
import { Metadata } from 'next'
import { Film } from 'lucide-react'

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

  const mergedVideos = youtubeVideos.map((video: any) => {
    // Check if we have a song for this video
    const matchedSong = songMap.get(video.youtubeId)

    return {
      ...video,
      linkedSong: matchedSong || null, // Attach the song data if found!
    }
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between border-b border-border/50 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded text-primary">
                <Film size={24} />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading text-foreground uppercase tracking-widest">
                Visual Logs
              </h1>
            </div>
            <p className="text-foreground/50 font-mono max-w-xl">
              Accessing video archive. Select a file to initiate playback and establish comms.
            </p>
          </div>

          <div className="hidden md:block text-right">
            <div className="text-3xl font-heading text-foreground">{mergedVideos.length}</div>
            <div className="text-[10px] text-primary uppercase tracking-widest font-mono">
              Files Found
            </div>
          </div>
        </div>

        {/* Pass the merged data to the client */}
        <VisualLog videos={mergedVideos} />
      </div>
    </div>
  )
}
