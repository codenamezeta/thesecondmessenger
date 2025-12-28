import React from 'react'
import YouTube, { YouTubeProps } from 'react-youtube'
import { X } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { ViewMode } from './types'

interface VideoContainerProps {
  currentSong: any
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  onPlayerReady: YouTubeProps['onReady']
  onPlayerStateChange: YouTubeProps['onStateChange']
  origin: string
}

export const VideoContainer = ({
  currentSong,
  viewMode,
  setViewMode,
  onPlayerReady,
  onPlayerStateChange,
  origin,
}: VideoContainerProps) => {
  return (
    <div
      className={cn(
        'w-full h-full overflow-hidden relative',
        // In audio/hidden mode, we still need the iframe mounted but invisible
        (viewMode === 'audio' || viewMode === 'hidden') && 'opacity-0 pointer-events-none',
      )}
    >
      <YouTube
        videoId={currentSong.youtubeId ?? undefined}
        onReady={onPlayerReady}
        onStateChange={onPlayerStateChange}
        opts={{
          height: '100%',
          width: '100%',
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            origin: origin,
            rel: 0,
            fs: 0,
          },
        }}
        className="w-full h-full"
        // iframeClassName="w-full h-full"
      />

      {/* Close Button (Only in Mini Mode) */}
      {viewMode === 'mini' && (
        <button
          onClick={() => setViewMode('audio')}
          className="absolute top-2 right-2 p-1 bg-black/60 text-white hover:text-red-500 rounded backdrop-blur-md z-30"
          title="Hide Video"
        >
          <X size={14} />
        </button>
      )}
    </div>
  )
}
