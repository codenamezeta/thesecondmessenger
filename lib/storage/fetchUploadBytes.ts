import { getServerSideURL } from '@/utilities/getURL'

import type { TaggableUploadInfo } from '@/lib/audio-tags/mapSongToTagSpec'
import { fetchR2ObjectBytes } from './fetchR2Object'
import { isR2StorageEnabled } from './r2Env'
import { r2ObjectKeyForUpload } from './r2ObjectKey'

function isMissingKeyError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false
  const e = err as {
    name?: string
    Code?: string
    code?: string
    message?: string
  }
  return (
    e.name === 'NoSuchKey' ||
    e.Code === 'NoSuchKey' ||
    e.code === 'NoSuchKey' ||
    (typeof e.message === 'string' &&
      e.message.includes('The specified key does not exist'))
  )
}

/**
 * Download upload bytes for server-side jobs (tag sync, migrations).
 * Prefer direct R2 GetObject when configured (cron / serverless cannot rely on
 * cookies for vault files). Public media falls back to HTTP when R2 is unset.
 */
export async function fetchUploadBytes(
  upload: TaggableUploadInfo,
): Promise<Uint8Array> {
  if (isR2StorageEnabled()) {
    const key = r2ObjectKeyForUpload(upload)
    try {
      return await fetchR2ObjectBytes(key)
    } catch (err) {
      if (isMissingKeyError(err)) {
        throw new Error(
          `R2 object missing for ${upload.collection} id=${upload.id}: key="${key}" (filename="${upload.filename ?? ''}"). Re-upload the file or sync buckets so DB and R2 agree.`,
        )
      }
      throw err
    }
  }

  if (upload.collection === 'gated-content') {
    throw new Error(
      'R2 is not configured; cannot fetch gated-content without R2_BUCKET + R2_ENDPOINT.',
    )
  }

  if (!upload.url) {
    throw new Error(`Missing url for media id=${upload.id}`)
  }

  const fullUrl = upload.url.startsWith('/')
    ? `${getServerSideURL()}${upload.url}`
    : upload.url

  const res = await fetch(fullUrl)
  if (!res.ok) {
    throw new Error(
      `Upload fetch failed (${upload.filename ?? upload.id}): ${res.status} ${res.statusText}`,
    )
  }

  return new Uint8Array(await res.arrayBuffer())
}
