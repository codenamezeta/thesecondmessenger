'use client'

import { useCallback, useRef, useState } from 'react'
import { useYouTubeAuth } from '@/context/YouTubeAuthContext'

export type YouTubeActionStatus = 'idle' | 'loading' | 'success' | 'error'

interface UseYouTubeActionOptions {
  /**
   * Called with a valid YouTube OAuth access token. Perform the YouTube API
   * call here (e.g. `likeVideo(id, token)`). Throw to surface an error.
   */
  run: (token: string) => Promise<void>
  /** Delay (ms) before resetting to idle after success or error. Default 2500. */
  resetDelayMs?: number
  /** Fired after every attempt completes (success or error). */
  onResult?: (status: 'success' | 'error', error?: Error) => void
}

/**
 * Shared state machine for any YouTube engagement action that runs client-side
 * with an OAuth token (like / subscribe / comment / reply).
 *
 * Handles:
 *  - obtaining a token via `ensureToken({ interactive: true })`
 *  - tracking idle / loading / success / error state
 *  - cancelling the reset timer on unmount re-trigger
 *  - exposing the last error message for display
 */
export function useYouTubeAction({
  run,
  resetDelayMs = 2500,
  onResult,
}: UseYouTubeActionOptions) {
  const { ensureToken } = useYouTubeAuth()
  const [status, setStatus] = useState<YouTubeActionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scheduleReset = useCallback(() => {
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    resetTimerRef.current = setTimeout(() => {
      setStatus('idle')
      setErrorMessage(null)
    }, resetDelayMs)
  }, [resetDelayMs])

  const trigger = useCallback(async () => {
    if (status === 'loading') return
    if (resetTimerRef.current) clearTimeout(resetTimerRef.current)
    setStatus('loading')
    setErrorMessage(null)
    try {
      const token = await ensureToken({ interactive: true })
      if (!token) {
        setStatus('idle')
        return
      }
      await run(token)
      setStatus('success')
      onResult?.('success')
      scheduleReset()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setErrorMessage(error.message)
      setStatus('error')
      onResult?.('error', error)
      scheduleReset()
    }
  }, [status, ensureToken, run, onResult, scheduleReset])

  return { status, errorMessage, trigger }
}
