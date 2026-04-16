'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Song, Media } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import placeholderArt from '@/public/imgs/placeholder-art.png'

/**
 * The Song page's in-flow "viewscreen" frame.
 *
 * - Always renders a standby UI (thumbnail + play/pause button).
 * - Registers its own DOM element with `PlayerContext` as an inline target.
 * - When `currentSong.youtubeId === song.youtubeId` and `videoEnabled === false`,
 *   the Global Player's `VideoStage` overlays the real YouTube iframe on top of
 *   this element via `position: fixed`. The iframe is never reparented — only
 *   its coordinates change — so audio playback is uninterrupted.
 *
 * The overlay inherits this frame's rounded corners and lives inside the
 * existing viewscreen's `p-3` inset, so the corner-bracket decoration around
 * the frame stays visible.
 */
interface SongInlineVideoFrameProps {
  song: Song
  className?: string
}

export const SongInlineVideoFrame = ({
  song,
  className,
}: SongInlineVideoFrameProps) => {
  const frameRef = useRef<HTMLDivElement>(null)
  const {
    setInlineTarget,
    clearInlineTarget,
    currentSong,
    isPlaying,
    playMedia,
    togglePlay,
  } = usePlayer()

  const youtubeId = song.youtubeId ?? null
  const isCurrent = Boolean(youtubeId && currentSong?.youtubeId === youtubeId)
  const isActive = isCurrent && isPlaying

  useEffect(() => {
    const element = frameRef.current
    if (!element || !youtubeId) return
    setInlineTarget({ element, songYoutubeId: youtubeId })
    return () => clearInlineTarget(element)
  }, [youtubeId, setInlineTarget, clearInlineTarget])

  const coverArtUrl = (song.coverArt as Media | null | undefined)?.url || null

  const handleClick = () => {
    if (isCurrent) togglePlay()
    else playMedia(song)
  }

  return (
    <div
      ref={frameRef}
      role="region"
      aria-label={`Video frame for ${song.title}`}
      className={cn(
        'relative h-full w-full overflow-hidden rounded-sm bg-black',
        className,
      )}
    >
      <Image
        src={coverArtUrl || placeholderArt}
        alt=""
        aria-hidden="true"
        fill
        loading="eager"
        sizes="(min-width: 1024px) 66vw, 100vw"
        className="scale-110 object-cover opacity-40 blur-sm"
      />
      <div className="absolute inset-0 bg-linear-to-br from-background/40 via-transparent to-background/60" />

      {coverArtUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative aspect-square h-[70%] overflow-hidden rounded-md border border-primary/25 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
            <Image
              src={coverArtUrl}
              alt={song.title}
              fill
              sizes="(min-width: 1024px) 40vw, 60vw"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {youtubeId ? (
        <button
          type="button"
          onClick={handleClick}
          aria-label={isActive ? `Pause ${song.title}` : `Play ${song.title}`}
          className="group/play absolute inset-0 flex items-center justify-center bg-background/10 transition-colors hover:bg-background/30"
        >
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_30px_var(--color-primary)] transition-transform group-hover/play:scale-110">
            {isActive ? (
              <Pause size={36} fill="currentColor" />
            ) : (
              <Play size={36} fill="currentColor" className="ml-1.5" />
            )}
          </span>
        </button>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {'// Signal Unavailable'}
          </p>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {isActive
          ? `${song.title} is now playing.`
          : `Ready to play ${song.title}.`}
      </span>
    </div>
  )
}
