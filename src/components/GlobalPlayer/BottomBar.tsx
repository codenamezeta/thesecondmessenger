import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  Share2,
  Download,
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  Bell,
  Check,
  Loader2,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import formatTime from '@/utilities/formatTime'
import { useYouTubeAuth } from '@/context/YouTubeAuthContext'
import { likeYouTubeVideo, subscribeToChannel } from '@/actions/library-sync'
import type { Media } from '@/payload-types'

interface BottomBarProps {
  currentSong: any
  isVideoEnabled: boolean
  setIsVideoEnabled: (enabled: boolean) => void
  miniMode: boolean
  setMiniMode: (mode: boolean) => void
  controlsVisible: boolean
  setControlsVisible: (visible: boolean) => void
  isPlaying: boolean
  togglePlay: () => void
  toggleVideo: () => void
  volume: number
  setVolume: (vol: number) => void
  isMuted: boolean
  toggleMute: () => void
  played: number
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void
  setIsSeeking: (seeking: boolean) => void
  currentTime: number
  duration: number
  onClose: () => void
  playNext: () => void
  playPrevious: () => void
}

export const BottomBar = ({
  currentSong,
  isVideoEnabled,
  setIsVideoEnabled,
  miniMode,
  setMiniMode,
  controlsVisible,
  isPlaying,
  togglePlay,
  toggleVideo,
  volume,
  setVolume,
  isMuted,
  toggleMute,
  played,
  handleSeekChange,
  handleSeekMouseUp,
  setIsSeeking,
  currentTime,
  duration,
  onClose,
  playNext,
  playPrevious,
}: BottomBarProps) => {
  const { user, login } = useYouTubeAuth()
  const [likeStatus, setLikeStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success'>('idle')
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const coverArtUrl = currentSong.coverImage
    ? currentSong.coverImage
    : typeof currentSong.coverArt === 'object'
      ? currentSong.coverArt?.url
      : undefined

  const SongInfoWrapper = (currentSong.slug ? Link : 'div') as React.ElementType
  const wrapperProps = currentSong.slug ? { href: `/songs/${currentSong.slug}` } : {}

  // --- HANDLERS ---
  const handleLike = async () => {
    if (!currentSong.youtubeId) return
    if (!user) {
      login()
      return
    }

    setLikeStatus('loading')
    const res = await likeYouTubeVideo(currentSong.youtubeId, user.accessToken)
    if (res.success) {
      setLikeStatus('success')
      setTimeout(() => setLikeStatus('idle'), 2000)
    } else {
      setLikeStatus('idle')
    }
  }

  const handleSubscribe = async () => {
    if (!user) {
      login()
      return
    }

    setSubStatus('loading')
    const res = await subscribeToChannel(undefined, user.accessToken)
    if (res.success) {
      setSubStatus('success')
      setTimeout(() => setSubStatus('idle'), 2000)
    } else {
      setSubStatus('idle')
    }
  }

  const handleShare = async () => {
    const songUrl = currentSong.slug
      ? `${window.location.origin}/songs/${currentSong.slug}`
      : window.location.href

    if (navigator.share) {
      try {
        await navigator.share({
          title: currentSong.title,
          text: `Check out ${currentSong.title} by The Second Messenger`,
          url: songUrl,
        })
      } catch (e) {
        console.log('Share aborted')
      }
    } else {
      await navigator.clipboard.writeText(songUrl)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  const handleDownload = () => {
    const masterAudio = currentSong.masterAudio as Media | undefined
    if (masterAudio && masterAudio.url) {
      const link = document.createElement('a')
      link.href = masterAudio.url
      link.download = masterAudio.filename || `${currentSong.title}.mp3`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else {
      alert('Download not available for this track.')
    }
  }

  return (
    <section
      id="media_player_bottom_bar"
      className={cn(
        'flex flex-col w-full justify-center bg-background/75 backdrop-blur-sm border-t border-white/10 z-20 pointer-events-auto transition-transform duration-300',
        controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full',
      )}
    >
      {/* Progress Bar (Not in container) */}
      <div
        id="player_progress_seek"
        className="absolute -top-[2px] left-0 right-0 h-[2px] group hover:h-1 transition-all z-20 cursor-pointer"
      >
        <div className="absolute inset-0 bg-muted"></div>
        <div
          className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-100 ease-linear"
          style={{ width: `${played * 100}%` }}
        ></div>
        <input
          name="seek"
          id="seek"
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played || 0}
          onChange={handleSeekChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={handleSeekMouseUp}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Controls Row (Inside container: px-2 on mobile and .container for desktop/tablet) */}
      <div
        id="player_controls"
        className={cn(
          'flex w-full items-center justify-around sm:justify-between px-1 sm:px-0 sm:container',
        )}
      >
        <div id="player_controls_song_info" className="flex w-3/5 sm:w-2/5 items-center gap-2">
          {/* Current Song Info */}
          <SongInfoWrapper
            {...wrapperProps}
            className={cn(
              'flex flex-auto overflow-x-clip max-w-72 items-center justify-start gap-2',
              currentSong.slug && 'hover:scale-105 cursor-pointer',
            )}
          >
            {coverArtUrl && (
              <Image
                src={coverArtUrl}
                alt={`${currentSong.title} Cover Art`}
                height={144}
                width={144}
                className="h-16 w-auto rounded-lg"
                sizes="144px"
              />
            )}
            <div className="flex flex-col gap-1 my-[0.33rem]">
              <h4 className="text-lg text-foreground font-heading font-bold tracking-wide leading-[0.75] break-words">
                {currentSong.title}
              </h4>
              <span className="text-sm text-foreground/50 font-heading uppercase leading-3 break-words">
                {currentSong.artist || 'The Second Messenger'}
              </span>
            </div>
          </SongInfoWrapper>

          {/* Actions */}
          <div className="flex flex-auto truncate min-w-36 max-w-72 items-center justify-between space-x-1">
            {/* Open Browser Button */}
            <button
              onClick={() => {
                if (isVideoEnabled && !miniMode) {
                  toggleVideo() // Collapse to Audio
                } else {
                  if (!isVideoEnabled) toggleVideo() // Enable Video
                  setMiniMode(false) // Ensure Theater
                }
              }}
              className="text-foreground/50 hover:text-foreground border-r border-border/50 flex-auto flex items-center justify-center p-2"
              title={isVideoEnabled && !miniMode ? 'Collapse Browser' : 'Expand Browser'}
            >
              {isVideoEnabled && !miniMode ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
            </button>
            <button
              onClick={handleLike}
              className={cn(
                'flex-auto flex items-center justify-center p-2 transition-colors',
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
            <button
              onClick={handleSubscribe}
              className={cn(
                'flex-auto flex items-center justify-center p-2 transition-colors',
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
            <button
              onClick={handleShare}
              className={cn(
                'flex-auto flex items-center justify-center p-2 transition-colors',
                shareStatus === 'copied'
                  ? 'text-primary'
                  : 'text-foreground/50 hover:text-foreground',
              )}
              title="Share this song"
            >
              {shareStatus === 'copied' ? <Check size={18} /> : <Share2 size={18} />}
            </button>
            <button
              onClick={handleDownload}
              className="text-foreground/50 hover:text-foreground flex-auto flex items-center justify-center p-2"
              title="Download this song"
            >
              <Download size={18} />
            </button>
          </div>
        </div>

        {/* Playback and time display */}
        <div id="player_controls_playback" className="flex flex-col w-2/5 sm:w-1/5 gap-1 py-1">
          {/* Playback Controls */}
          <div className="flex justify-center gap-1 sm:gap-2 xl:gap-3">
            <button onClick={playPrevious} className="text-muted-foreground hover:text-foreground">
              <SkipBack size={32} />
            </button>
            <button
              onClick={togglePlay}
              className={cn(
                'w-12 h-12 flex items-center justify-center bg-primary text-primary-foreground hover:bg-foreground hover:text-background rounded-full transition-all shadow-[0_0_20px_hsl(var(--primary))]',
              )}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>
            <button onClick={playNext} className="text-muted-foreground hover:text-foreground">
              <SkipForward size={32} />
            </button>
          </div>
          {/* Time display */}
          <div className="hidden md:flex self-center text-[0.6em] font-mono text-muted-foreground gap-1">
            <span>{formatTime(currentTime as any)}</span>
            <span className="opacity-75">/</span>
            <span>{formatTime(duration as any)}</span>
          </div>
        </div>

        {/* View Modes & Volume */}
        <div
          id="player_controls_view_modes"
          className="flex w-2/5 items-center justify-end gap-3 flex-wrap"
        >
          {/* Volume Slider */}
          <div className="flex items-center gap-2 group">
            <button
              onClick={toggleMute}
              className={cn(
                'group-hover:text-foreground transition-colors',
                isMuted || volume === 0
                  ? 'text-secondary hover:text-primary'
                  : 'text-muted-foreground',
              )}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume >= 0 && volume <= 0.33 ? (
                <Volume size={18} />
              ) : volume > 0.33 && volume <= 0.67 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <input
              name="volume"
              id="volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 rounded-lg cursor-pointer accent-muted-foreground hover:accent-primary"
            />
          </div>

          {/* Audio / Video toggle */}
          <div className="flex items-center justify-around gap-2 bg-muted rounded-full px-3 py-1 border border-muted-foreground/75">
            <span
              onClick={() => setIsVideoEnabled(false)}
              className={cn(
                'text-[0.5em] font-mono uppercase truncate cursor-pointer',
                !isVideoEnabled ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Audio
            </span>
            <button
              onClick={toggleVideo}
              className={cn(
                'w-9 h-[1.333rem] rounded-full relative transition-colors duration-200 ease-in-out border border-muted-foreground/75',
                isVideoEnabled ? 'bg-primary/75' : 'bg-input',
              )}
              title="Toggle Video"
            >
              <div
                className={cn(
                  'absolute top-1 left-1 size-3 border border-muted-foreground/20 bg-foreground rounded-full transition-transform duration-200 ease-in-out',
                  isVideoEnabled ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
            <span
              onClick={() => setIsVideoEnabled(true)}
              className={cn(
                'text-[0.5em] font-mono uppercase truncate cursor-pointer',
                isVideoEnabled ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              Video
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-foreground/50 hover:text-secondary transition-colors flex justify-end"
            title="Close Player"
          >
            <X size={24} />
          </button>
        </div>
      </div>
    </section>
  )
}
