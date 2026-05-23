'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
 * State lives in React `useState` (instant in-memory updates). The URL
 * is mirrored in a `useEffect` via `window.history.replaceState` so we
 * never touch the Next.js Router during render (which triggers the
 * "Cannot update Router while rendering MusicArchive" error).
 *
 * Browser back / forward (popstate) re-syncs state from the URL so
 * the in-page state never drifts from what the address bar shows.
 */
export function useMusicFilterState(initial: FilterState) {
  const pathname = usePathname()
  const [state, setStateRaw] = useState<FilterState>(initial)
  /** Skip the URL-write effect right after popstate — URL is already correct. */
  const skipNextUrlSync = useRef(false)

  const setState = useCallback((next: Updater) => {
    setStateRaw((prev) =>
      typeof next === 'function'
        ? (next as (p: FilterState) => FilterState)(prev)
        : next,
    )
  }, [])

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }

    const params = serializeFilterState(state).toString()
    const nextSearch = params ? `?${params}` : ''
    if (window.location.search === nextSearch) return

    const url = params ? `${pathname}?${params}` : pathname
    window.history.replaceState(null, '', url)
  }, [state, pathname])

  useEffect(() => {
    const handlePopState = () => {
      skipNextUrlSync.current = true
      const usp = new URLSearchParams(window.location.search)
      setStateRaw(parseSearchParams(usp))
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return [state, setState] as const
}
