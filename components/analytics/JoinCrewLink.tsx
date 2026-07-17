'use client'

import Link from 'next/link'
import type { ComponentProps } from 'react'
import { trackJoinCrewClick } from '@/lib/analytics/ga'

type JoinCrewLinkProps = Omit<ComponentProps<typeof Link>, 'onClick'> & {
  /** GA4 `location` dimension — where on the site this CTA lives */
  location: string
}

/**
 * Link wrapper that fires `trackJoinCrewClick` before navigation.
 * Use for /crew and /memberships CTAs on content → upgrade paths.
 */
export function JoinCrewLink({
  location,
  children,
  ...props
}: JoinCrewLinkProps) {
  return (
    <Link
      {...props}
      onClick={() => {
        trackJoinCrewClick({ location })
      }}
    >
      {children}
    </Link>
  )
}
