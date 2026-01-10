import { CollectionConfig } from 'payload'

// --- THE HOOK LOGIC ---
import { CollectionAfterChangeHook } from 'payload'

const syncToMailingList: CollectionAfterChangeHook = async ({ doc, req, operation }) => {
  // Only run on create or update
  if (operation === 'create' || operation === 'update') {
    const { payload } = req

    if (!doc.email) return doc

    try {
      // Check if email already exists in Mailing List
      const existing = await payload.find({
        collection: 'mailing-list',
        where: { email: { equals: doc.email } },
      })

      if (existing.totalDocs === 0) {
        // Create new entry
        await payload.create({
          collection: 'mailing-list',
          data: {
            email: doc.email,
            source: 'spotify_presave',
            tags: 'presave_user',
          },
        })
        console.log(`[Sync] Added ${doc.email} to Mailing List`)
      }
    } catch (e) {
      console.error('[Sync] Failed to sync email:', e)
    }
  }
  return doc
}
// ----------------------

export const Presaves: CollectionConfig = {
  slug: 'presaves',
  hooks: {
    afterChange: [syncToMailingList], // <--- REGISTER HOOK HERE
  },
  // ... rest of your config (admin, fields, etc.)
  admin: {
    useAsTitle: 'email',
    group: 'Audience Data',
  },
  fields: [
    // ... your existing fields
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'spotifyId',
      type: 'text',
      unique: true,
    },
    {
      name: 'refreshToken',
      type: 'text',
      admin: { hidden: true },
    },
    {
      name: 'campaigns',
      type: 'relationship',
      relationTo: 'songs',
      hasMany: true,
    },
  ],
}
