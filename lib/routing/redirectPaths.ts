/**
 * Maps Payload redirect-plugin collections to their public URL prefixes.
 * Collection slugs in Payload do not always match frontend route segments.
 */
export const ROUTABLE_COLLECTIONS = [
  'posts',
  'songs',
  'releases',
  'playlists',
] as const

export type RoutableCollection = (typeof ROUTABLE_COLLECTIONS)[number]

const COLLECTION_PATH_PREFIX: Record<RoutableCollection, string> = {
  posts: '/posts',
  songs: '/music',
  releases: '/music',
  playlists: '/music',
}

export function isRoutableCollection(
  value: string,
): value is RoutableCollection {
  return (ROUTABLE_COLLECTIONS as readonly string[]).includes(value)
}

export function canonicalDocumentPath(
  collection: RoutableCollection,
  slug: string,
): string {
  return `${COLLECTION_PATH_PREFIX[collection]}/${slug}`
}
