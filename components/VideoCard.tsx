'use client'

import Image from 'next/image'
import { PlayableMedia, usePlayer } from '@/context/PlayerContext'

export const VideoCard = ({ video }: { video: PlayableMedia }) => {
  const { playMedia, currentSong, isPlaying } = usePlayer()

  // Use video.id or video.youtubeId for comparison
  const isCurrent =
    currentSong?.id === video.id ||
    (currentSong?.youtubeId && currentSong.youtubeId === video.youtubeId)
  const isActuallyPlaying = isCurrent && isPlaying

  return (
    <div
      onClick={() => playMedia(video.youtubeId || video)} // Pass string ID or full object
      className={`group h-80 w-80 bg-card rounded overflow-hidden hover:bg-background transition-all border cursor-pointer
        ${isCurrent ? 'border-accent ring-1 ring-accent' : 'border-gray-800 hover:border-gray-700'}`}
    >
      <div className="relative aspect-square bg-muted">
        {video.coverArt && typeof video.coverArt === 'object' && video.coverArt.url ? (
          <Image
            src={video.coverArt.url}
            alt="alt"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-primary font-heading text-3xl font-bold">
            {video.title}
          </div>
        )}

        {/* Hover Play Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
          ${isActuallyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <div className="flex items-center justify-center bg-secondary text-foreground w-12 h-12 p-4 rounded-full">
            {isActuallyPlaying ? '❚❚' : '▶'}
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between space-y-2">
        <h3 className="text-xl font-bold text-primary">{video.title}</h3>
        <span className="text-secondary">{video.genres}</span>
        <span className="text-card-foreground">{video.tagline}</span>
      </div>
    </div>
  )
}
