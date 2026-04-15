import type { CollectionConfig } from 'payload'
import { gatedContentReadAccess } from '@/access/gatedContentRead'

const gatedContentUsesR2 = Boolean(
  process.env.R2_BUCKET && process.env.R2_ENDPOINT,
)

const tierRequiredOptions = [
  { label: 'Lieutenant (Tier 1) and up', value: 'lieutenant' },
  { label: 'Commander (Tier 2) and up', value: 'commander' },
  { label: 'Captain (Tier 3) and up', value: 'captain' },
] as const

export const GatedContent: CollectionConfig = {
  slug: 'gated-content',
  admin: {
    useAsTitle: 'title',
    description:
      'One minimum crew rank per file. Eligible fans can view or play media in the Vault; archives and documents get a download button.',
  },
  access: {
    read: gatedContentReadAccess,
  },
  upload: {
    ...(gatedContentUsesR2
      ? { disableLocalStorage: true as const }
      : { staticDir: 'gated-content' }),
    mimeTypes: [
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/flac',
      'audio/aac',
      'audio/aiff',
      'audio/x-aiff',
      'audio/x-ms-wma',
      // Images
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      // Video
      'video/mp4',
      'video/webm',
      'video/quicktime',
      // Archives
      'application/zip',
      'application/x-zip-compressed',
      'application/x-7z-compressed',
      'application/x-rar-compressed',
      // Documents & text
      'application/pdf',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Exotic DAW / notation binaries often register as zip or octet-stream — zip first.
      'application/gzip',
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
      admin: {
        description: 'A brief description of the content.',
      },
    },
    {
      name: 'relatedSong',
      type: 'relationship',
      relationTo: 'songs',
      label: 'Related song',
      maxDepth: 0,
      admin: {
        position: 'sidebar',
        description:
          'Optional. Link this Vault file to a song. Song pages and the Song editor can surface linked files through this relationship.',
      },
    },
    {
      name: 'tierRequired',
      type: 'select',
      label: 'Minimum tier',
      defaultValue: 'lieutenant',
      options: [...tierRequiredOptions],
      required: true,
      admin: {
        position: 'sidebar',
        description:
          'Fans at this rank or higher can access the file (Vault + direct file routes). Matches Lieutenant / Commander / Captain Vault clearance in crew rules.',
      },
    },
  ],
}
