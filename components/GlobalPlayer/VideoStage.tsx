'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube'
import { Minimize2, Maximize2 } from 'lucide-react'
import { usePlayer, type YouTubePlayerRef } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import { applyYouTubeCaptions } from '@/lib/youtube/captions'

/** https://developers.google.com/youtube/iframe_api_reference#onStateChange */
const YT_PLAYER_STATE = {
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const

/** Subset of the YouTube IFrame Player API surface that this component uses. */
type VideoStagePlayerRef = YouTubePlayerRef

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

interface InlineRect {
  top: number
  left: number
  width: number
  height: number
}

export const VideoStage = ({
  isMobileExpanded,
  className,
}: VideoStageProps) => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    videoEnabled,
    videoMode,
    inlineTarget,
    setCurrentTime,
    setDuration,
    setPlayed,
    setIsPlaying,
    playNext,
    registerYouTubePlayer,
    captionsEnabled,
  } = usePlayer()

  const [isReady, setIsReady] = useState(false)
  // Lazy initializer runs once on the client; safe during SSR (returns '').
  const [origin] = useState(() =>
    typeof window !== 'undefined' ? window.location.origin : '',
  )
  const internalPlayerRef = useRef<VideoStagePlayerRef | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const isSeeking = useRef(false)

  // --- Inline rect tracking ---
  //
  // When a Song page has registered an inline target AND that target's
  // youtubeId matches currentSong AND the user has video disabled, we lay the
  // iframe over the target via `position: fixed` with measured coordinates.
  // The rect is remeasured on scroll / resize / layout changes, throttled to
  // one update per animation frame.
  const [inlineRect, setInlineRect] = useState<InlineRect | null>(null)
  const rafRef = useRef<number | null>(null)

  const isInlineActive =
    !videoEnabled &&
    !!inlineTarget &&
    !!currentSong?.youtubeId &&
    currentSong.youtubeId === inlineTarget.songYoutubeId

  useEffect(() => {
    // When inactive, don't run the measurement pipeline. We intentionally
    // don't clear `inlineRect` here — every consumer gates on
    // `isInline = isInlineActive && inlineRect !== null`, so a stale rect
    // sitting in state is never read. Avoiding the setState sidesteps
    // React 19's "cascading render" warning for redundant effect writes.
    if (!isInlineActive || !inlineTarget) return
    const element = inlineTarget.element

    const measureNow = () => {
      const r = element.getBoundingClientRect()
      setInlineRect((prev) => {
        if (
          prev &&
          prev.top === r.top &&
          prev.left === r.left &&
          prev.width === r.width &&
          prev.height === r.height
        ) {
          return prev
        }
        return { top: r.top, left: r.left, width: r.width, height: r.height }
      })
    }

    const scheduleMeasure = () => {
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        measureNow()
      })
    }

    measureNow()

    const scrollOptions: AddEventListenerOptions = {
      passive: true,
      capture: true,
    }
    window.addEventListener('scroll', scheduleMeasure, scrollOptions)
    window.addEventListener('resize', scheduleMeasure)

    const resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(element)
    // Body observation catches layout shifts from content above the target
    // (e.g. an image loads and pushes the frame down) even when the frame's
    // own size hasn't changed.
    resizeObserver.observe(document.body)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      window.removeEventListener('scroll', scheduleMeasure, scrollOptions)
      window.removeEventListener('resize', scheduleMeasure)
      resizeObserver.disconnect()
    }
  }, [isInlineActive, inlineTarget])

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
  const safePlayerCall = useCallback(
    (callback: (player: VideoStagePlayerRef) => void) => {
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
    },
    [],
  )

  // --- Bridge: isPlaying → YouTube player ---
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      if (isPlaying) player.playVideo?.()
      else player.pauseVideo?.()
    })
  }, [isPlaying, isReady, currentSong, safePlayerCall])

  // --- Bridge: volume / mute → YouTube player ---
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      const vol = Math.round(volume * 100)
      player.setVolume?.(vol)
      if (isMuted || vol === 0) player.mute?.()
      else player.unMute?.()
    })
  }, [volume, isMuted, isReady, currentSong, safePlayerCall])

  // --- Bridge: captions → YouTube player ---
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      applyYouTubeCaptions(player, captionsEnabled)
    })
  }, [captionsEnabled, isReady, currentSong, safePlayerCall])

  // --- Progress polling ---
  useEffect(() => {
    if (!currentSong || !isPlaying || !isReady) {
      if (progressInterval.current) clearInterval(progressInterval.current)
      return
    }
    progressInterval.current = setInterval(() => {
      if (!isSeeking.current) {
        safePlayerCall((player) => {
          const time = player.getCurrentTime?.()
          const total = player.getDuration?.()
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
  }, [
    isPlaying,
    isReady,
    currentSong,
    safePlayerCall,
    setCurrentTime,
    setDuration,
    setPlayed,
  ])

  // --- YouTube event handlers ---
  const onPlayerReady: YouTubeProps['onReady'] = useCallback(
    (event: YouTubeEvent) => {
      internalPlayerRef.current = event.target
      registerYouTubePlayer(event.target)
      setIsReady(true)
      const dur: number = event.target.getDuration()
      setDuration(dur)
      event.target.setVolume(volume * 100)
      applyYouTubeCaptions(event.target, captionsEnabled)
      if (isPlaying) event.target.playVideo()
    },
    [volume, isPlaying, captionsEnabled, registerYouTubePlayer, setDuration],
  )

  const onPlayerStateChange: YouTubeProps['onStateChange'] = useCallback(
    (event: YouTubeEvent) => {
      const state = event.data
      if (state === YT_PLAYER_STATE.ENDED) {
        playNext()
        return
      }
      // Keep React state in sync when the user uses native iframe controls
      // (or any other path that changes playback outside BottomBar).
      if (
        state === YT_PLAYER_STATE.PLAYING ||
        state === YT_PLAYER_STATE.BUFFERING
      ) {
        setIsPlaying(true)
        return
      }
      if (state === YT_PLAYER_STATE.PAUSED) {
        setIsPlaying(false)
        try {
          const time = event.target.getCurrentTime()
          const total = event.target.getDuration()
          if (
            typeof time === 'number' &&
            typeof total === 'number' &&
            total > 0
          ) {
            setCurrentTime(time)
            setPlayed(time / total)
          }
        } catch {
          /* ignore */
        }
      }
    },
    [playNext, setIsPlaying, setCurrentTime, setPlayed],
  )

  const opts: YouTubeProps['opts'] = useMemo(
    () => ({
      playerVars: {
        autoplay: 1,
        cc_load_policy: 0,
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
  // Inline (any):     fixed, positioned over a Song page's registered frame
  // Audio only:       absolute 1×1px off-screen (keeps iframe alive for audio)

  const isDesktopTheater =
    !isMobileExpanded && videoEnabled && videoMode === 'theater'
  const isDesktopMini =
    !isMobileExpanded && videoEnabled && videoMode === 'mini'
  const isMobileVideo = isMobileExpanded && videoEnabled
  // Inline only activates once we've successfully measured a rect — this
  // avoids a one-frame flash at (0,0) before the first layout measurement.
  const isInline = isInlineActive && inlineRect !== null
  const isHidden =
    !isDesktopTheater && !isDesktopMini && !isMobileVideo && !isInline

  const inlineStyle =
    isInline && inlineRect
      ? {
          top: inlineRect.top,
          left: inlineRect.left,
          width: inlineRect.width,
          height: inlineRect.height,
        }
      : undefined

  return (
    <div
      style={inlineStyle}
      className={cn(
        // Only ONE group of positioning classes is ever active at a time.
        // This is critical — Tailwind applies all classes simultaneously, so
        // conflicting rules like `h-px` vs an implicit height from top+bottom
        // would make the video invisible if both groups were applied.

        // Audio-only: off-screen 1×1px to keep iframe alive without showing it
        isHidden &&
          'absolute top-[-9999px] left-[-9999px] h-px w-px overflow-hidden',

        // Desktop theater: full viewport width, between nav and bottom bar
        // `fixed` creates a containing block so the YouTube child can use `absolute inset-0`.
        isDesktopTheater &&
          'pointer-events-auto fixed inset-x-0 top-[calc(var(--admin-bar-height)+var(--main-nav-bar-height))] bottom-(--bottom-bar-height,5rem) z-10 bg-background',

        // Desktop mini: 300px floating above the bottom bar, bottom-right corner
        isDesktopMini &&
          'pointer-events-auto fixed right-4 bottom-[calc(var(--bottom-bar-height,5rem)+1rem)] z-30 aspect-video w-[300px] overflow-hidden rounded-xl border border-primary/20 shadow-2xl',

        // Mobile expanded: flex item inside the vertical stack
        isMobileVideo &&
          'pointer-events-auto relative min-h-0 w-full min-w-0 flex-1 overflow-hidden bg-background',

        // Inline: floating over a Song page's viewscreen frame. The matching
        // `rounded-sm` mirrors `SongInlineVideoFrame` so the overlay lands
        // perfectly inside that frame's corners. `pointer-events-auto` lets
        // the YouTube iframe receive clicks; the standby UI underneath is
        // hidden while the overlay is active.
        isInline &&
          'pointer-events-auto fixed z-20 overflow-hidden rounded-sm bg-black',

        className,
      )}
    >
      {/* Video mode toggle — floating inside the stage when video is visible */}
      {!isHidden && !isInline && (
        <VideoModeToggle isDesktopMini={isDesktopMini} />
      )}

      {origin && (
        <YouTube
          key={currentSong.youtubeId}
          videoId={currentSong.youtubeId ?? undefined}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          opts={opts}
          // `absolute inset-0` fills whatever size the container is — works
          // for theater (fixed top/bottom), mini (aspect-video), mobile
          // (flex-1), inline (fixed w/h), and hidden (1×1 parent). Keeping
          // this prop a stable string literal avoids `react-youtube`'s
          // `updatePlayer` churn (and the "iframe.removeAttribute of null"
          // unhandled promise rejection it emits when re-rendered during
          // iframe init / Fast Refresh).
          className="absolute inset-0"
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
        'absolute z-10 hidden min-h-10 min-w-10 items-center justify-center rounded-md bg-background/50 text-foreground/70 backdrop-blur-sm transition-all hover:bg-background/80 hover:text-foreground md:flex',
        isDesktopMini ? 'right-2 bottom-2' : 'top-2 right-2',
      )}
      title={
        videoMode === 'theater'
          ? 'Switch to Mini Player'
          : 'Switch to Theater Mode'
      }
      aria-label={
        videoMode === 'theater'
          ? 'Switch to Mini Player'
          : 'Switch to Theater Mode'
      }
    >
      {videoMode === 'theater' ? (
        <Minimize2 size={16} />
      ) : (
        <Maximize2 size={16} />
      )}
    </button>
  )
}
