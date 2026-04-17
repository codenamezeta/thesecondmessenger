'use client'

import * as React from 'react'

export type ThemeSetting = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'
const MEDIA_QUERY_DARK = '(prefers-color-scheme: dark)'

function isValidThemeSetting(value: string | null): value is ThemeSetting {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readInitialThemeSetting(): ThemeSetting {
  if (typeof window === 'undefined') return 'dark'

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isValidThemeSetting(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function resolveTheme(
  themeSetting: ThemeSetting,
  systemPrefersDark: boolean,
): 'light' | 'dark' {
  if (themeSetting === 'system') return systemPrefersDark ? 'dark' : 'light'
  return themeSetting
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

type ThemeContextValue = {
  themeSetting: ThemeSetting
  resolvedTheme: 'light' | 'dark'
  setTheme: (next: ThemeSetting) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return ctx
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSetting, setThemeSetting] = React.useState<ThemeSetting>('system')
  const [systemPrefersDark, setSystemPrefersDark] = React.useState(false)

  const setTheme = React.useCallback((next: ThemeSetting) => {
    setThemeSetting(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // No-op (private mode / disabled storage)
    }
  }, [])

  React.useEffect(() => {
    setThemeSetting(readInitialThemeSetting())

    const mql = window.matchMedia(MEDIA_QUERY_DARK)
    setSystemPrefersDark(mql.matches)

    const onChange = () => setSystemPrefersDark(mql.matches)
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])

  const resolvedTheme = resolveTheme(themeSetting, systemPrefersDark)

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme

    disableTransitionsTemporarily()
  }, [resolvedTheme])

  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      if (!isValidThemeSetting(e.newValue)) return
      setThemeSetting(e.newValue)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  React.useEffect(() => {
    function isTypingTarget(target: EventTarget | null) {
      if (!(target instanceof HTMLElement)) return false
      return (
        target.isContentEditable ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      )
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key.toLowerCase() !== 'd') return
      if (isTypingTarget(event.target)) return

      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [resolvedTheme, setTheme])

  const value = React.useMemo(
    () => ({ themeSetting, resolvedTheme, setTheme }),
    [themeSetting, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export { ThemeProvider }
