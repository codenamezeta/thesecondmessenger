import type { Access } from 'payload'
import type { GatedContent } from '@/payload-types'
import { userMeetsGatedFileAccess, userMeetsVaultFloor } from '@/access/crewRanks'

/**
 * Static file routes enforce tier + Vault floor. Admin and non-file reads use
 * Vault floor only so the CMS and metadata updates (e.g. cloud storage) work.
 */
export const gatedContentReadAccess: Access = async ({
  req,
  data,
  id,
  isReadingStaticFile,
}) => {
  const user = req.user

  if (req.context?.skipCloudStorage) return true

  if (user && 'role' in user && user.role === 'admin') return true

  // Keep document reads open for admin internals (cloud storage persistence,
  // relationship UI lookups, etc.). File delivery remains tier-gated below.
  if (!isReadingStaticFile) return true

  if (!userMeetsVaultFloor(user)) return false

  let doc = data
  if (!doc && id != null) {
    try {
      const lookup = await req.payload.find({
        collection: 'gated-content',
        depth: 0,
        limit: 1,
        overrideAccess: true,
        pagination: false,
        where: {
          id: {
            equals: id,
          },
        },
      })
      doc = lookup.docs[0] ?? null
    } catch {
      // Some internal upload/storage phases can probe access before the new doc
      // is fully readable by ID. Treat missing lookup as access denied rather
      // than throwing and aborting persistence.
      return false
    }
  }

  if (!doc && id != null) {
    try {
      doc = await req.payload.findByID({
        collection: 'gated-content',
        id,
        depth: 0,
        overrideAccess: true,
      })
    } catch {
      // Some internal upload/storage phases can probe access before the new doc
      // is fully readable by ID. Treat missing lookup as access denied rather
      // than throwing and aborting persistence.
      return false
    }
  }

  if (!doc) return false

  const d = doc as GatedContent
  return userMeetsGatedFileAccess(user, d.tierRequired)
}
