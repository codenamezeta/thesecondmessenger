'use client'

import * as React from 'react'

import {
  DEFAULT_THEME,
  getThemeMode,
  isThemeId,
  THEME_STORAGE_KEY,
  type ThemeId,
} from '@/lib/themes'

function readStoredTheme(): ThemeId | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
    return isThemeId(stored) ? stored : null
  } catch {
    return null
  }
}

function writeStoredTheme(id: ThemeId | null) {
  try {
    if (id) window.localStorage.setItem(THEME_STORAGE_KEY, id)
    else window.localStorage.removeItem(THEME_STORAGE_KEY)
  } catch {
    // No-op (private mode / disabled storage)
  }
}

function disableTransitionsTemporarily() {
  if (typeof document === 'undefined') return

  const style = document.createElement('style')
  style.appendChild(
    document.createTextNode(
      '*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}',
    ),
  )

  document.head.appendChild(style)
  window.getComputedStyle(document.body)
  setTimeout(() => {
    document.head.removeChild(style)
  }, 1)
}

function applyTheme(id: ThemeId) {
  if (typeof document === 'undefined') return
  const mode = getThemeMode(id)
  const el = document.documentElement
  el.dataset.theme = id
  el.classList.toggle('dark', mode === 'dark')
  el.style.colorScheme = mode
  disableTransitionsTemporarily()
}

async function patchAccountTheme(userId: number, theme: ThemeId | null) {
  try {
    await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ themePreference: theme }),
    })
  } catch {
    // Best-effort; localStorage still holds the choice for this device.
  }
}

type ThemeContextValue = {
  /** The theme currently applied to the document. */
  activeTheme: ThemeId
  /** The user's explicit choice, or null when following the featured theme. */
  explicitTheme: ThemeId | null
  /** The site-wide featured/default theme. */
  siteDefault: ThemeId
  /** True when no explicit choice is set (i.e. tracking the featured theme). */
  isFollowingFeatured: boolean
  /** Has the client mounted (avoids SSR/CSR selection mismatches). */
  mounted: boolean
  /** Set an explicit theme (persists to device + account). */
  setTheme: (id: ThemeId) => void
  /** Clear the explicit choice and follow the featured theme again. */
  followFeatured: () => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

function ThemeProvider({
  children,
  siteDefault = DEFAULT_THEME,
}: {
  children: React.ReactNode
  siteDefault?: ThemeId
}) {
  const [explicitTheme, setExplicitTheme] = React.useState<ThemeId | null>(null)
  const [mounted, setMounted] = React.useState(false)
  const userIdRef = React.useRef<number | null>(null)

  const activeTheme = explicitTheme ?? siteDefault

  // 1. Adopt this device's stored choice immediately on mount.
  React.useEffect(() => {
    setMounted(true)
    const stored = readStoredTheme()
    if (stored) {
      setExplicitTheme(stored)
      applyTheme(stored)
    } else {
      applyTheme(siteDefault)
    }
    // siteDefault is request-stable; intentionally run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Reconcile with the signed-in account (cross-device preference).
  React.useEffect(() => {
    let cancelled = false

    async function syncWithAccount() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (!res.ok) return
        const data = (await res.json()) as {
          user?: { id?: number; themePreference?: unknown } | null
        }
        const user = data.user
        if (!user || typeof user.id !== 'number') return
        if (cancelled) return

        userIdRef.current = user.id
        const accountTheme = isThemeId(user.themePreference)
          ? user.themePreference
          : null
        const stored = readStoredTheme()

        if (accountTheme && !stored) {
          // Fresh device: adopt the account preference.
          setExplicitTheme(accountTheme)
          applyTheme(accountTheme)
          writeStoredTheme(accountTheme)
        } else if (!accountTheme && stored) {
          // Chose a theme (possibly while logged out) but account is empty —
          // persist it so it follows them across devices.
          void patchAccountTheme(user.id, stored)
        }
      } catch {
        // Anonymous or offline: device storage already governs the theme.
      }
    }

    void syncWithAccount()
    return () => {
      cancelled = true
    }
  }, [])

  const setTheme = React.useCallback((next: ThemeId) => {
    setExplicitTheme(next)
    applyTheme(next)
    writeStoredTheme(next)
    if (userIdRef.current != null) {
      void patchAccountTheme(userIdRef.current, next)
    }
  }, [])

  const followFeatured = React.useCallback(() => {
    setExplicitTheme(null)
    applyTheme(siteDefault)
    writeStoredTheme(null)
    if (userIdRef.current != null) {
      void patchAccountTheme(userIdRef.current, null)
    }
  }, [siteDefault])

  // Keep the document in sync if the featured theme changes while following it.
  React.useEffect(() => {
    if (mounted && explicitTheme === null) {
      applyTheme(siteDefault)
    }
  }, [siteDefault, explicitTheme, mounted])

  // Cross-tab sync of the device choice.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== THEME_STORAGE_KEY) return
      const next = isThemeId(e.newValue) ? e.newValue : null
      setExplicitTheme(next)
      applyTheme(next ?? siteDefault)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [siteDefault])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      activeTheme,
      explicitTheme,
      siteDefault,
      isFollowingFeatured: explicitTheme === null,
      mounted,
      setTheme,
      followFeatured,
    }),
    [
      activeTheme,
      explicitTheme,
      siteDefault,
      mounted,
      setTheme,
      followFeatured,
    ],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeProvider }
