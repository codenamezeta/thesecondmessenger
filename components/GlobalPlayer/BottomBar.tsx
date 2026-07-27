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
  const seekReleaseTimeoutRef = useRef<number | null>(null)

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
    return () => {
      observer.disconnect()
      if (seekReleaseTimeoutRef.current !== null) {
        clearTimeout(seekReleaseTimeoutRef.current)
      }
    }
  }, [])

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value)
    setPlayed(newPercent)
    setCurrentTime(newPercent * duration)
  }

  const commitSeek = (input: HTMLInputElement) => {
    const newPercent = parseFloat(input.value)
    const time = newPercent * duration
    setCurrentTime(time)
    setPlayed(newPercent)
    seekTo(time)
    if (seekReleaseTimeoutRef.current !== null) {
      clearTimeout(seekReleaseTimeoutRef.current)
    }
    // Keep polling paused briefly so YouTube can apply the seek before we
    // read getCurrentTime() again (otherwise the bar snaps back on release).
    seekReleaseTimeoutRef.current = window.setTimeout(() => {
      seekReleaseTimeoutRef.current = null
      setIsSeeking(false)
    }, 350)
  }

  // Pointer events unify mouse, touch, and pen. Using them here fixes the
  // long-standing bug where touch users could drag the scrubber visually but
  // `seekTo()` never fired (onMouseUp doesn't run on touch devices).
  const handleSeekPointerDown = (e: React.PointerEvent<HTMLInputElement>) => {
    setIsSeeking(true)
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const handleSeekPointerUp = (e: React.PointerEvent<HTMLInputElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    commitSeek(e.currentTarget)
  }

  const handleSeekPointerCancel = (e: React.PointerEvent<HTMLInputElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setIsSeeking(false)
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
      {/* Seek bar — the visible track stays slim (2px, 4px on hover) in its
          original spot above the bottom bar, but the invisible <input> hit
          area extends 12px upward so finger taps can actually land on it.
          Touch precision matters more than visual width, so we decouple the
          two. `touch-none` prevents iOS Safari from eating the drag as a
          scroll gesture. */}
      <div
        id="seek_bar"
        className="group absolute -top-3 right-0 left-0 z-20 h-3 cursor-pointer"
      >
        {/* Visible muted track, anchored to the BOTTOM of the hit area (=
            the top edge of the bottom bar). Matches the original position. */}
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-0.5 bg-muted transition-all duration-150 group-hover:h-1" />
        {/* Filled primary track */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-primary shadow-[0_0_10px_hsl(var(--primary))] transition-all duration-150 ease-linear group-hover:h-1"
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
          onPointerDown={handleSeekPointerDown}
          onPointerUp={handleSeekPointerUp}
          onPointerCancel={handleSeekPointerCancel}
          className="absolute inset-0 h-full w-full cursor-pointer touch-none opacity-0"
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
