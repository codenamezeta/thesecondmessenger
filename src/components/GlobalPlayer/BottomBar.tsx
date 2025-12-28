import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  X,
  ChevronUp,
  ChevronDown,
  ThumbsUp,
  ListPlus,
  Share2,
  Download,
  Volume2,
  VolumeX,
  Monitor,
  Music,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { ViewMode } from './types'

interface BottomBarProps {
  currentSong: any
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  isPlaying: boolean
  togglePlay: () => void
  toggleVideo: () => void
  volume: number
  setVolume: (vol: number) => void
  isMuted: boolean
  toggleMute: () => void
  played: number
  handleSeekChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleSeekMouseUp: (e: React.MouseEvent<HTMLInputElement>) => void
  setIsSeeking: (seeking: boolean) => void
  currentTime: number
  duration: number
  formatTime: (seconds: number) => string
  onClose: () => void
}

export const BottomBar = ({
  currentSong,
  viewMode,
  setViewMode,
  isPlaying,
  togglePlay,
  toggleVideo,
  volume,
  setVolume,
  isMuted,
  toggleMute,
  played,
  handleSeekChange,
  handleSeekMouseUp,
  setIsSeeking,
  currentTime,
  duration,
  formatTime,
  onClose,
}: BottomBarProps) => {
  const coverArtUrl =
    typeof currentSong.coverArt === 'object' ? currentSong.coverArt?.url : undefined

  return (
    <section
      id="media_player_bottom_bar"
      className={cn(
        'flex flex-col justify-center w-full h-20 bg-surface/90 backdrop-blur-xl border-t border-white/10 z-20 pointer-events-auto transition-transform duration-300',
        viewMode === 'hidden' ? 'translate-y-full' : 'translate-y-0',
      )}
    >
      {/* Progress Bar (Not in container) */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2px] group hover:h-1 transition-all z-20 cursor-pointer">
        <div className="absolute inset-0 bg-gray-800"></div>
        <div
          className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-100 ease-linear"
          style={{ width: `${played * 100}%` }}
        ></div>
        <input
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played || 0}
          onChange={handleSeekChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={handleSeekMouseUp}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Controls Row (Inside container: px-2 on mobile and .container for desktop/tablet) */}
      <div
        className={cn(
          'flex w-full items-center justify-around sm:justify-between px-1 sm:px-0 sm:container',
        )}
      >
        <div className="flex w-3/5 sm:w-2/5 items-center gap-2">
          {/* Current Song Info */}
          <Link
            href={`/songs/${currentSong.slug}`}
            className="flex flex-auto overflow-x-clip max-w-72 items-center justify-start gap-2 hover:scale-105"
          >
            {coverArtUrl && (
              <Image
                src={coverArtUrl}
                alt={`${currentSong.title} Cover Art`}
                height={144}
                width={144}
                className="h-16 w-16"
              />
            )}
            <div className="flex flex-col flex-wrap justify-around md:gap-1">
              <h4 className=" text-white font-heading font-bold text-sm sm:text-base md:text-lg tracking-tight md:tracking-normal lg:tracking-wide sm:leading-none md:leading-none">
                {currentSong.title}
              </h4>
              <span className="text-xs md:text-md text-muted font-mono uppercase tracking-tighter md:tracking-normal lg:tracking-wide sm:leading-none md:leading-none">
                The Second Messenger
              </span>
            </div>
          </Link>

          {/* Actions */}
          {/* TODO: An overflow menu popup for when the screen width is too small to display these icons. */}
          <div className="hidden sm:flex flex-1 max-w-[33%] items-center justify-between">
            {/* Toggle Overlay Button */}
            <button
              onClick={() => setViewMode(viewMode === 'theater' ? 'audio' : 'theater')}
              className="text-muted hover:text-white border-r border-white/10 px-4"
              title={viewMode === 'theater' ? 'Collapse' : 'Expand'}
            >
              {viewMode === 'theater' ? <ChevronDown size={32} /> : <ChevronUp size={32} />}
            </button>

            <button className="text-muted hover:text-white">
              <ThumbsUp size={20} />
            </button>
            <button className="text-muted hover:text-white">
              <ListPlus size={20} />
            </button>
            <button className="text-muted hover:text-white">
              <Share2 size={20} />
            </button>
            <button className="text-muted hover:text-white">
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Playback and time display */}
        <div className="flex flex-col w-2/5 sm:w-1/5 items-center justify-center gap-1">
          {/* Playback Controls */}
          <div className="flex items-center justify-between gap-4">
            <button className="text-muted hover:text-white">
              <SkipBack size={32} />
            </button>

            <button
              onClick={togglePlay}
              className={cn(
                'w-12 h-12 flex items-center justify-center bg-primary hover:bg-white text-black rounded-full transition-all shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]',
              )}
            >
              {isPlaying ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" />
              )}
            </button>
            <button className="text-muted hover:text-white">
              <SkipForward size={32} />
            </button>
          </div>
          {/* Time display */}
          <div className="hidden md:flex text-[10px] font-mono text-gray-500 gap-1">
            <span>{formatTime(currentTime)}</span>
            <span className="opacity-75">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* View Modes & Volume */}
        <div className="hidden sm:flex sm:w-2/5 items-center justify-end gap-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
            <span
              className={cn(
                'text-[10px] font-mono uppercase',
                viewMode === 'audio' || viewMode === 'hidden' ? 'text-white' : 'text-muted',
              )}
            >
              Audio
            </span>
            <button
              onClick={toggleVideo}
              className={cn(
                'w-9 h-5 rounded-full relative transition-colors duration-200 ease-in-out',
                viewMode === 'mini' || viewMode === 'theater' ? 'bg-primary' : 'bg-white/20',
              )}
              title="Toggle Video"
            >
              <div
                className={cn(
                  'absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out',
                  viewMode === 'mini' || viewMode === 'theater' ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
            <span
              className={cn(
                'text-[10px] font-mono uppercase',
                viewMode === 'mini' || viewMode === 'theater' ? 'text-white' : 'text-muted',
              )}
            >
              Video
            </span>
          </div>

          {/* Volume Slider */}
          <div className="hidden sm:flex items-center gap-2 group">
            <button onClick={toggleMute} className="text-muted hover:text-white">
              {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-gray-700 rounded-lg cursor-pointer accent-white hover:accent-primary"
            />
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-red-500 transition-colors ml-2"
            title="Close Player"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
