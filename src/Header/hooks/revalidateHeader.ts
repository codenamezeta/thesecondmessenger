import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateHeader: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating header`)
    // @ts-expect-error Next.js 16 types incorrectly require a second argument
    revalidateTag('global_header')
  }

  return doc
}
