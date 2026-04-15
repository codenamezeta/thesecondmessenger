// components/AudioFilePlayer.tsx
'use client'

import { useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'
interface AudioFilePlayerProps {
  src: string // The secure Payload URL: /api/gated-content/file/track.mp3
  title: string
  description?: string | null
}

export default function AudioFilePlayer({
  src,
  title,
  description = null,
}: AudioFilePlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)

  // Bring in methods to control GlobalPlayer
  const { setIsPlaying, isPlaying } = usePlayer()

  const handlePlay = () => {
    // 1. Tell the GlobalPlayer to stop.
    if (isPlaying) {
      setIsPlaying(false)
    }
  }

  return (
    <>
      <h4 className="font-heading text-lg font-bold tracking-wider text-foreground uppercase">
        {title}
      </h4>
      <audio
        ref={audioRef}
        controls
        src={src}
        onPlay={handlePlay}
        className="mt-2 w-full"
      />
      <p className="font-mono text-sm text-muted-foreground italic">
        {description}
      </p>
    </>
  )
}
