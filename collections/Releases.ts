// src/collections/Releases.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'
import { Song } from '@/payload-types'

export const Releases: CollectionConfig = {
  slug: 'releases',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'releaseDate'],
  },
  hooks: {
    afterChange: [
      // ... folder organizer hook ...

      // --- HOOK: SYNC ART TO SONGS ---
      async ({ doc, req }) => {
        try {
          // Only run if there are tracks to update
          if (doc.tracks && doc.tracks.length > 0) {
            // Prepare data to sync
            const dataToSync: Record<string, string | number | undefined> = {}

            // Sync Cover Art if it exists
            if (doc.coverArt) {
              dataToSync.coverArt =
                typeof doc.coverArt === 'object' ? doc.coverArt.id : doc.coverArt
            }

            // Sync Release Date if it exists
            if (doc.releaseDate) {
              dataToSync.releaseDate = doc.releaseDate
            }

            if (Object.keys(dataToSync).length > 0) {
              // Handle potential populated data (objects vs IDs) for tracks
              const trackIds = doc.tracks.map((t: Song | number) => (typeof t === 'object' ? t.id : t))

              // Update ALL songs in this release's tracklist at once
              await req.payload.update({
                collection: 'songs',
                where: {
                  id: { in: trackIds }, // Select all songs in the tracklist
                },
                data: dataToSync,
              })
              req.payload.logger.info(`Synced details to ${doc.tracks.length} songs.`)
            }
          }
        } catch (err) {
          req.payload.logger.error(`Failed to sync cover art: ${err}`)
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'releaseDate',
      type: 'date',
      required: true,
    },
    {
      name: 'type',
      type: 'select',
      options: ['Single', 'Double', 'EP', 'Album', 'Other'],
      defaultValue: 'Single',
      required: true,
    },
    {
      name: 'distribution',
      type: 'select',
      options: ['Limited', 'Global', 'Exclusive', 'Other'],
      defaultValue: 'Limited',
    },
    {
      name: 'upc',
      type: 'text',
      label: 'UPC Barcode',
      admin: {
        condition: (data, siblingData) => siblingData.distribution === 'Global',
      },
    },
    {
      name: 'coverArt',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'tracks',
      type: 'relationship',
      relationTo: 'songs',
      hasMany: true,
      required: false,
      label: 'Tracklist',
      admin: {
        description: 'Drag and drop to reorder tracks.',
      },
    },
  ],
}
