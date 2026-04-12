import { CollectionConfig } from 'payload'
import { isLieutenantOrHigher } from '@/access/crewRanks'

export const GatedContent: CollectionConfig = {
  slug: 'gated-content',
  admin: {
    useAsTitle: 'title',
    description:
      "Audio, image, video, and zip downloads are shown in the Vault from the file's MIME type (no extra content-type field).",
  },
  access: {
    read: isLieutenantOrHigher, // Server-side block for unauthorized downloads
  },
  upload: {
    staticDir: 'gated-content',
    mimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/aac',
      'application/zip',
      'image/jpeg',
      'image/png',
      'video/mp4',
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
      name: 'tierRequired',
      type: 'select',
      defaultValue: 'lieutenant',
      options: [
        { label: 'Lieutenant (Tier 1)', value: 'lieutenant' },
        { label: 'Commander (Tier 2)', value: 'commander' },
        { label: 'Captain (Tier 3)', value: 'captain' },
      ],
      required: true,
    },
  ],
}
