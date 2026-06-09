import type { Song } from '@/payload-types'
import {
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
  type BreadcrumbJsonLdItem,
} from '@/lib/seo/breadcrumbJsonLd'
import { songToStructuredData } from '@/lib/seo/songToStructuredData'
import { getServerSideURL } from '@/utilities/getURL'

type MusicRecordingSchemaProps = {
  song: Song
  breadcrumbs?: BreadcrumbJsonLdItem[]
}

export const MusicRecordingSchema = ({
  song,
  breadcrumbs,
}: MusicRecordingSchemaProps) => {
  const recording = songToStructuredData({
    song,
    serverUrl: getServerSideURL(),
  })

  const schema =
    breadcrumbs && breadcrumbs.length > 0
      ? buildJsonLdGraph([
          recording,
          buildBreadcrumbListJsonLd(breadcrumbs),
        ])
      : recording

  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
