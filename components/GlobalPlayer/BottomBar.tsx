'use client'

import { useRef, useEffect } from 'react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import { SongInfo } from './ui/SongInfo'
import { QueueControls } from './ui/QueueControls'
import { ActionButtons } from './ui/ActionButtons'
import { GlobalControls } from './ui/GlobalControls'
import { ChevronDown, ChevronUp } from 'lucide-react'

/**
 * BottomBar
 *
 * Desktop layout (md+):
 *   [SongInfo + ActionButtons] | [QueueControls] | [GlobalControls]
 *   + Library button opens the Library Drawer Sheet
 *   + Info button is now inside ActionButtons (the 'i' icon)
 *   + Seek bar spans across the very top edge
 *
 * Mobile layout (< md):
 *   [SongInfo] [Play/Pause]  (simplified)
 *   + Seek bar spans across the very top edge
 */
export const BottomBar = () => {
  const {
    controlsVisible,
    played,
    setIsSeeking,
    seekTo,
    setPlayed,
    setCurrentTime,
    duration,
    // isLibraryDrawerOpen,
    // setIsLibraryDrawerOpen,
    isVideoEnabled,
    setIsVideoEnabled,
  } = usePlayer()

  // Keep --bottom-bar-height in sync so VideoStage can position itself correctly
  const sectionRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      const h = entry?.contentRect.height ?? 0
      document.documentElement.style.setProperty(
        '--bottom-bar-height',
        `${h}px`,
      )
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value)
    setPlayed(newPercent)
    setCurrentTime(newPercent * duration)
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsSeeking(false)
    const newPercent = parseFloat((e.target as HTMLInputElement).value)
    seekTo(newPercent * duration)
  }

  return (
    <section
      ref={sectionRef}
      id="global_player_bottom_bar"
      className={cn(
        'pointer-events-auto z-20 flex w-full flex-col justify-center border-t border-white/10 bg-background/75 backdrop-blur-sm transition-transform duration-300',
        controlsVisible
          ? 'translate-y-0 opacity-100'
          : 'translate-y-full opacity-0',
      )}
    >
      {/* Seek bar — spans across the entire top edge, outside the container */}
      <div
        id="seek_bar"
        className="group absolute -top-[2px] right-0 left-0 z-20 h-[2px] cursor-pointer transition-all hover:h-1"
      >
        <div className="absolute inset-0 bg-muted" />
        <div
          className="absolute top-0 bottom-0 left-0 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-100 ease-linear"
          style={{ width: `${(played ?? 0) * 100}%` }}
        />
        <input
          name="seek"
          id="seek"
          type="range"
          min={0}
          max={0.999999}
          step="any"
          value={played ?? 0}
          onChange={handleSeekChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={handleSeekMouseUp}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Seek"
        />
      </div>

      {/* ---- Desktop layout (md+) ---- */}
      <div
        id="global_player_bottom_bar_container"
        className="hidden px-4 md:flex 2xl:container 2xl:mx-auto 2xl:px-0"
      >
        {/* Left: Song Info + Action Buttons */}
        <div className="flex w-2/5 items-center gap-2">
          <SongInfo className="min-w-0 shrink" />
          {/* <div className="ml-4 flex items-center"> */}
          <ActionButtons />
          {/* </div> */}
        </div>

        {/* Center: Queue Controls */}
        <div className="flex w-1/5 justify-center">
          <QueueControls />
        </div>

        {/* Right: Global Controls */}
        <div className="flex w-2/5 justify-end">
          <GlobalControls />
        </div>
      </div>

      {/* ---- Mobile layout (< md) ---- */}
      <div className="flex items-center justify-between gap-2 px-4 py-2 md:hidden">
        <SongInfo className="min-w-0 flex-1" />

        {/* Enable Video / Collapsed+Expanded toggle Video Only on mobile */}
        <button
          onClick={() =>
            isVideoEnabled ? setIsVideoEnabled(false) : setIsVideoEnabled(true)
          }
          className={cn(
            'flex items-center justify-center border-x border-border px-2 transition-colors md:hidden',
            isVideoEnabled
              ? 'text-foreground/50 hover:text-foreground'
              : 'text-foreground/70',
          )}
          title={isVideoEnabled ? 'Collapse Player' : 'Expand Player'}
        >
          {isVideoEnabled ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
        </button>
        <QueueControls playOnly />
      </div>
    </section>
  )
}
