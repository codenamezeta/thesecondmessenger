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
  Volume,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

interface BottomBarProps {
  currentSong: any
  isVideoEnabled: boolean
  setIsVideoEnabled: (enabled: boolean) => void
  miniMode: boolean
  setMiniMode: (mode: boolean) => void
  controlsVisible: boolean
  setControlsVisible: (visible: boolean) => void
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
  isVideoEnabled,
  setIsVideoEnabled,
  miniMode,
  setMiniMode,
  controlsVisible,
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
        'flex flex-col w-full justify-center bg-black/30 backdrop-blur-3xl border-t border-white/10 z-20 pointer-events-auto transition-transform duration-300',
        controlsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full',
      )}
    >
      {/* Progress Bar (Not in container) */}
      <div
        id="player_progress_seek"
        className="absolute -top-[2px] left-0 right-0 h-[2px] group hover:h-1 transition-all z-20 cursor-pointer"
      >
        <div className="absolute inset-0 bg-gray-800"></div>
        <div
          className="absolute top-0 left-0 bottom-0 bg-primary shadow-[0_0_10px_var(--color-primary)] transition-all duration-100 ease-linear"
          style={{ width: `${played * 100}%` }}
        ></div>
        <input
          name="seek"
          id="seek"
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
        id="player_controls"
        className={cn(
          'flex w-full items-center justify-around sm:justify-between px-1 sm:px-0 sm:container',
        )}
      >
        <div id="player_controls_song_info" className="flex w-3/5 sm:w-2/5 items-center gap-2">
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
                sizes="144px"
              />
            )}
            <div className="flex flex-col gap-1 my-[0.33rem]">
              <h4 className="text-lg text-white font-heading font-bold tracking-wide leading-[0.75] break-words">
                {currentSong.title}
              </h4>
              <span className="text-sm text-muted font-heading uppercase leading-3 break-words">
                The Second Messenger
              </span>
            </div>
          </Link>

          {/* Actions */}
          <div className="flex flex-auto truncate min-w-36 max-w-72 items-center justify-between space-x-1">
            {/* Open Browser Button */}
            <button
              onClick={() => {
                if (isVideoEnabled && !miniMode) {
                  toggleVideo() // Collapse to Audio
                } else {
                  if (!isVideoEnabled) toggleVideo() // Enable Video
                  setMiniMode(false) // Ensure Theater
                }
              }}
              className="text-muted hover:text-white border-r border-white/10 flex-auto flex items-center justify-center"
              title={isVideoEnabled && !miniMode ? 'Collapse Browser' : 'Expand Browser'}
            >
              {isVideoEnabled && !miniMode ? <ChevronDown size={32} /> : <ChevronUp size={32} />}
            </button>
            <button
              className="text-muted hover:text-white flex-auto flex items-center justify-center"
              title="Like on YouTube"
            >
              <ThumbsUp size={20} />
            </button>
            <button
              className="text-muted hover:text-white flex-auto flex items-center justify-center"
              title="Save to YouTube"
            >
              <ListPlus size={20} />
            </button>
            <button
              className="text-muted hover:text-white flex-auto flex items-center justify-center"
              title="Share this song"
            >
              <Share2 size={20} />
            </button>
            <button
              className="text-muted hover:text-white flex-auto flex items-center justify-center"
              title="Download this song"
            >
              <Download size={20} />
            </button>
          </div>
        </div>

        {/* Playback and time display */}
        <div id="player_controls_playback" className="flex flex-col w-2/5 sm:w-1/5 gap-1 py-1">
          {/* Playback Controls */}
          <div className="flex justify-center gap-1 sm:gap-2 xl:gap-3">
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
          <div className="hidden md:flex self-center text-xs font-mono text-muted gap-1">
            <span>{formatTime(currentTime)}</span>
            <span className="opacity-75">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* View Modes & Volume */}
        <div
          id="player_controls_view_modes"
          className="flex w-2/5 items-center justify-end gap-3 flex-wrap"
        >
          {/* Volume Slider */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className={cn(
                isMuted || volume === 0
                  ? 'text-secondary hover:text-primary transition-colors'
                  : 'text-muted hover:text-white',
              )}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={18} />
              ) : volume >= 0 && volume <= 0.33 ? (
                <Volume size={18} />
              ) : volume > 0.33 && volume <= 0.67 ? (
                <Volume1 size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
            <input
              name="volume"
              id="volume"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-lg cursor-pointer accent-white hover:accent-primary"
            />
          </div>

          {/* Audio / Video toggle */}
          <div className="flex items-center justify-around gap-2 bg-white/5 rounded-full px-3 py-1 border border-white/10">
            <span
              onClick={() => setIsVideoEnabled(false)}
              className={cn(
                'text-[0.5em] font-mono uppercase truncate cursor-pointer',
                !isVideoEnabled ? 'text-white' : 'text-muted',
              )}
            >
              Audio
            </span>
            <button
              onClick={toggleVideo}
              className={cn(
                'w-9 h-5 rounded-full relative transition-colors duration-200 ease-in-out',
                isVideoEnabled ? 'bg-primary' : 'bg-white/20',
              )}
              title="Toggle Video"
            >
              <div
                className={cn(
                  'absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out',
                  isVideoEnabled ? 'translate-x-4' : 'translate-x-0',
                )}
              />
            </button>
            <span
              onClick={() => setIsVideoEnabled(true)}
              className={cn(
                'text-[0.5em] font-mono uppercase truncate cursor-pointer',
                isVideoEnabled ? 'text-white' : 'text-muted',
              )}
            >
              Video
            </span>
          </div>

          <button
            onClick={onClose}
            className="text-muted hover:text-red-500 transition-colors flex justify-end"
            title="Close Player"
          >
            <X size={20} />
          </button>
        </div>
      </div>
    </section>
  )
}
