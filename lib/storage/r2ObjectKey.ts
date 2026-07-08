import type { TaggableUploadInfo } from '@/lib/audio-tags/mapSongToTagSpec'
import { r2GatedPrefix, r2MediaPrefix } from './r2Env'

/**
 * Mirrors `@payloadcms/plugin-cloud-storage` `sanitizePrefix` —
 * normalize slashes / drop `.` / `..` / strip leading slash.
 */
function sanitizePrefix(prefix: string): string {
  let decoded: string
  try {
    decoded = decodeURIComponent(prefix)
  } catch {
    return ''
  }
  if (/%[0-9a-f]{2}/i.test(decoded)) return ''
  return decoded
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment !== '..' && segment !== '.')
    .join('/')
    .replace(/^\/+/, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
}

/**
 * Build the R2 object key the same way `@payloadcms/storage-s3` does
 * (document prefix overrides collection prefix when present).
 */
export function r2ObjectKeyForUpload(upload: TaggableUploadInfo): string {
  if (!upload.filename) {
    throw new Error(`Missing filename for ${upload.collection} id=${upload.id}`)
  }

  const collectionPrefix =
    upload.collection === 'gated-content' ? r2GatedPrefix() : r2MediaPrefix()
  const docPrefix = sanitizePrefix(upload.prefix ?? '')
  const safeCollection = sanitizePrefix(collectionPrefix)
  const effectivePrefix = docPrefix || safeCollection

  return effectivePrefix
    ? `${effectivePrefix}/${upload.filename}`
    : upload.filename
}
