import type { GatedContent } from '@/payload-types'

/**
 * Same-origin download URL for gated assets.
 *
 * We cannot rely on `<a download>` with cross-origin signed R2 URLs: many browsers
 * will ignore the attribute and play audio inline (notably FLAC). This endpoint
 * generates a signed R2 GET URL with `Content-Disposition: attachment` so the
 * browser downloads reliably.
 */
export function getGatedContentDownloadUrl(asset: GatedContent): string {
  if (!asset?.filename || !asset?.id) return ''
  const params = new URLSearchParams({
    id: String(asset.id),
    filename: asset.filename,
  })
  return `/api/gated-content/download?${params.toString()}`
}

