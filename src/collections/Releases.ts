// src/collections/Releases.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'

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
      async ({ doc, req, previousDoc }) => {
        try {
          // Only run if there is cover art and tracks to update
          if (doc.coverArt && doc.tracks && doc.tracks.length > 0) {
            // If this is an update, check if the cover art actually changed to save DB calls
            if (previousDoc && previousDoc.coverArt === doc.coverArt) {
              // Optional: You might want to run it anyway in case you added new tracks
              // For now, let's run it to be safe.
            }

            // Handle potential populated data (objects vs IDs)
            const coverArtId = typeof doc.coverArt === 'object' ? doc.coverArt.id : doc.coverArt
            const trackIds = doc.tracks.map((t: any) => (typeof t === 'object' ? t.id : t))

            // Update ALL songs in this release's tracklist at once
            await req.payload.update({
              collection: 'songs',
              where: {
                id: { in: trackIds }, // Select all songs in the tracklist
              },
              data: {
                coverArt: coverArtId, // "Paste" the album cover
              } as any,
            })
            req.payload.logger.info(`Synced cover art to ${doc.tracks.length} songs.`)
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
