'use client'

import { useState } from 'react'
import {
  ThumbsUp,
  Share2,
  Download,
  Bell,
  Check,
  Loader2,
  Info,
} from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { likeYouTubeVideo, subscribeToChannel } from '@/actions/youtube'
import { cn } from '@/utilities/ui'
import type { Media } from '@/payload-types'

interface ActionButtonsProps {
  className?: string
}

export const ActionButtons = ({ className }: ActionButtonsProps) => {
  const { currentSong, isInfoDrawerOpen, setIsInfoDrawerOpen } = usePlayer()

  const [likeStatus, setLikeStatus] = useState<'idle' | 'loading' | 'success'>(
    'idle',
  )
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success'>(
    'idle',
  )
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  if (!currentSong) return null

  const handleLike = async () => {
    if (!currentSong.youtubeId) return
    setLikeStatus('loading')
    const res = await likeYouTubeVideo(currentSong.youtubeId as string)
    if (res.success) {
      setLikeStatus('success')
      setTimeout(() => setLikeStatus('idle'), 2000)
    } else {
      setLikeStatus('idle')
      if (res.error === 'Not connected to YouTube') {
        window.location.assign('/api/auth/youtube/connect')
      }
    }
  }

  const handleSubscribe = async () => {
    setSubStatus('loading')
    const res = await subscribeToChannel()
    if (res.success) {
      setSubStatus('success')
      setTimeout(() => setSubStatus('idle'), 2000)
    } else {
      setSubStatus('idle')
      if (res.error === 'Not connected to YouTube') {
        window.location.assign('/api/auth/youtube/connect')
      }
    }
  }

  const handleShare = async () => {
    const songUrl = currentSong.slug
      ? `${window.location.origin}/music/${currentSong.slug as string}`
      : window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title as string,
          text: `Check out ${currentSong.title as string} by The Second Messenger`,
          url: songUrl,
        })
      } catch {
        // user cancelled share
      }
    } else {
      await navigator.clipboard.writeText(songUrl)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
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
        onClick={handleLike}
        className={cn(
          btnBase,
          likeStatus === 'success'
            ? 'text-primary'
            : 'text-foreground/50 hover:text-foreground',
        )}
        title="Like on YouTube"
        disabled={likeStatus === 'loading'}
      >
        {likeStatus === 'loading' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : likeStatus === 'success' ? (
          <Check size={18} />
        ) : (
          <ThumbsUp size={18} />
        )}
      </button>

      {/* Subscribe */}
      <button
        onClick={handleSubscribe}
        className={cn(
          btnBase,
          subStatus === 'success'
            ? 'text-primary'
            : 'text-foreground/50 hover:text-foreground',
        )}
        title="Subscribe to Channel"
        disabled={subStatus === 'loading'}
      >
        {subStatus === 'loading' ? (
          <Loader2 size={18} className="animate-spin" />
        ) : subStatus === 'success' ? (
          <Check size={18} />
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
        {shareStatus === 'copied' ? <Check size={18} /> : <Share2 size={18} />}
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
  )
}
