// src/collections/Releases.ts
import { CollectionConfig } from 'payload'
import { after } from 'next/server'
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
      // --- HOOK: SYNC ART + RELEASE DATE TO THE RELEASE'S SONGS ---
      //
      // Runs AFTER the release transaction has fully committed. We must not
      // await this inside the transaction, because the Songs `afterChange`
      // cascade (including @payloadcms/plugin-search writes) is large enough
      // to trip long-lived transaction behavior on Vercel/Neon Postgres,
      // which was silently rolling the release itself back even though
      // Payload returned 201. Scheduling the sync via Next's `after(...)`
      // defers it until after the response is sent and, on Vercel, keeps
      // the function invocation alive until the work finishes. Any sync
      // failure only affects the cosmetic song fields, not the release.
      ({ doc, req }) => {
        if (!doc?.tracks || doc.tracks.length === 0) return doc

        const dataToSync: Record<string, string | number | undefined> = {}
        if (doc.coverArt) {
          dataToSync.coverArt =
            typeof doc.coverArt === 'object' ? doc.coverArt.id : doc.coverArt
        }
        if (doc.releaseDate) dataToSync.releaseDate = doc.releaseDate
        if (Object.keys(dataToSync).length === 0) return doc

        const trackIds = doc.tracks.map((t: Song | number) =>
          typeof t === 'object' ? t.id : t,
        )

        after(async () => {
          try {
            await req.payload.update({
              collection: 'songs',
              where: { id: { in: trackIds } },
              data: dataToSync,
            })
            req.payload.logger.info(
              `[Releases] Post-commit sync: updated ${trackIds.length} song(s) for release "${doc.title}" (id=${doc.id}).`,
            )
          } catch (err) {
            req.payload.logger.error({
              err,
              msg: `[Releases] Post-commit sync failed for release id=${doc.id}`,
            })
          }
        })

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
