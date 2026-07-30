'use client'

import {
  Volume,
  Volume1,
  Volume2,
  VolumeX,
  // X,
  Minimize2,
  Maximize2,
  Library,
  Captions,
  CaptionsOff,
  // Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'

interface GlobalControlsProps {
  className?: string
  /** When true, hides the volume slider (mobile layout) */
  hideVolume?: boolean
}

export const GlobalControls = ({
  className,
  hideVolume = false,
}: GlobalControlsProps) => {
  const {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    captionsEnabled,
    toggleCaptions,
    videoEnabled,
    setVideoEnabled,
    videoMode,
    toggleVideoMode,
    isLibraryDrawerOpen,
    setIsLibraryDrawerOpen,
    // isInfoDrawerOpen,
    setIsInfoDrawerOpen,
    // closePlayer,
  } = usePlayer()

  const VolumeIcon =
    isMuted || volume === 0
      ? VolumeX
      : volume <= 0.33
        ? Volume
        : volume <= 0.67
          ? Volume1
          : Volume2

  return (
    <div className={cn('flex items-center justify-between gap-3', className)}>
      {/* Volume Slider — hidden on mobile or when hideVolume is set */}
      {!hideVolume && (
        <div className="group hidden shrink items-center md:flex">
          <button
            onClick={toggleMute}
            className={cn(
              '-mr-2 flex min-h-12 min-w-12 items-center justify-center transition-colors group-hover:text-foreground',
              isMuted || volume === 0
                ? 'text-secondary hover:text-primary'
                : 'text-muted-foreground',
            )}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            <VolumeIcon size={18} />
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
            className="h-6 w-full cursor-pointer touch-none rounded-lg accent-muted-foreground transition-colors duration-200 ease-in-out hover:accent-primary"
            aria-label="Volume"
          />
        </div>
      )}

      {/* Enable Video / Collapsed+Expanded toggle mobile */}
      <button
        onClick={() =>
          videoEnabled ? setVideoEnabled(false) : setVideoEnabled(true)
        }
        className={cn(
          'flex items-center justify-center transition-colors md:hidden',
          videoEnabled
            ? 'text-foreground/70 hover:text-foreground'
            : 'text-foreground/20',
        )}
        title={videoEnabled ? 'Collapse Player' : 'Expand Player'}
      >
        {videoEnabled ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
      </button>

      {/* Enable Video / Collapsed+Expanded toggle desktop */}
      <div className="hidden items-center justify-around gap-2 rounded-full border border-muted-foreground/75 bg-muted px-2 py-1 md:flex">
        <span
          onClick={() => setVideoEnabled(false)}
          className={cn(
            'cursor-pointer truncate font-mono text-[0.5em] uppercase',
            !videoEnabled ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Audio
        </span>
        <button
          onClick={() => setVideoEnabled(!videoEnabled)}
          className={cn(
            'relative h-[1.333rem] w-9 cursor-pointer rounded-full border border-muted-foreground/75 transition-colors duration-200 ease-in-out',
            videoEnabled ? 'bg-primary/75' : 'bg-input',
          )}
          aria-label="Toggle video"
          title={videoEnabled ? 'Switch to Audio Only' : 'Enable Video'}
        >
          <div
            className={cn(
              'absolute top-1 left-1 size-3 rounded-full border border-muted-foreground/20 bg-foreground transition-transform duration-200 ease-in-out',
              videoEnabled ? 'translate-x-4' : 'translate-x-0',
            )}
          />
        </button>
        <span
          onClick={() => setVideoEnabled(true)}
          className={cn(
            'cursor-pointer truncate font-mono text-[0.5em] uppercase',
            videoEnabled ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          Video
        </span>
      </div>

      {/* Closed captions — only meaningful when video is visible */}
      <button
        onClick={toggleCaptions}
        className={cn(
          'hidden items-center justify-center transition-colors md:flex',
          videoEnabled
            ? captionsEnabled
              ? 'text-primary'
              : 'text-foreground/70 hover:text-foreground'
            : 'text-foreground/20',
        )}
        title={
          !videoEnabled
            ? 'Enable video to use captions'
            : captionsEnabled
              ? 'Turn off captions'
              : 'Turn on captions'
        }
        aria-label={captionsEnabled ? 'Turn off captions' : 'Turn on captions'}
        aria-pressed={captionsEnabled}
        disabled={!videoEnabled}
      >
        {captionsEnabled ? <Captions size={18} /> : <CaptionsOff size={18} />}
      </button>

      {/* Video Mode toggle — Theater / Mini (only relevant when video is enabled) */}
      <button
        onClick={toggleVideoMode}
        className={cn(
          'hidden items-center justify-center transition-colors md:flex',
          videoEnabled
            ? 'text-foreground/70 hover:text-foreground'
            : 'text-foreground/20',
        )}
        title={
          videoMode === 'theater'
            ? 'Switch to Mini Player'
            : 'Switch to Theater Mode'
        }
        disabled={!videoEnabled}
      >
        {videoMode === 'theater' ? (
          <Minimize2 size={18} />
        ) : (
          <Maximize2 size={18} />
        )}
      </button>

      {/* Library Drawer button */}
      <button
        onClick={() => {
          setIsLibraryDrawerOpen(!isLibraryDrawerOpen)
          setIsInfoDrawerOpen(false)
        }}
        className={cn(
          'flex items-center justify-center transition-colors',
          isLibraryDrawerOpen
            ? 'text-primary'
            : 'text-foreground/50 hover:text-foreground',
        )}
        title={isLibraryDrawerOpen ? 'Close Library' : 'Open Library'}
        aria-label="Toggle Library Drawer"
      >
        <Library size={20} />
      </button>

      {/* Info Drawer toggle */}
      {/* <button
        onClick={() => setIsInfoDrawerOpen(!isInfoDrawerOpen)}
        className={cn(
          'flex items-center justify-center transition-colors',
          isInfoDrawerOpen
            ? 'text-primary'
            : 'text-foreground/50 hover:text-foreground',
        )}
        title={isInfoDrawerOpen ? 'Close Info Drawer' : 'Open Info Drawer'}
      >
        <Info size={18} />
      </button> */}

      {/* Library Drawer toggle — shown only on mobile in this row */}
      {/* <button
        onClick={() => setIsLibraryDrawerOpen(!isLibraryDrawerOpen)}
        className={cn(
          'flex items-center justify-center transition-colors md:hidden',
          isLibraryDrawerOpen
            ? 'text-primary'
            : 'text-foreground/50 hover:text-foreground',
        )}
        title="Toggle Library Drawer"
        aria-label="Toggle Library"
      >
        <Library size={20} />
      </button> */}

      {/* Close Player */}
      {/* <button
        onClick={closePlayer}
        className="flex items-center justify-center text-foreground/50 transition-colors hover:text-secondary"
        title="Close Player (Standby)"
        aria-label="Close Player"
      >
        <X size={20} />
      </button> */}
    </div>
  )
}
