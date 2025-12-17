// src/utils/mediaHelpers.ts

// --- HELPER: Find or Create a UI Folder ---
export const getOrCreateFolder = async (
  payload: any,
  folderName: string,
  parentId?: string | number,
  adopt = false,
) => {
  // Default to the standard slug, but try to detect if it's different
  let collectionSlug = 'folders'

  // Dynamically find the correct folder collection slug
  if (payload?.config?.collections) {
    // 1. Check for exact match 'folders' (defined in your config)
    const hasFolders = payload.config.collections.find((c: any) => c.slug === 'folders')

    // 2. Fallback to 'payload-folders' or similar if 'folders' isn't found
    if (!hasFolders) {
      const fallback = payload.config.collections.find((c: any) => c.slug.includes('folders'))
      if (fallback) collectionSlug = fallback.slug
    }
  }

  // console.log(
  //   `[MediaHelper] Looking for folder "${folderName}" in collection "${collectionSlug}" (Parent: ${parentId || 'ROOT'})`,
  // )

  try {
    // 1. Search for existing folder
    const existing = await payload.find({
      collection: collectionSlug,
      where: {
        name: { equals: folderName },
      },
      pagination: false,
      limit: 100,
    })

    const match = existing.docs.find((doc: any) => {
      const docParentId = typeof doc.parent === 'object' && doc.parent ? doc.parent.id : doc.parent
      if (parentId) {
        return docParentId == parentId
      }
      return !docParentId
    })

    if (match) {
      console.log(`[MediaHelper] ✅ Found existing folder: ${match.id}`)
      return match.id
    }

    // 1.5 Adopt existing folder if allowed
    if (adopt && existing.docs.length > 0) {
      const orphan = existing.docs[0]
      console.log(`[MediaHelper] ♻️ Adopting existing folder "${folderName}" (${orphan.id})`)
      await payload.update({
        collection: collectionSlug,
        id: orphan.id,
        data: { parent: parentId },
      })
      return orphan.id
    }

    // 2. Create if not found
    const folderData: any = { name: folderName }
    if (parentId) folderData.parent = parentId

    const newFolder = await payload.create({
      collection: collectionSlug,
      data: folderData,
    })

    // Force update parent if it wasn't set correctly during create
    if (parentId) {
      const createdParentId =
        typeof newFolder.parent === 'object' ? newFolder.parent?.id : newFolder.parent
      if (createdParentId != parentId) {
        console.log(
          `[MediaHelper] ⚠️ Parent mismatch after create. Force updating folder ${newFolder.id} to parent ${parentId}`,
        )
        await payload.update({
          collection: collectionSlug,
          id: newFolder.id,
          data: { parent: parentId },
        })
      }
    }

    console.log(`[MediaHelper] ✨ Created new folder: ${newFolder.id}`)
    return newFolder.id
  } catch (error) {
    console.error(`Error managing folder '${folderName}':`, error)
    return null
  }
}

// --- HELPER: Move File to Folder & Update Prefix ---
export const organizeFile = async (
  payload: any,
  fileId: string | number | { id: string | number },
  itemName: string,
  subFolder: string,
  rootDirectory: string,
) => {
  const id = typeof fileId === 'object' && fileId !== null ? fileId.id : fileId
  if (!id) return

  console.log(`[MediaHelper] Organizing File ${id} -> ${rootDirectory}/${itemName}/${subFolder}`)

  try {
    // 1. Level 1: Root Folder (e.g. "Songs")
    const rootFolderId = await getOrCreateFolder(payload, rootDirectory, undefined, false)
    if (!rootFolderId) return

    // 2. Level 2: Project Folder (e.g. "Test Song")
    const projectFolderId = await getOrCreateFolder(payload, itemName, rootFolderId, true) // Adopt project folders
    if (!projectFolderId) return

    // 3. Level 3: Category Folder (e.g. "Masters")
    const targetFolderId = await getOrCreateFolder(payload, subFolder, projectFolderId, false)
    if (!targetFolderId) return

    // 4. Update the File
    const file = await payload.findByID({ collection: 'media', id })

    const currentFolderId =
      typeof file.folder === 'object' && file.folder !== null ? file.folder.id : file.folder

    // Only update if it's not already correct
    if (file && currentFolderId != targetFolderId) {
      await payload.update({
        collection: 'media',
        id,
        data: {
          folder: targetFolderId, // Updates the UI
        },
      })
      console.log(
        `[MediaHelper] 🚀 Moved file ${id} to UI Folder: ${rootDirectory} > ${itemName} > ${subFolder}`,
      )
    } else {
      // console.log(`[MediaHelper] File ${id} already in correct folder.`)
    }
  } catch (error) {
    console.error(`Error organizing file ${id}:`, error)
  }
}
