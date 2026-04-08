import { CollectionConfig } from 'payload'
import { isLieutenantOrHigher } from '@/access/crewRanks'

export const GatedContent: CollectionConfig = {
  slug: 'gated-content',
  admin: {
    useAsTitle: 'title',
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
      name: 'tierRequired',
      type: 'select',
      defaultValue: 'lieutenant',
      options: [
        { label: 'Lieutenant (Tier 1)', value: 'lieutenant' },
        { label: 'Commander (Tier 2)', value: 'commander' },
        { label: 'Captain (Tier 3)', value: 'captain' },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'contentType',
      type: 'select',
      options: [
        { label: 'Audio', value: 'audio' },
        { label: 'Image (High-Res Art/Tabs)', value: 'image' },
        { label: 'Video (Fly on the Wall)', value: 'video' },
        { label: 'Downloadable Archive (Stems/Zips)', value: 'download' },
      ],
      required: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
