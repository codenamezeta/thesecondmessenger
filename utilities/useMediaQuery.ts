'use client'

import { useSyncExternalStore } from 'react'

/**
 * Returns true if the given CSS media query currently matches.
 * Defaults to `false` on first render (mobile-first SSR safe).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query)
      media.addEventListener('change', callback)
      return () => media.removeEventListener('change', callback)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
