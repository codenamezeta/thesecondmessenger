// components/AudioFilePlayer.tsx
'use client'

import { useRef } from 'react'
import { usePlayer } from '@/context/PlayerContext'

interface AudioFilePlayerProps {
  src: string // The secure Payload URL: /api/gated-content/file/track.mp3
  title: string
}

export default function AudioFilePlayer({ src, title }: AudioFilePlayerProps) {
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
    <audio
      ref={audioRef}
      title={title}
      controls={true}
      src={src}
      onPlay={handlePlay}
      className="mt-2 w-full"
      preload="metadata"
      autoPlay={false}
      loop={false}
      muted={false}
      playsInline={true}
    />
  )
}
