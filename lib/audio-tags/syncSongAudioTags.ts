import sharp from 'sharp'
import type { Payload } from 'payload'
import { getServerSideURL } from '@/utilities/getURL'
import { fetchUploadBytes } from '@/lib/storage/fetchUploadBytes'
import {
  coverArtMediaUrl,
  mapSongToTagSpec,
  taggableMasterMedia,
  type TaggableUploadInfo,
  type SongForTagging,
} from './mapSongToTagSpec'
import { hashTagSpec } from './hashTagSpec'
import { writeTagsToBuffer } from './writeTagsToBuffer'
import { readDurationFromSongMasters } from '@/lib/songs/autoFillSongDuration'
import { formatDurationMmSs } from '@/lib/songs/formatDurationMmSs'

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

  await backfillSongDuration(payload, songId, song)

  // MP3 + FLAC masters (WAV is excluded — minimal embedded-tag support).
  const masters = taggableMasterMedia(song).filter((m) => m.url)
  if (masters.length === 0) {
    await markStatus(payload, songId, 'idle', null, null)
    return { status: 'skipped', reason: 'No taggable master audio attached.' }
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
  // The hash folds in the set of master file ids so attaching a new FLAC
  // master busts the cache even when the metadata itself is unchanged.
  const spec = mapSongToTagSpec({ song, coverArt: coverArtPayload })
  const masterKey = masters
    .map((m) => m.id)
    .sort((a, b) => a - b)
    .join(',')
  const hash = hashTagSpec(spec, `masters:${masterKey}`)
  const lastHash = (song as { tagsSyncedHash?: string | null }).tagsSyncedHash
  if (lastHash && lastHash === hash) {
    await markStatus(payload, songId, 'synced', hash, null)
    return { status: 'skipped', reason: 'Tag spec unchanged since last sync.' }
  }

  await markStatus(payload, songId, 'syncing', null, null)

  try {
    let totalBytesWritten = 0
    for (const master of masters) {
      totalBytesWritten += await tagAndReupload(payload, songId, master, spec)
    }

    await markStatus(payload, songId, 'synced', hash, null, totalBytesWritten)

    return { status: 'synced', hash, bytesWritten: totalBytesWritten }
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

/**
 * Download one master file, rewrite its tags from `spec`, and re-upload it
 * in place via the Media collection (the storage adapter overwrites and the
 * public URL stays stable). Returns the byte length written.
 */
async function tagAndReupload(
  payload: Payload,
  songId: number,
  master: TaggableUploadInfo,
  spec: ReturnType<typeof mapSongToTagSpec>,
): Promise<number> {
  const original = await fetchUploadBytes(master)
  const mutated = await writeTagsToBuffer(original, spec)

  await payload.update({
    collection: master.collection,
    id: master.id,
    data: {},
    file: {
      data: Buffer.from(mutated),
      mimetype: master.mimeType ?? 'audio/mpeg',
      name: master.filename ?? `song-${songId}-${master.id}`,
      size: mutated.byteLength,
    },
    overwriteExistingFiles: true,
    overrideAccess: true,
  })

  return mutated.byteLength
}

async function backfillSongDuration(
  payload: Payload,
  songId: number,
  song: SongForTagging,
): Promise<void> {
  try {
    const seconds = await readDurationFromSongMasters(
      payload,
      song as unknown as Record<string, unknown>,
    )
    if (seconds === null || song.duration === seconds) return

    await payload.update({
      collection: 'songs',
      id: songId,
      data: {
        duration: seconds,
        durationText: formatDurationMmSs(seconds),
      },
      overrideAccess: true,
      context: { skipAudioTagSync: true },
    })
    song.duration = seconds
    payload.logger.info(
      `🎵 [SyncTags] Backfilled duration ${formatDurationMmSs(seconds)} for song id=${songId}.`,
    )
  } catch (err) {
    payload.logger.warn({
      err,
      msg: `🎵 [SyncTags] Duration backfill failed for song id=${songId}.`,
    })
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
