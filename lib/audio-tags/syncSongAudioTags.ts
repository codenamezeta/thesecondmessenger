import sharp from 'sharp'
import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import {
  coverArtMediaUrl,
  mapSongToTagSpec,
  masterAudioMediaInfo,
  type SongForTagging,
} from './mapSongToTagSpec'
import { hashTagSpec } from './hashTagSpec'
import { writeTagsToBuffer } from './writeTagsToBuffer'

export type SyncResult =
  | { status: 'synced'; hash: string; bytesWritten: number }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; error: string }

/**
 * End-to-end audio tag sync for a single song:
 *   1. Re-fetch the song with full depth.
 *   2. Build the canonical TagSpec from the CMS fields.
 *   3. Compare against the previously synced hash; skip if unchanged.
 *   4. Download the master audio bytes.
 *   5. Resize the cover art to a 1400² JPEG via sharp.
 *   6. Write the new tags into the buffer with taglib-wasm.
 *   7. Re-upload via `payload.update()` on the Media doc — the storage
 *      adapter handles overwrite-in-place and returns the same URL.
 *   8. Stamp `tagsSyncedAt`, `tagsSyncedHash`, `tagSyncStatus` on the
 *      Song. Errors are recorded on `tagSyncError`.
 */
export async function syncSongAudioTags(
  payload: Payload,
  songId: number,
): Promise<SyncResult> {
  // Hydrate the song with depth so all relationships resolve.
  const song = (await payload.findByID({
    collection: 'songs',
    id: songId,
    depth: 2,
    overrideAccess: true,
  })) as unknown as SongForTagging

  const audio = masterAudioMediaInfo(song)
  if (!audio || !audio.url) {
    await markStatus(payload, songId, 'idle', null, null)
    return { status: 'skipped', reason: 'No masterAudio attached.' }
  }

  // 1. Resolve cover art (optional).
  const coverUrl = coverArtMediaUrl(song, getServerSideURL())
  let coverArtPayload: { data: Uint8Array; mimeType: string } | undefined
  if (coverUrl) {
    try {
      const coverRes = await fetch(coverUrl)
      if (coverRes.ok) {
        const coverBytes = new Uint8Array(await coverRes.arrayBuffer())
        const resized = await sharp(coverBytes)
          .resize(1400, 1400, { fit: 'cover' })
          .jpeg({ quality: 90, mozjpeg: true })
          .toBuffer()
        coverArtPayload = {
          data: new Uint8Array(resized),
          mimeType: 'image/jpeg',
        }
      } else {
        payload.logger.warn(
          `🎵 [SyncTags] Cover art fetch failed (${coverRes.status}) for song id=${songId}.`,
        )
      }
    } catch (err) {
      payload.logger.warn({
        err,
        msg: `🎵 [SyncTags] Cover art resize failed for song id=${songId}; proceeding without art.`,
      })
    }
  }

  // 2. Build spec + hash. Short-circuit if nothing meaningful changed.
  const spec = mapSongToTagSpec({ song, coverArt: coverArtPayload })
  const hash = hashTagSpec(spec)
  const lastHash = (song as { tagsSyncedHash?: string | null }).tagsSyncedHash
  if (lastHash && lastHash === hash) {
    await markStatus(payload, songId, 'synced', hash, null)
    return { status: 'skipped', reason: 'Tag spec unchanged since last sync.' }
  }

  await markStatus(payload, songId, 'syncing', null, null)

  try {
    // 3. Download the master audio.
    const audioFullUrl = audio.url.startsWith('/')
      ? `${getServerSideURL()}${audio.url}`
      : audio.url
    const audioRes = await fetch(audioFullUrl)
    if (!audioRes.ok) {
      throw new Error(
        `Master audio fetch failed: ${audioRes.status} ${audioRes.statusText}`,
      )
    }
    const original = new Uint8Array(await audioRes.arrayBuffer())

    // 4. Mutate.
    const mutated = await writeTagsToBuffer(original, spec)

    // 5. Re-upload via Payload's Media collection. The storage adapter
    // (Vercel Blob in our case) overwrites in place by default and the
    // public URL stays stable.
    await payload.update({
      collection: 'media',
      id: audio.id,
      data: {},
      file: {
        data: Buffer.from(mutated),
        mimetype: audio.mimeType ?? 'audio/mpeg',
        name: audio.filename ?? `song-${songId}.mp3`,
        size: mutated.byteLength,
      },
      overwriteExistingFiles: true,
      overrideAccess: true,
    })

    await markStatus(payload, songId, 'synced', hash, null, mutated.byteLength)

    return { status: 'synced', hash, bytesWritten: mutated.byteLength }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await markStatus(payload, songId, 'error', null, message)
    payload.logger.error({
      err,
      msg: `🎵 [SyncTags] Sync failed for song id=${songId}.`,
    })
    return { status: 'error', error: message }
  }
}

async function markStatus(
  payload: Payload,
  songId: number,
  status: 'idle' | 'queued' | 'syncing' | 'synced' | 'error',
  hash: string | null,
  error: string | null,
  bytesWritten?: number,
): Promise<void> {
  const data: Record<string, unknown> = {
    tagSyncStatus: status,
  }
  if (status === 'synced') {
    data.tagsSyncedAt = new Date().toISOString()
    data.tagSyncError = null
    if (hash) data.tagsSyncedHash = hash
  }
  if (status === 'error') {
    data.tagSyncError = error ?? 'Unknown error'
  }
  if (status === 'idle') {
    data.tagSyncError = null
  }

  try {
    await payload.update({
      collection: 'songs',
      id: songId,
      data,
      overrideAccess: true,
      // Bypass our own afterChange so we don't loop.
      context: { skipAudioTagSync: true },
    })
  } catch (err) {
    payload.logger.warn({
      err,
      msg: `🎵 [SyncTags] Failed to update sync status for song id=${songId} (status=${status}, bytes=${bytesWritten ?? 'n/a'}).`,
    })
  }
}
