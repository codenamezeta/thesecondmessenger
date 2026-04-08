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
    <div className="my-6 flex flex-col gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm tracking-wider text-accent uppercase">
          Security Clearance Accepted
        </span>
      </div>

      <p className="text-lg font-bold">{title}</p>

      <audio
        ref={audioRef}
        controls
        controlsList="nodownload" // Hides the default download button in Chrome/Edge
        src={src}
        onPlay={handlePlay}
        className="mt-2 w-full"
      />
    </div>
  )
}
