import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateFooter: GlobalAfterChangeHook = ({ doc, req: { payload, context } }) => {
  if (!context.disableRevalidate) {
    payload.logger.info(`Revalidating footer`)
    // @ts-expect-error Next.js 16 types incorrectly require a second argument
    revalidateTag('global_footer')
  }

  return doc
}
