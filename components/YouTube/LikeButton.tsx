'use client'

import { type ReactNode } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { likeVideo } from '@/lib/youtube/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { useYouTubeAction } from './useYouTubeAction'

interface YouTubeLikeButtonProps {
  /** YouTube video ID to like. */
  videoId: string
  /** Button content shown in the default (idle) state. */
  children: ReactNode
  /** Content shown briefly after a successful like. */
  successLabel?: ReactNode
  /** Passes through to the underlying Button. */
  className?: string
  /** How long the success state is displayed before resetting to idle. */
  resetDelayMs?: number
  /** Fired after every attempt completes. */
  onResult?: (status: 'success' | 'error', error?: Error) => void
}

export function YouTubeLikeButton({
  videoId,
  children,
  successLabel,
  className,
  resetDelayMs,
  onResult,
}: YouTubeLikeButtonProps) {
  const { status, errorMessage, trigger } = useYouTubeAction({
    run: (token) => likeVideo(videoId, token),
    resetDelayMs,
    onResult,
  })

  const defaultSuccess = (
    <>
      <Check size={20} />
      Liked on YouTube
    </>
  )

  return (
    <Button
      onClick={trigger}
      disabled={status === 'loading'}
      className={cn(className)}
      aria-live="polite"
      aria-label={
        status === 'error' ? (errorMessage ?? 'Like failed') : undefined
      }
    >
      {status === 'loading' ? (
        <Loader2 size={20} className="animate-spin" />
      ) : status === 'success' ? (
        (successLabel ?? defaultSuccess)
      ) : status === 'error' ? (
        <>Try again</>
      ) : (
        children
      )}
    </Button>
  )
}
