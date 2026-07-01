/**
 * Shared Cloudflare R2 env helpers for Payload storage plugins and scripts.
 */

export function isR2StorageEnabled(): boolean {
  return Boolean(process.env.R2_BUCKET && process.env.R2_ENDPOINT)
}

export function r2MediaPrefix(): string {
  return process.env.R2_MEDIA_PREFIX || 'media'
}

export function r2GatedPrefix(): string {
  return process.env.R2_PREFIX || process.env.R2_GATED_CONTENT_PREFIX || 'gated-content'
}

/** Public CDN / r2.dev base URL for world-readable `media` files (no trailing slash). */
export function r2PublicMediaBaseUrl(): string | undefined {
  const raw = process.env.R2_PUBLIC_MEDIA_BASE_URL?.trim()
  return raw ? raw.replace(/\/$/, '') : undefined
}

export function buildR2PublicMediaUrl(filename: string, prefix?: string): string {
  const base = r2PublicMediaBaseUrl()
  const keyPrefix = prefix ?? r2MediaPrefix()
  const segments = [keyPrefix, filename].filter(Boolean)
  if (base) {
    return `${base}/${segments.join('/')}`
  }
  return `/api/media/file/${encodeURIComponent(filename)}`
}

export function buildGatedContentApiUrl(
  filename: string,
  prefix?: string,
): string {
  const path = `/api/gated-content/file/${encodeURIComponent(filename)}`
  const keyPrefix = prefix ?? r2GatedPrefix()
  return keyPrefix ? `${path}?prefix=${encodeURIComponent(keyPrefix)}` : path
}
