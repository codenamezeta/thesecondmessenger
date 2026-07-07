'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { Play, Pause } from 'lucide-react'
import type { Song, Media } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import placeholderArt from '@/public/imgs/placeholder-art.png'
import { pickMediaImageUrl } from '@/utilities/getMediaUrl'
import { isSongPlayable } from '@/lib/music/songRelease'

/**
 * The Song page's in-flow "viewscreen" frame.
 *
 * **Released songs:** blurred standby + play control; registers with Global Player
 * for inline iframe overlay when video mode is off.
 *
 * **Unreleased premieres:** static YouTube embed (countdown thumbnail) — no Global
 * Player hookup, so users are not misled into a fake "playing" state.
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
  const playable = isSongPlayable(song.releaseDate, song.premiereAt)
  const isCurrent = Boolean(
    playable && youtubeId && currentSong?.youtubeId === youtubeId,
  )
  const isActive = isCurrent && isPlaying

  useEffect(() => {
    if (!playable) return

    const element = frameRef.current
    if (!element || !youtubeId) return
    setInlineTarget({ element, songYoutubeId: youtubeId })
    return () => clearInlineTarget(element)
  }, [playable, youtubeId, setInlineTarget, clearInlineTarget])

  const coverArtUrl =
    pickMediaImageUrl(song.coverArt as Media | null | undefined, 'thumbnail') ||
    null

  const handleClick = () => {
    if (!playable) return
    if (isCurrent) togglePlay()
    else playMedia(song)
  }

  if (youtubeId && !playable) {
    return (
      <div
        id="viewscreen"
        ref={frameRef}
        role="region"
        aria-label={`Premiere countdown for ${song.title}`}
        className={cn(
          'relative h-full w-full overflow-hidden rounded-sm bg-black',
          className,
        )}
      >
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0`}
          title={`${song.title} — YouTube Premiere`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-background/90 to-transparent px-4 py-3">
          <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
            {'// Premiere Scheduled — Playback unlocks on release'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      id="viewscreen"
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
        aria-hidden
        fill
        loading="eager"
        sizes="128px"
        quality={40}
        className="scale-110 object-cover opacity-40 blur-sm"
      />
      <div className="absolute inset-0 bg-linear-to-br from-background/40 via-transparent to-background/60" />

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
