'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Script from 'next/script'

/**
 * Unified YouTube auth layer.
 *
 * Priority order for obtaining a working YouTube access token:
 *
 *   1. TSM-logged-in + YouTube connected
 *        → `/api/auth/youtube/token` returns a fresh access token backed by a
 *          server-side refresh token. Zero prompts, survives sessions/devices.
 *   2. Anonymous (or TSM-logged-in but not connected)
 *        → Google Identity Services `initTokenClient` implicit popup. Token
 *          is held in memory only for the lifetime of the tab. Re-consent is
 *          required on reload; that's fine — one popup click is cheap.
 *
 * TSM users who want to skip the popup forever can visit Account Settings and
 * run the server-side connect flow once. That's the *only* reason a TSM
 * account is needed for YouTube features now.
 */

type TokenSource = 'server' | 'gis' | null

interface YouTubeProfile {
  displayName: string
  profileImageUrl: string
}

interface EnsureTokenOptions {
  /**
   * When true, trigger an interactive GIS popup if no valid token is cached.
   * Must be called from a user gesture (e.g. click handler). When false, only
   * returns a token if one is already cached (useful for "is the user
   * connected?" checks).
   */
  interactive?: boolean
}

interface YouTubeAuthContextValue {
  /** Current access token, or null if none is available. */
  token: string | null
  /** Whether the bootstrap fetch of a persistent token has completed. */
  isLoading: boolean
  /** How the current token was obtained, if any. */
  source: TokenSource
  /** YouTube channel profile, populated on first use. Best-effort. */
  profile: YouTubeProfile | null
  /**
   * Get a valid token, prompting the user via GIS if needed (and if allowed).
   * Returns null if the user cancels or no token can be obtained.
   */
  ensureToken: (options?: EnsureTokenOptions) => Promise<string | null>
  /** Drop the current token and forget the profile. Does not revoke with Google. */
  clear: () => void
}

const YouTubeAuthContext = createContext<YouTubeAuthContextValue | undefined>(
  undefined,
)

const GIS_SCOPE = 'https://www.googleapis.com/auth/youtube.force-ssl'

/**
 * Last-resort safety net: if neither GIS `callback` nor `error_callback` fires
 * (rare, but possible across browser/extension edge cases), resolve the token
 * promise with null after this long so the UI never spins forever.
 */
const TOKEN_PROMPT_TIMEOUT_MS = 120_000

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void
}

type GoogleTokenResponse = {
  access_token?: string
  expires_in?: number
  error?: string
}

/**
 * GIS fires `error_callback` when the consent popup fails to open or is closed
 * before completion (e.g. the user signs in but navigates away/returns without
 * granting). The success `callback` does NOT fire in those cases, so without
 * this the token promise would hang forever and any action button would spin
 * indefinitely.
 */
type GoogleTokenErrorResponse = {
  type?: 'popup_closed' | 'popup_failed_to_open' | string
  message?: string
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (config: {
            client_id: string
            scope: string
            callback: (response: GoogleTokenResponse) => void
            error_callback?: (error: GoogleTokenErrorResponse) => void
          }) => GoogleTokenClient
        }
      }
    }
  }
}

export const YouTubeAuthProvider = ({ children }: { children: ReactNode }) => {
  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  const [token, setToken] = useState<string | null>(null)
  const [source, setSource] = useState<TokenSource>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<YouTubeProfile | null>(null)

  const expiresAtRef = useRef<number>(0)
  const tokenClientRef = useRef<GoogleTokenClient | null>(null)
  const pendingResolversRef = useRef<Array<(token: string | null) => void>>([])

  const fetchProfile = useCallback(
    async (accessToken: string) => {
      if (!API_KEY) return
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${API_KEY}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (!res.ok) return
        const data = await res.json()
        const snippet = data.items?.[0]?.snippet
        if (snippet) {
          setProfile({
            displayName: snippet.title,
            profileImageUrl: snippet.thumbnails?.default?.url ?? '',
          })
        }
      } catch (err) {
        console.warn('Failed to fetch YouTube profile', err)
      }
    },
    [API_KEY],
  )

  const applyToken = useCallback(
    (
      accessToken: string,
      expiresInSeconds: number,
      nextSource: TokenSource,
    ) => {
      setToken(accessToken)
      setSource(nextSource)
      expiresAtRef.current = Date.now() + expiresInSeconds * 1000
      // Resolve any callers that were waiting on this token.
      const waiters = pendingResolversRef.current
      pendingResolversRef.current = []
      waiters.forEach((resolve) => resolve(accessToken))
      // Populate profile in the background. Best-effort.
      void fetchProfile(accessToken)
    },
    [fetchProfile],
  )

  const clear = useCallback(() => {
    setToken(null)
    setSource(null)
    setProfile(null)
    expiresAtRef.current = 0
  }, [])

  /** Resolve every pending `ensureToken` caller with null (cancel / error / timeout). */
  const resolvePendingWithNull = useCallback(() => {
    const waiters = pendingResolversRef.current
    pendingResolversRef.current = []
    waiters.forEach((resolve) => resolve(null))
  }, [])

  // Bootstrap: try the server endpoint for a persistent (TSM-linked) token.
  useEffect(() => {
    let cancelled = false
    const bootstrap = async () => {
      try {
        const res = await fetch('/api/auth/youtube/token', {
          credentials: 'include',
        })
        if (!res.ok) return
        const data = (await res.json()) as {
          accessToken: string | null
          expiresAt?: string | null
        }
        if (cancelled || !data.accessToken) return
        const expiresInSeconds = data.expiresAt
          ? Math.max(
              60,
              Math.floor(
                (new Date(data.expiresAt).getTime() - Date.now()) / 1000,
              ),
            )
          : 3600
        applyToken(data.accessToken, expiresInSeconds, 'server')
      } catch (err) {
        console.warn('YouTube token bootstrap failed', err)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [applyToken])

  const initTokenClient = useCallback(() => {
    if (tokenClientRef.current) return tokenClientRef.current
    if (!CLIENT_ID) return null
    const oauth2 = window.google?.accounts?.oauth2
    if (!oauth2) return null

    const client = oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: GIS_SCOPE,
      callback: (response) => {
        if (response.access_token && response.expires_in) {
          applyToken(response.access_token, response.expires_in, 'gis')
        } else {
          // User cancelled / errored out. Resolve pending waiters with null.
          resolvePendingWithNull()
        }
      },
      // Fired when the popup fails to open or is dismissed without completing.
      // The success `callback` never fires in these cases, so we must unblock
      // any awaiting `ensureToken` callers here or the UI hangs in "loading".
      error_callback: () => {
        resolvePendingWithNull()
      },
    })
    tokenClientRef.current = client
    return client
  }, [CLIENT_ID, applyToken, resolvePendingWithNull])

  // If GIS loaded before the provider mounted, init now.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.google?.accounts?.oauth2) initTokenClient()
  }, [initTokenClient])

  const handleGsiLoad = useCallback(() => {
    initTokenClient()
  }, [initTokenClient])

  const ensureToken = useCallback(
    async ({ interactive = false }: EnsureTokenOptions = {}) => {
      // Cached token still valid (with 1-minute safety buffer)?
      if (token && Date.now() < expiresAtRef.current - 60_000) {
        return token
      }

      if (!interactive) return null

      const client = initTokenClient()
      if (!client) {
        console.warn(
          'YouTube auth: Google Identity Services not ready. Is NEXT_PUBLIC_GOOGLE_CLIENT_ID set?',
        )
        return null
      }

      return new Promise<string | null>((resolve) => {
        let settled = false
        // Wrap the resolver so the success/cancel/error paths and the timeout
        // can't double-resolve, and so resolving clears the safety timer.
        const wrapped = (value: string | null) => {
          if (settled) return
          settled = true
          clearTimeout(timeoutId)
          resolve(value)
        }
        const timeoutId = setTimeout(() => {
          if (settled) return
          pendingResolversRef.current = pendingResolversRef.current.filter(
            (r) => r !== wrapped,
          )
          wrapped(null)
        }, TOKEN_PROMPT_TIMEOUT_MS)

        pendingResolversRef.current.push(wrapped)
        // `select_account` forces the account-picker UI so a user with
        // multiple Google accounts can explicitly pick the one that owns their
        // YouTube channel. Without it, GIS silently reuses whichever account
        // Chrome last authenticated with, which causes the infamous
        // "not connected to Google+" error when that account has no channel.
        client.requestAccessToken({ prompt: 'select_account' })
      })
    },
    [token, initTokenClient],
  )

  const value = useMemo<YouTubeAuthContextValue>(
    () => ({ token, isLoading, source, profile, ensureToken, clear }),
    [token, isLoading, source, profile, ensureToken, clear],
  )

  return (
    <YouTubeAuthContext.Provider value={value}>
      <Script
        src="https://accounts.google.com/gsi/client"
        onLoad={handleGsiLoad}
      />
      {children}
    </YouTubeAuthContext.Provider>
  )
}

export const useYouTubeAuth = (): YouTubeAuthContextValue => {
  const ctx = useContext(YouTubeAuthContext)
  const hasWarnedMissingProviderRef = useRef(false)

  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      !ctx &&
      !hasWarnedMissingProviderRef.current
    ) {
      hasWarnedMissingProviderRef.current = true
      console.warn('useYouTubeAuth must be used within a YouTubeAuthProvider')
    }
  }, [ctx])

  if (!ctx) {
    return {
      token: null,
      isLoading: false,
      source: null,
      profile: null,
      ensureToken: async () => null,
      clear: () => {},
    }
  }
  return ctx
}
