import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Tag } from '@/payload-types'
import { TAG_CATEGORIES } from '@/lib/music/tagLanding'

export function pickCanonicalTag(tags: Tag[]): Tag {
  const byPriority = [...tags].sort((a, b) => {
    const aIndex = TAG_CATEGORIES.indexOf(
      a.category as (typeof TAG_CATEGORIES)[number],
    )
    const bIndex = TAG_CATEGORIES.indexOf(
      b.category as (typeof TAG_CATEGORIES)[number],
    )
    return aIndex - bIndex
  })
  return byPriority[0] ?? tags[0]
}

export const querySongBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'songs',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
})

export const queryPostBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { _status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 0,
  })
  return result.docs[0] ?? null
})

export const queryTagsBySlug = cache(async (slug: string): Promise<Tag[]> => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'tags',
    where: { slug: { equals: slug } },
    limit: 20,
    depth: 0,
  })
  return result.docs
})
