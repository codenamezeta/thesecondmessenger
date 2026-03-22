'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube'
import { Minimize2, Maximize2 } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'

/**
 * VideoStage owns the YouTube player lifecycle.
 *
 * Responsibilities:
 * - Mounts / configures the <YouTube> iframe
 * - Bridges isPlaying / volume / isMuted → YouTube player commands
 * - Polls for currentTime / duration and writes them to PlayerContext
 * - Registers the player ref in PlayerContext so BottomBar can seekTo()
 * - Positions itself based on videoEnabled + videoMode (desktop)
 *   or acts as a normal flex child (mobile, controlled by parent)
 *
 * `isMobileExpanded` must be passed by the parent (index.tsx) because
 * VideoStage needs to know whether it's inside a flex-col stack (mobile)
 * or should use fixed positioning (desktop).
 */
interface VideoStageProps {
  /** True when we are rendering the mobile expanded layout */
  isMobileExpanded: boolean
  className?: string
}

export const VideoStage = ({ isMobileExpanded, className }: VideoStageProps) => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    videoEnabled,
    videoMode,
    setCurrentTime,
    setDuration,
    setPlayed,
    playNext,
    registerYouTubePlayer,
  } = usePlayer()

  const [isReady, setIsReady] = useState(false)
  const [origin, setOrigin] = useState('')
  const internalPlayerRef = useRef<any>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const isSeeking = useRef(false)

  // Origin is needed for YouTube embed security
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  // Scroll lock: prevent page scroll when theater mode is active on desktop
  useEffect(() => {
    if (!isMobileExpanded && videoEnabled && videoMode === 'theater') {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileExpanded, videoEnabled, videoMode])

  // --- Safe player call helper ---
  const safePlayerCall = useCallback((callback: (player: any) => void) => {
    const player = internalPlayerRef.current
    if (player && typeof player.getIframe === 'function') {
      const iframe = player.getIframe()
      if (!iframe || !iframe.isConnected) return
      try {
        callback(player)
      } catch {
        // silence YouTube internal errors
      }
    }
  }, [])

  // --- Bridge: isPlaying → YouTube player ---
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      if (isPlaying) player.playVideo()
      else player.pauseVideo()
    })
  }, [isPlaying, isReady, currentSong, safePlayerCall])

  // --- Bridge: volume / mute → YouTube player ---
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      const vol = Math.round(volume * 100)
      player.setVolume(vol)
      if (isMuted || vol === 0) player.mute()
      else player.unMute()
    })
  }, [volume, isMuted, isReady, currentSong, safePlayerCall])

  // --- Progress polling ---
  useEffect(() => {
    if (!currentSong || !isPlaying || !isReady) {
      if (progressInterval.current) clearInterval(progressInterval.current)
      return
    }
    progressInterval.current = setInterval(() => {
      if (!isSeeking.current) {
        safePlayerCall((player) => {
          const time: number = player.getCurrentTime()
          const total: number = player.getDuration()
          if (time !== undefined && total) {
            setCurrentTime(time)
            setDuration(total)
            setPlayed(time / total)
          }
        })
      }
    }, 250)
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isPlaying, isReady, currentSong, safePlayerCall, setCurrentTime, setDuration, setPlayed])

  // --- YouTube event handlers ---
  const onPlayerReady: YouTubeProps['onReady'] = useCallback(
    (event: YouTubeEvent) => {
      internalPlayerRef.current = event.target
      registerYouTubePlayer(event.target)
      setIsReady(true)
      const dur: number = event.target.getDuration()
      setDuration(dur)
      event.target.setVolume(volume * 100)
      if (isPlaying) event.target.playVideo()
    },
    [volume, isPlaying, registerYouTubePlayer, setDuration],
  )

  const onPlayerStateChange: YouTubeProps['onStateChange'] = useCallback(
    (event: YouTubeEvent) => {
      if (event.data === 0) playNext()
    },
    [playNext],
  )

  const opts: YouTubeProps['opts'] = useMemo(
    () => ({
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        origin,
        rel: 0,
        fs: 0,
      },
    }),
    [origin],
  )

  if (!currentSong?.youtubeId) return null

  // --- Positioning logic ---
  //
  // Desktop theater:  fixed inset-x-0, from nav bottom to bottom-bar top
  // Desktop mini:     fixed, bottom-right corner, 300px wide
  // Mobile expanded:  relative flex-1 min-h-0 (parent is a flex column)
  // Audio only:       absolute 1×1px off-screen (keeps iframe alive for audio)

  const isDesktopTheater = !isMobileExpanded && videoEnabled && videoMode === 'theater'
  const isDesktopMini = !isMobileExpanded && videoEnabled && videoMode === 'mini'
  const isMobileVideo = isMobileExpanded && videoEnabled
  const isHidden = !isDesktopTheater && !isDesktopMini && !isMobileVideo

  return (
    <div
      className={cn(
        // Only ONE group of positioning classes is ever active at a time.
        // This is critical — Tailwind applies all classes simultaneously, so
        // conflicting rules like `h-px` vs an implicit height from top+bottom
        // would make the video invisible if both groups were applied.

        // Audio-only: off-screen 1×1px to keep iframe alive without showing it
        isHidden && 'absolute left-[-9999px] top-[-9999px] h-px w-px overflow-hidden',

        // Desktop theater: full viewport width, between nav and bottom bar
        // `fixed` creates a containing block so the YouTube child can use `absolute inset-0`.
        isDesktopTheater &&
          'pointer-events-auto fixed inset-x-0 top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))] bottom-(--bottom-bar-height,5rem) z-10 bg-background',

        // Desktop mini: 300px floating above the bottom bar, bottom-right corner
        isDesktopMini &&
          'pointer-events-auto fixed right-4 bottom-[calc(var(--bottom-bar-height,5rem)+1rem)] z-30 w-[300px] aspect-video overflow-hidden rounded-xl border border-primary/20 shadow-2xl',

        // Mobile expanded: flex item inside the vertical stack
        isMobileVideo &&
          'pointer-events-auto relative flex-1 min-h-0 min-w-0 w-full overflow-hidden bg-background',

        className,
      )}
    >
      {/* Video mode toggle — floating inside the stage when video is visible */}
      {!isHidden && <VideoModeToggle isDesktopMini={isDesktopMini} />}

      {origin && (
        <YouTube
          key={currentSong.youtubeId}
          videoId={currentSong.youtubeId ?? undefined}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          opts={opts}
          // `absolute inset-0` fills whatever size the container is —
          // works for theater (fixed top/bottom), mini (aspect-video), and mobile (flex-1).
          className={isHidden ? 'w-full h-full' : 'absolute inset-0'}
          iframeClassName="w-full h-full"
        />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Video Mode Toggle — floating button inside the video stage
// ---------------------------------------------------------------------------

interface VideoModeToggleProps {
  isDesktopMini: boolean
}

const VideoModeToggle = ({ isDesktopMini }: VideoModeToggleProps) => {
  const { videoMode, toggleVideoMode, videoEnabled } = usePlayer()

  if (!videoEnabled) return null

  return (
    <button
      onClick={toggleVideoMode}
      className={cn(
        'absolute z-10 flex min-h-10 min-w-10 items-center justify-center rounded-md bg-background/50 text-foreground/70 backdrop-blur-sm transition-all hover:bg-background/80 hover:text-foreground',
        isDesktopMini ? 'bottom-2 right-2' : 'top-2 right-2',
      )}
      title={videoMode === 'theater' ? 'Switch to Mini Player' : 'Switch to Theater Mode'}
      aria-label={videoMode === 'theater' ? 'Switch to Mini Player' : 'Switch to Theater Mode'}
    >
      {videoMode === 'theater' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
    </button>
  )
}
