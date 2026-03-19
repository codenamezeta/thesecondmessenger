'use client'

import * as React from 'react'

type ThemeSetting = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'theme'
const MEDIA_QUERY_DARK = '(prefers-color-scheme: dark)'

function isValidThemeSetting(value: string | null): value is ThemeSetting {
  return value === 'light' || value === 'dark' || value === 'system'
}

function readInitialThemeSetting(): ThemeSetting {
  // Avoid localStorage access during SSR.
  if (typeof window === 'undefined') return 'system'

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
  // Matches next-themes' intent: prevent a flash of transitions when toggling.
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

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeSetting, setThemeSetting] = React.useState<ThemeSetting>('system')
  const [systemPrefersDark, setSystemPrefersDark] = React.useState(false)

  // Initialize from localStorage + system preference.
  React.useEffect(() => {
    setThemeSetting(readInitialThemeSetting())

    const mql = window.matchMedia(MEDIA_QUERY_DARK)
    setSystemPrefersDark(mql.matches)

    const onChange = () => setSystemPrefersDark(mql.matches)
    // Older Safari uses addListener/removeListener.
    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    }

    mql.addListener(onChange)
    return () => mql.removeListener(onChange)
  }, [])

  const resolvedTheme = resolveTheme(themeSetting, systemPrefersDark)

  // Apply theme to <html>.
  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
    document.documentElement.style.colorScheme = resolvedTheme

    disableTransitionsTemporarily()
  }, [resolvedTheme])

  // Keep theme in sync across tabs.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY) return
      if (!isValidThemeSetting(e.newValue)) return
      setThemeSetting(e.newValue)
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Theme hotkey: press `D` to toggle dark/light (ignores typing targets).
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

    function setTheme(next: 'light' | 'dark') {
      setThemeSetting(next)
      try {
        window.localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // No-op (private mode / disabled storage)
      }
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
  }, [resolvedTheme])

  return <>{children}</>
}

export { ThemeProvider }
