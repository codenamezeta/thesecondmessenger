export type GatedContentKind = 'audio' | 'image' | 'video' | 'download'

/**
 * Derives how to present a gated upload from Payload's stored `mimeType`
 * (see `collections/GatedContent.ts` `upload.mimeTypes`).
 */
export function gatedContentKindFromMimeType(
  mimeType: string | null | undefined,
): GatedContentKind | null {
  if (!mimeType) return null
  const lower = mimeType.toLowerCase()
  if (lower.startsWith('audio/')) return 'audio'
  if (lower.startsWith('image/')) return 'image'
  if (lower.startsWith('video/')) return 'video'
  if (
    lower === 'application/zip' ||
    lower === 'application/x-zip-compressed' ||
    lower === 'application/x-zip'
  ) {
    return 'download'
  }
  return null
}
