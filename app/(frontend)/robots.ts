import type { MetadataRoute } from 'next'
import { ARTIST_HOMEPAGE } from '@/lib/branding'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${ARTIST_HOMEPAGE}/sitemap.xml`,
  }
}
