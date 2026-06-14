import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Redirect } from '@/payload-types'
import { getCachedRedirects } from '@/utilities/getRedirects'
import {
  canonicalDocumentPath,
  isRoutableCollection,
  type RoutableCollection,
} from '@/lib/routing/redirectPaths'

function slugFromPopulatedDoc(value: unknown): string | null {
  if (
    typeof value === 'object' &&
    value !== null &&
    'slug' in value &&
    typeof (value as { slug?: unknown }).slug === 'string'
  ) {
    return (value as { slug: string }).slug
  }
  return null
}

async function slugFromReferenceValue(
  collection: RoutableCollection,
  value: unknown,
): Promise<string | null> {
  const populatedSlug = slugFromPopulatedDoc(value)
  if (populatedSlug) return populatedSlug

  const id =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && /^\d+$/.test(value)
        ? Number(value)
        : null

  if (id === null) return null

  const payload = await getPayload({ config: configPromise })
  try {
    const doc = await payload.findByID({
      collection,
      id,
      depth: 0,
    })
    return typeof doc.slug === 'string' ? doc.slug : null
  } catch {
    return null
  }
}

export async function resolveRedirectTarget(
  redirectItem: Redirect,
): Promise<string | null> {
  if (redirectItem.to?.url) {
    return redirectItem.to.url
  }

  const reference = redirectItem.to?.reference
  if (!reference?.relationTo || !isRoutableCollection(reference.relationTo)) {
    return null
  }

  const slug = await slugFromReferenceValue(
    reference.relationTo,
    reference.value,
  )
  if (!slug) return null

  return canonicalDocumentPath(reference.relationTo, slug)
}

export async function findRedirectForUrl(
  fromUrl: string,
): Promise<string | null> {
  const redirects = await getCachedRedirects()()
  const redirectItem = redirects.find((redirect) => redirect.from === fromUrl)
  if (!redirectItem) return null
  return resolveRedirectTarget(redirectItem)
}
