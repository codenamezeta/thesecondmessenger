import { redirect } from 'next/navigation'

import { PayloadRedirects } from '@/components/PayloadRedirects'
import { isReservedTopLevelSegment } from '@/lib/routing/reservedPaths'
import { queryPostBySlug, querySongBySlug } from '@/lib/routing/slugLookups'

type Args = {
  params: Promise<{ slug: string }>
}

/**
 * Resolves bare `/{slug}` URLs when users omit the `/music` or `/posts` prefix.
 * Real app routes (e.g. `/bio`, `/crew`) take precedence via the filesystem router.
 */
export default async function BareSlugResolverPage({ params }: Args) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  if (isReservedTopLevelSegment(decodedSlug) || decodedSlug.includes('.')) {
    return <PayloadRedirects url={`/${decodedSlug}`} />
  }

  const song = await querySongBySlug(decodedSlug)
  if (song) {
    redirect(`/music/${decodedSlug}`)
  }

  const post = await queryPostBySlug(decodedSlug)
  if (post) {
    redirect(`/posts/${decodedSlug}`)
  }

  return <PayloadRedirects url={`/${decodedSlug}`} />
}
