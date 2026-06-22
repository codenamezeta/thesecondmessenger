import { getClientSideURL } from '@/utilities/getURL'

function stripQueryString(url: string): string {
  const queryIndex = url.indexOf('?')
  return queryIndex >= 0 ? url.slice(0, queryIndex) : url
}

/**
 * Normalize a Payload media URL for `next/image`. Same-site absolute URLs
 * (e.g. saved against production `serverURL`) become root-relative paths so
 * local dev serves them from the current origin without extra remotePatterns.
 */
export function normalizeMediaUrlForImage(
  url: string | null | undefined,
): string {
  if (!url) return ''

  if (url.startsWith('/')) {
    return stripQueryString(url)
  }

  try {
    const parsed = new URL(url)
    if (parsed.pathname.startsWith('/api/media/')) {
      return stripQueryString(parsed.pathname)
    }
  } catch {
    // Not a parseable absolute URL — return as-is below.
  }

  return stripQueryString(url)
}

/**
 * Processes media resource URL to ensure proper formatting
 * @param url The original URL from the resource
 * @param cacheTag Optional cache tag to append to the URL
 * @returns Properly formatted URL with cache tag if provided
 */
export const getMediaUrl = (
  url: string | null | undefined,
  cacheTag?: string | null,
): string => {
  if (!url) return ''

  if (cacheTag && cacheTag !== '') {
    cacheTag = encodeURIComponent(cacheTag)
  }

  // Check if URL already has http/https protocol
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Root-relative Payload/API paths must stay relative in the document so the
  // browser uses the current origin. Prepending NEXT_PUBLIC_SERVER_URL during
  // SSR (e.g. http://127.0.0.1:3000) while the visitor uses http://localhost:3000
  // breaks cookie-auth uploads (gated-content, etc.) — cookies are host-bound.
  if (url.startsWith('/')) {
    return cacheTag ? `${url}?${cacheTag}` : url
  }

  // Otherwise prepend client-side URL (legacy non-root-relative paths)
  const baseUrl = getClientSideURL()
  return cacheTag ? `${baseUrl}${url}?${cacheTag}` : `${baseUrl}${url}`
}
