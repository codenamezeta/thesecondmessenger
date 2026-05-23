'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  parseSearchParams,
  serializeFilterState,
  type FilterState,
} from './filterState'

type Updater = FilterState | ((prev: FilterState) => FilterState)

/**
 * Source of truth for the `/music` page's filter state, with two-way
 * sync to the URL.
 *
 * State lives in React `useState` (instant in-memory updates, no
 * re-render storms from Next.js routing). The URL is mirrored via
 * `window.history.replaceState` — same effect as `router.replace`
 * without triggering a navigation cycle, so every keystroke in the
 * search box stays cheap.
 *
 * Browser back / forward (popstate) re-syncs state from the URL so
 * the in-page state never drifts from what the address bar shows.
 */
export function useMusicFilterState(initial: FilterState) {
  const pathname = usePathname()
  const [state, setStateRaw] = useState<FilterState>(initial)

  const setState = useCallback(
    (next: Updater) => {
      setStateRaw((prev) => {
        const newState =
          typeof next === 'function'
            ? (next as (p: FilterState) => FilterState)(prev)
            : next
        if (typeof window !== 'undefined') {
          const params = serializeFilterState(newState).toString()
          const url = params ? `${pathname}?${params}` : pathname
          window.history.replaceState(null, '', url)
        }
        return newState
      })
    },
    [pathname],
  )

  useEffect(() => {
    const handlePopState = () => {
      const usp = new URLSearchParams(window.location.search)
      setStateRaw(parseSearchParams(usp))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return [state, setState] as const
}
