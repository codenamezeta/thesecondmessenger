import type { Block } from 'payload'

export const Embed: Block = {
  slug: 'embed',
  interfaceName: 'EmbedBlock',
  fields: [
    {
      name: 'code',
      type: 'textarea',
      label: 'Embed Code (HTML / IFrame)',
      required: true,
      admin: {
        rows: 6,
        description: 'Paste the full iframe embed code (e.g. from SoundCloud, YouTube, Spotify). Only standard iframes are supported.',
      },
    },
  ],
}
