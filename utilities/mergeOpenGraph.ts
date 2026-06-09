import type { Metadata } from 'next'
import { ARTIST_HOMEPAGE, PRIMARY_ARTIST } from '@/lib/branding'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description:
    'Independent artist. Music built from scratch with real instruments. Enter the archive.',
  images: [
    {
      url: `${ARTIST_HOMEPAGE}/imgs/michael-today.jpg`,
    },
  ],
  siteName: PRIMARY_ARTIST,
  title: PRIMARY_ARTIST,
  url: ARTIST_HOMEPAGE,
  locale: 'en_US',
}

export const mergeOpenGraph = (
  og?: Metadata['openGraph'],
): Metadata['openGraph'] => {
  const fallbackImage = `${ARTIST_HOMEPAGE}/imgs/michael-today.jpg`

  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : [{ url: fallbackImage }],
  }
}
