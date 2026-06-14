'use client'

import { Play, Pause } from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'

interface ArchiveSongPlayButtonProps {
  song: Song
  className?: string
  size?: 'sm' | 'md'
}

export function ArchiveSongPlayButton({
  song,
  className,
  size = 'md',
}: ArchiveSongPlayButtonProps) {
  const { playMedia, isPlaying, currentSong, togglePlay } = usePlayer()
  const isCurrent = isPlaying && currentSong?.id === song.id

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCurrent) {
      togglePlay()
      return
    }
    playMedia(song)
  }

  const dim =
    size === 'sm' ? 'size-9 min-h-9 min-w-9' : 'size-11 min-h-11 min-w-11'
  const iconSize = size === 'sm' ? 'size-4' : 'size-5'

  return (
    <Button
      type="button"
      size="default"
      variant="outline"
      onClick={handleClick}
      aria-label={isCurrent ? `Pause ${song.title}` : `Play ${song.title}`}
      className={cn(
        dim,
        'shrink-0 rounded-full border-primary/50 bg-background/90 text-primary shadow-sm transition-colors',
        'hover:border-primary hover:bg-primary hover:text-primary-foreground',
        isCurrent && 'border-primary bg-primary text-primary-foreground',
        className,
      )}
    >
      {isCurrent ? (
        <Pause className={iconSize} fill="currentColor" aria-hidden />
      ) : (
        <Play
          className={cn(iconSize, 'ml-0.5')}
          fill="currentColor"
          aria-hidden
        />
      )}
    </Button>
  )
}
