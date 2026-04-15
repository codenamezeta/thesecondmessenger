export type GatedContentKind =
  | 'audio'
  | 'image'
  | 'video'
  | 'download'
  | 'pdf'
  | 'text'

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
  if (lower === 'application/pdf') return 'pdf'
  if (lower.startsWith('text/')) return 'text'
  if (
    lower === 'application/zip' ||
    lower === 'application/x-zip-compressed' ||
    lower === 'application/x-zip' ||
    lower === 'application/x-7z-compressed' ||
    lower === 'application/x-rar-compressed' ||
    lower === 'application/gzip'
  ) {
    return 'download'
  }
  return null
}
