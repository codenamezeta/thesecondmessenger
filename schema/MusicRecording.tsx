import type { Song } from '@/payload-types'
import { songToStructuredData } from '@/lib/seo/songToStructuredData'
import { getServerSideURL } from '@/utilities/getURL'

export const MusicRecordingSchema = ({ song }: { song: Song }) => {
  const schema = songToStructuredData({
    song,
    serverUrl: getServerSideURL(),
  })

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
