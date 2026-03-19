// src/utils/mediaHelpers.ts

import type { Payload } from "payload"

type FolderDocLike = {
  id: number
  folder?: number | null | { id: number } | null
}

// --- HELPER: Find or Create a UI Folder ---
export const getOrCreateFolder = async (
  payload: Payload,
  folderName: string,
  parentId?: number,
  adopt = false,
) : Promise<number | null> => {
  // Payload's built-in folders collection slug
  const collectionSlug = "payload-folders" as const

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

    const match = existing.docs.find((doc: unknown) => {
      const typedDoc = doc as FolderDocLike
      const docFolderId =
        typeof typedDoc.folder === "object" && typedDoc.folder ? typedDoc.folder.id : typedDoc.folder
      if (parentId !== undefined) return docFolderId === parentId
      return docFolderId == null
    })

    if (match) {
      console.log(`[MediaHelper] ✅ Found existing folder: ${match.id}`)
      return match.id as number
    }

    // 1.5 Adopt existing folder if allowed
    if (adopt && existing.docs.length > 0) {
      const orphan = existing.docs[0]
      console.log(`[MediaHelper] ♻️ Adopting existing folder "${folderName}" (${orphan.id})`)
      await payload.update({
        collection: collectionSlug,
        id: orphan.id,
        data: { folder: parentId ?? null },
      })
      return orphan.id as number
    }

    // 2. Create if not found
    const folderData: { name: string; folder?: number | null } = { name: folderName }
    if (parentId !== undefined) folderData.folder = parentId

    const newFolder = await payload.create({
      collection: collectionSlug,
      data: folderData,
    })

    // Force update parent if it wasn't set correctly during create
    if (parentId) {
      const createdParentId =
        typeof newFolder.folder === "object" ? newFolder.folder?.id : newFolder.folder
      if (createdParentId != parentId) {
        console.log(
          `[MediaHelper] ⚠️ Parent mismatch after create. Force updating folder ${newFolder.id} to parent ${parentId}`,
        )
        await payload.update({
          collection: collectionSlug,
          id: newFolder.id,
          data: { folder: parentId ?? null },
        })
      }
    }

    console.log(`[MediaHelper] ✨ Created new folder: ${newFolder.id}`)
    return newFolder.id as number
  } catch (error) {
    console.error(`Error managing folder '${folderName}':`, error)
    return null
  }
}

// --- HELPER: Move File to Folder & Update Prefix ---
export const organizeFile = async (
  payload: Payload,
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
