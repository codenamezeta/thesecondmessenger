'use client'

import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import formatTime from '@/utilities/formatTime'

interface QueueControlsProps {
  className?: string
  /** Show only the play/pause button — used in the mobile collapsed bottom bar */
  playOnly?: boolean
}

export const QueueControls = ({
  className,
  playOnly = false,
}: QueueControlsProps) => {
  const {
    isPlaying,
    togglePlay,
    playNext,
    playPrevious,
    currentTime,
    duration,
  } = usePlayer()

  if (playOnly) {
    return (
      <button
        onClick={togglePlay}
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_var(--primary)] transition-all hover:bg-foreground hover:text-background',
          className,
        )}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <Pause size={24} fill="currentColor" />
        ) : (
          <Play size={24} fill="currentColor" />
        )}
      </button>
    )
  }

  return (
    <div className={cn('flex flex-col items-center gap-1 py-1', className)}>
      <div className="flex items-center justify-center gap-1 sm:gap-2 xl:gap-3">
        <button
          onClick={playPrevious}
          className="flex min-h-12 min-w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Previous track"
        >
          <SkipBack size={32} />
        </button>
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_var(--primary)] transition-all hover:bg-foreground hover:text-background"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" />
          )}
        </button>
        <button
          onClick={playNext}
          className="flex min-h-12 min-w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Next track"
        >
          <SkipForward size={32} />
        </button>
      </div>
      <div className="flex gap-1 self-center font-mono text-[0.6em] text-muted-foreground">
        <span>{formatTime(currentTime)}</span>
        <span className="opacity-75">/</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
