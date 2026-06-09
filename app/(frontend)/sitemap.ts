import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ARTIST_HOMEPAGE } from '@/lib/branding'

export const revalidate = 600

const RELEASED_SONG_WHERE = {
  and: [
    { releaseDate: { exists: true } },
    { releaseDate: { not_equals: null } },
  ],
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })

  const [songs, tags] = await Promise.all([
    payload.find({
      collection: 'songs',
      where: RELEASED_SONG_WHERE,
      limit: 1000,
      depth: 0,
    }),
    payload.find({
      collection: 'tags',
      where: { slug: { exists: true } },
      limit: 1000,
      depth: 0,
    }),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: ARTIST_HOMEPAGE,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${ARTIST_HOMEPAGE}/music`,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  const songRoutes: MetadataRoute.Sitemap = songs.docs
    .filter((song) => Boolean(song.slug))
    .map((song) => ({
      url: `${ARTIST_HOMEPAGE}/music/${song.slug}`,
      lastModified: song.updatedAt ? new Date(song.updatedAt) : undefined,
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

  const tagRoutes: MetadataRoute.Sitemap = tags.docs
    .filter((tag) => Boolean(tag.slug && tag.category))
    .map((tag) => ({
      url: `${ARTIST_HOMEPAGE}/music/tag/${tag.category}/${tag.slug}`,
      lastModified: tag.updatedAt ? new Date(tag.updatedAt) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticRoutes, ...songRoutes, ...tagRoutes]
}
