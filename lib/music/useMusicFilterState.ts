'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  isFilterStateEmpty,
  parseSearchParams,
  serializeFilterState,
  type FilterState,
} from './filterState'

type Updater = FilterState | ((prev: FilterState) => FilterState)

const STORAGE_KEY = 'tsm:music-archive-filters'

function readStoredFilters(): FilterState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as FilterState
    return parseSearchParams(serializeFilterState(parsed))
  } catch {
    return null
  }
}

function persistFilters(state: FilterState): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Quota or privacy mode — non-fatal.
  }
}

/**
 * Source of truth for the `/music` page's filter state, with two-way
 * sync to the URL via the Next.js router (so back/forward stays aligned).
 *
 * When the URL has no active filters, the last in-session archive state
 * is restored from `sessionStorage` as a fallback.
 */
export function useMusicFilterState(initial: FilterState) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setStateRaw] = useState<FilterState>(initial)
  const skipNextUrlSync = useRef(false)
  const isFirstMount = useRef(true)

  const initialKey = useMemo(
    () => serializeFilterState(initial).toString(),
    [initial],
  )

  const setState = useCallback((next: Updater) => {
    setStateRaw((prev) =>
      typeof next === 'function'
        ? (next as (p: FilterState) => FilterState)(prev)
        : next,
    )
  }, [])

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false
      if (isFilterStateEmpty(initial)) {
        const stored = readStoredFilters()
        if (stored && !isFilterStateEmpty(stored)) {
          setStateRaw(stored)
          return
        }
      }
    }

    skipNextUrlSync.current = true
    setStateRaw(initial)
  }, [initialKey, initial])

  useEffect(() => {
    persistFilters(state)
  }, [state])

  useEffect(() => {
    if (skipNextUrlSync.current) {
      skipNextUrlSync.current = false
      return
    }

    const params = serializeFilterState(state).toString()
    const nextSearch = params ? `?${params}` : ''
    if (window.location.search === nextSearch) return

    const url = params ? `${pathname}?${params}` : pathname
    router.replace(url, { scroll: false })
  }, [state, pathname, router])

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
