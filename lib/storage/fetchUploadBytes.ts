import { getServerSideURL } from '@/utilities/getURL'

import type { TaggableUploadInfo } from '@/lib/audio-tags/mapSongToTagSpec'
import { fetchR2ObjectBytes } from './fetchR2Object'
import { r2GatedPrefix, r2MediaPrefix } from './r2Env'

function r2KeyForUpload(upload: TaggableUploadInfo): string {
  const prefix =
    upload.collection === 'gated-content'
      ? upload.prefix ?? r2GatedPrefix()
      : r2MediaPrefix()
  if (!upload.filename) {
    throw new Error(`Missing filename for ${upload.collection} id=${upload.id}`)
  }
  return `${prefix}/${upload.filename}`
}

/**
 * Download upload bytes for server-side jobs (tag sync, migrations).
 * Public media: HTTP fetch. Vault files: direct R2 GetObject (no session cookie).
 */
export async function fetchUploadBytes(
  upload: TaggableUploadInfo,
): Promise<Uint8Array> {
  if (upload.collection === 'gated-content') {
    return fetchR2ObjectBytes(r2KeyForUpload(upload))
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
