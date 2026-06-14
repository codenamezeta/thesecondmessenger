import { notFound, redirect } from 'next/navigation'

import { findRedirectForUrl } from '@/lib/routing/resolveRedirect'

interface Props {
  disableNotFound?: boolean
  url: string
}

/* This component helps us with SSR based dynamic redirects */
export const PayloadRedirects: React.FC<Props> = async ({
  disableNotFound,
  url,
}) => {
  const redirectUrl = await findRedirectForUrl(url)

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  if (disableNotFound) return null

  notFound()
}
