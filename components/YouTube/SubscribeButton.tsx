'use client'

import { type ReactNode } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { subscribeToChannel } from '@/lib/youtube/client'
import { Button } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import { useYouTubeAction } from './useYouTubeAction'

const DEFAULT_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

interface YouTubeSubscribeButtonProps {
  /**
   * YouTube channel ID to subscribe to. Falls back to
   * `NEXT_PUBLIC_YOUTUBE_CHANNEL_ID` when omitted.
   */
  channelId?: string
  /** Button content shown in the default (idle) state. */
  children: ReactNode
  /** Content shown briefly after a successful subscribe. */
  successLabel?: ReactNode
  /** Passes through to the underlying Button. */
  className?: string
  /** How long the success state is displayed before resetting to idle. */
  resetDelayMs?: number
  /** Fired after every attempt completes. */
  onResult?: (status: 'success' | 'error', error?: Error) => void
}

export function YouTubeSubscribeButton({
  channelId = DEFAULT_CHANNEL_ID,
  children,
  successLabel,
  className,
  resetDelayMs,
  onResult,
}: YouTubeSubscribeButtonProps) {
  const { status, errorMessage, trigger } = useYouTubeAction({
    run: async (token) => {
      if (!channelId) throw new Error('No YouTube channel ID configured')
      await subscribeToChannel(channelId, token)
    },
    resetDelayMs,
    onResult,
  })

  const defaultSuccess = (
    <>
      <Check size={20} />
      Subscribed
    </>
  )

  return (
    <Button
      onClick={trigger}
      disabled={status === 'loading' || !channelId}
      className={cn(className)}
      aria-live="polite"
      aria-label={
        status === 'error' ? (errorMessage ?? 'Subscribe failed') : undefined
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
