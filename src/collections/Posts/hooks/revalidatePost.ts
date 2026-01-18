import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidatePath, revalidateTag } from 'next/cache'

import type { Post } from '../../../payload-types'

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    if (doc._status === 'published') {
      const path = `/posts/${doc.slug}`

      payload.logger.info(`Revalidating post at path: ${path}`)

      try {
        revalidatePath(path)
        revalidatePath('/posts')
        // @ts-expect-error Next.js 16 types incorrectly require a second argument
        revalidateTag('posts-sitemap')
      } catch (error) {
        payload.logger.error({ msg: 'Error revalidating path', error })
      }
    }

    // If the post was previously published, we need to revalidate the old path
    if (previousDoc._status === 'published' && doc._status !== 'published') {
      const oldPath = `/posts/${previousDoc.slug}`

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      try {
        revalidatePath(oldPath)
        revalidatePath('/posts')
        // @ts-expect-error Next.js 16 types incorrectly require a second argument
        revalidateTag('posts-sitemap')
      } catch (error) {
        payload.logger.error({ msg: 'Error revalidating old path', error })
      }
    }
  }
  return doc
}

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  req: { context, payload },
}) => {
  if (!context.disableRevalidate) {
    const path = `/posts/${doc?.slug}`

    try {
      revalidatePath(path)
      revalidatePath('/posts')
      // @ts-expect-error Next.js 16 types incorrectly require a second argument
      revalidateTag('posts-sitemap')
    } catch (error) {
      payload.logger.error({ msg: 'Error revalidating path', error })
    }
  }

  return doc
}
