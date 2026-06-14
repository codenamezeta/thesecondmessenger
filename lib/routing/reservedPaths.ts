/**
 * Top-level path segments that must never be treated as bare song/post slugs.
 * Keep in sync with `app/(frontend)/*` routes and static synonym redirects.
 */
export const RESERVED_TOP_LEVEL_SEGMENTS = new Set([
  'admin',
  'api',
  'account',
  'bio',
  'crew',
  'login',
  'logout',
  'me',
  'memberships',
  'music',
  'posts',
  'videos',
  'privacy-policy',
  'terms-of-service',
  'theme-playground',
  'songs',
  'song',
  'tag',
  'tags',
  'playlists',
  'releases',
])

export function isReservedTopLevelSegment(segment: string): boolean {
  return RESERVED_TOP_LEVEL_SEGMENTS.has(segment.toLowerCase())
}
