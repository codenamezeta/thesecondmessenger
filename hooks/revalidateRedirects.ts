import type { CollectionAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateRedirects: CollectionAfterChangeHook = ({ doc, req: { payload } }) => {
  payload.logger.info(`Revalidating redirects`)
  // @ts-expect-error Next.js 16 types incorrectly require a second argument
  revalidateTag('redirects')

  return doc
}
