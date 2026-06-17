import type { GatedContent } from '@/payload-types'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const GATED_COLLECTION_SLUG = 'gated-content' as const

/** Matches `payload.config.ts` s3Storage `gated-content` prefix (not a CMS field). */
const GATED_OBJECT_PREFIX = process.env.R2_PREFIX || 'gated-content'

/** Must match `payload.config.ts` `s3Storage({ enabled: … })` and `GatedContent` upload mode. */
function isGatedObjectStorageEnabled(): boolean {
  return Boolean(process.env.R2_BUCKET && process.env.R2_ENDPOINT)
}

function payloadFileRoute(asset: GatedContent): string {
  const filename = asset.filename
  if (!filename) return ''

  const path = `/api/${GATED_COLLECTION_SLUG}/file/${encodeURIComponent(filename)}`
  return `${path}?${new URLSearchParams({ prefix: GATED_OBJECT_PREFIX }).toString()}`
}

/**
 * Vault file URL for `<audio>` / `<video>` / downloads.
 *
 * When R2/S3 is enabled (same as production), use `/api/gated-content/file/…` so
 * `gatedContentReadAccess` runs with cookies, then Payload 302-redirects to a
 * short-lived presigned R2 URL for delivery (avoids proxying bytes through Vercel).
 *
 * When those env vars are missing (common local dev), `s3Storage` is disabled and
 * Payload falls back to `staticDir` — files that only exist in R2 will 500. In
 * that case, prefer the stored `url` if it is already an absolute object-store
 * URL (e.g. DB copied from prod). For tier-gated *private* buckets, set
 * `R2_BUCKET` + `R2_ENDPOINT` (+ keys) locally so the API route can proxy.
 */
export function getGatedContentFileUrl(asset: GatedContent): string {
  const filename = asset.filename

  if (isGatedObjectStorageEnabled() && filename) {
    return payloadFileRoute(asset)
  }

  const raw = asset.url?.trim()
  if (raw && (raw.startsWith('http://') || raw.startsWith('https://'))) {
    return getMediaUrl(asset.url)
  }

  if (filename) {
    return payloadFileRoute(asset)
  }

  return getMediaUrl(asset.url)
}
