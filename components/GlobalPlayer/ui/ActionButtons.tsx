'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  ThumbsUp,
  Share2,
  Download,
  Bell,
  Check,
  Loader2,
  Info,
  AlertCircle,
} from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { likeVideo, subscribeToChannel } from '@/lib/youtube/client'
import { useYouTubeAction } from '@/components/YouTube/useYouTubeAction'
import { cn } from '@/utilities/ui'
import type { Media } from '@/payload-types'

interface ActionButtonsProps {
  className?: string
}

const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

export const ActionButtons = ({ className }: ActionButtonsProps) => {
  const { currentSong, isInfoDrawerOpen, setIsInfoDrawerOpen } = usePlayer()
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'error'>(
    'idle',
  )

  const youtubeId = currentSong?.youtubeId as string | undefined

  const like = useYouTubeAction({
    run: async (token) => {
      if (!youtubeId) throw new Error('No YouTube video for this song')
      await likeVideo(youtubeId, token)
    },
  })

  const subscribe = useYouTubeAction({
    run: async (token) => {
      if (!YOUTUBE_CHANNEL_ID) throw new Error('No channel ID configured')
      await subscribeToChannel(YOUTUBE_CHANNEL_ID, token)
    },
  })

  if (!currentSong) return null

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setShareStatus('copied')
    } catch {
      setShareStatus('error')
    }
    setTimeout(() => setShareStatus('idle'), 2500)
  }

  const handleShare = async () => {
    const songUrl = currentSong.slug
      ? `${window.location.origin}/music/${currentSong.slug as string}`
      : window.location.href

    const shareData = {
      title: currentSong.title as string,
      text: `Check out ${currentSong.title as string} by The Second Messenger`,
      url: songUrl,
    }

    // Use the native share sheet when the browser supports it (most mobile
    // browsers). On unsupported browsers (e.g. desktop Firefox) or if the
    // share call fails for any reason other than user cancellation, fall back
    // to copying the link to the clipboard.
    if (
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' ||
        navigator.canShare(shareData))
    ) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return
        // Any other failure → fall through to clipboard.
      }
    }

    await copyToClipboard(songUrl)
  }

  const handleDownload = () => {
    const masterAudio = (currentSong as { masterAudio?: Media }).masterAudio
    if (masterAudio?.url) {
      const link = document.createElement('a')
      link.href = masterAudio.url
      link.download =
        masterAudio.filename || `${currentSong.title as string}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Download not available for this track.')
    }
  }

  const btnBase =
    'flex min-w-8 flex-auto items-center justify-center transition-colors'

  return (
    <>
      <div
        className={cn(
          'flex max-h-12 flex-auto items-center md:max-w-60',
          className,
        )}
      >
        {/* Info Drawer toggle */}
        <button
          onClick={() => setIsInfoDrawerOpen(!isInfoDrawerOpen)}
          className={cn(
            btnBase,
            isInfoDrawerOpen
              ? 'text-primary'
              : 'text-foreground/50 hover:text-foreground',
          )}
          title={isInfoDrawerOpen ? 'Close Info Drawer' : 'Open Info Drawer'}
        >
          <Info size={18} />
        </button>

        {/* Like */}
        <button
          onClick={like.trigger}
          className={cn(
            btnBase,
            like.status === 'success'
              ? 'text-primary'
              : like.status === 'error'
                ? 'text-destructive'
                : 'text-foreground/50 hover:text-foreground',
          )}
          title={
            like.status === 'success'
              ? 'Liked on YouTube'
              : like.status === 'error'
                ? `Couldn't like — ${like.errorMessage ?? 'tap to retry'}`
                : 'Like on YouTube'
          }
          aria-label="Like this video on YouTube"
          disabled={like.status === 'loading' || !youtubeId}
        >
          {like.status === 'loading' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : like.status === 'success' ? (
            <Check size={18} />
          ) : like.status === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <ThumbsUp size={18} />
          )}
        </button>

        {/* Subscribe */}
        <button
          onClick={subscribe.trigger}
          className={cn(
            btnBase,
            subscribe.status === 'success'
              ? 'text-primary'
              : subscribe.status === 'error'
                ? 'text-destructive'
                : 'text-foreground/50 hover:text-foreground',
          )}
          title={
            subscribe.status === 'success'
              ? 'Subscribed'
              : subscribe.status === 'error'
                ? `Couldn't subscribe — ${subscribe.errorMessage ?? 'tap to retry'}`
                : 'Subscribe to Channel'
          }
          aria-label="Subscribe to the channel on YouTube"
          disabled={subscribe.status === 'loading'}
        >
          {subscribe.status === 'loading' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : subscribe.status === 'success' ? (
            <Check size={18} />
          ) : subscribe.status === 'error' ? (
            <AlertCircle size={18} />
          ) : (
            <Bell size={18} />
          )}
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className={cn(
            btnBase,
            shareStatus === 'copied'
              ? 'text-primary'
              : 'text-foreground/50 hover:text-foreground',
          )}
          title="Share this song"
        >
          {shareStatus === 'copied' ? (
            <Check size={18} />
          ) : (
            <Share2 size={18} />
          )}
        </button>

        {/* Download (only if masterAudio exists) */}
        {(currentSong as { masterAudio?: Media }).masterAudio && (
          <button
            onClick={handleDownload}
            className={cn(btnBase, 'text-foreground/50 hover:text-foreground')}
            title="Download this song"
          >
            <Download size={18} />
          </button>
        )}
      </div>

      {/* Transient feedback for the clipboard fallback (no native share sheet) */}
      {shareStatus !== 'idle' &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-28 z-[120] flex justify-center px-4"
          >
            <div className="rounded-md border border-border/50 bg-background/95 px-4 py-2 font-mono text-xs tracking-wide text-foreground shadow-lg backdrop-blur">
              {shareStatus === 'copied'
                ? 'Link copied to clipboard'
                : "Couldn't copy link"}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
