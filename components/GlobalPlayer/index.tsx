'use client'

import { useEffect } from 'react'
import { motion, useDragControls, type PanInfo } from 'motion/react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import { useMediaQuery } from '@/utilities/useMediaQuery'

import { VideoStage } from './VideoStage'
import { BottomBar } from './BottomBar'
import { LibraryDrawerSheet, LibraryDrawerInline } from './LibraryDrawer'
import { InfoDrawerSheet, InfoDrawerInline } from './InfoDrawer'
import { GlobalControls } from './ui/GlobalControls'
import { ActionButtons } from './ui/ActionButtons'
import { QueueControls } from './ui/QueueControls'

const COLLAPSE_SWIPE_DISTANCE_PX = 80
const COLLAPSE_SWIPE_VELOCITY = 500

// ---------------------------------------------------------------------------
// YouTube metadata sync
// ---------------------------------------------------------------------------
// Kept here (close to the data-fetching layer) so VideoStage stays focused on
// the player bridge. This effect is a side-effect of currentSong changing.

const useYouTubeMetadataSync = () => {
  const { currentSong, updateSongMetadata } = usePlayer()

  useEffect(() => {
    if (!currentSong?.youtubeId) return

    const shouldFetchMetadata =
      currentSong.title === 'Unknown Title' ||
      currentSong.title === 'Loading...' ||
      (!(currentSong as { coverImage?: string }).coverImage &&
        !currentSong.coverArt) ||
      (!(currentSong as { description?: string }).description &&
        !(currentSong as { about?: unknown }).about)

    const fetchYouTubeData = async () => {
      try {
        const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
        if (!apiKey) return

        if (shouldFetchMetadata) {
          const videoRes = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${currentSong.youtubeId}&key=${apiKey}`,
          )
          const videoData = await videoRes.json()
          if (videoData.items?.[0]) {
            const snippet = videoData.items[0].snippet
            if (currentSong.youtubeId) {
              const metadata: Partial<typeof currentSong> = {}
              if (
                !currentSong.title ||
                currentSong.title === 'Unknown Title' ||
                currentSong.title === 'Loading...'
              ) {
                metadata.title = snippet.title
              }
              if (!(currentSong as { artist?: string }).artist) {
                ;(metadata as { artist?: string }).artist = snippet.channelTitle
              }
              if (
                !(currentSong as { coverImage?: string }).coverImage &&
                !currentSong.coverArt
              ) {
                ;(metadata as { coverImage?: string }).coverImage =
                  snippet.thumbnails?.maxres?.url ||
                  snippet.thumbnails?.high?.url ||
                  snippet.thumbnails?.medium?.url
              }
              if (
                !(currentSong as { description?: string }).description &&
                !(currentSong as { about?: unknown }).about
              ) {
                ;(metadata as { description?: string }).description =
                  snippet.description
              }
              if (Object.keys(metadata).length > 0) {
                updateSongMetadata(currentSong.youtubeId as string, metadata)
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching YouTube data:', error)
      }
    }

    fetchYouTubeData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSong?.youtubeId])
}

// ---------------------------------------------------------------------------
// GlobalPlayer
// ---------------------------------------------------------------------------

export const GlobalPlayer = () => {
  const { currentSong, videoEnabled, setVideoEnabled } = usePlayer()

  // Match Tailwind `md` (768px) so layout + `md:*` utilities stay in sync.
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useYouTubeMetadataSync()

  // Drag controls for collapsing the expanded mobile player. Only the pill
  // handle initiates the drag (dragListener=false), so taps on child controls
  // never accidentally dismiss the player.
  const collapseControls = useDragControls()

  const handleCollapseDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.offset.y > COLLAPSE_SWIPE_DISTANCE_PX ||
      info.velocity.y > COLLAPSE_SWIPE_VELOCITY
    ) {
      setVideoEnabled(false)
    }
  }

  // Only engage drag on mobile while the expanded player is actually showing.
  // On desktop the wrapper uses `display: contents` (no box), so even if drag
  // were active, transforms wouldn't render; but disabling drag also avoids
  // attaching unnecessary pointer listeners.
  const collapseDragActive = !isDesktop && videoEnabled

  if (!currentSong?.youtubeId) return null

  return (
    <aside
      id="media_player"
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-20 flex flex-col justify-end md:sticky',
        // Below md the expanded stack uses flex-1; the aside must span nav→bottom bar
        // or the wrapper shrink-wraps to content and the video stage gets 0 height.
        'max-md:top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))]',
      )}
    >
      {/* ================================================================
          Single flex column + one VideoStage instance.
          - Below md: wrapper is a real flex column (video grows with flex-1).
          - md+: wrapper uses `display:contents` so its children slot into <aside>
            without duplicating VideoStage — crossing the breakpoint only flips
            props/CSS, so the YouTube iframe is never torn down.
          ================================================================ */}
      {/* NOTE: `backdrop-blur-lg` and `bg-background/95` are applied ONLY when
          the wrapper is actually visible (videoEnabled on mobile). When the
          wrapper is collapsed to `h-0`, those properties would still create a
          containing block for fixed-positioned descendants (CSS spec: any
          non-none `backdrop-filter` does this), which would trap the Song
          page's inline VideoStage overlay inside a 0-height box and hide it.
          See: https://developer.mozilla.org/docs/Web/CSS/CSS_positioned_layout/Containing_block */}
      <motion.div
        drag={collapseDragActive ? 'y' : false}
        dragListener={false}
        dragControls={collapseControls}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.35 }}
        dragSnapToOrigin
        onDragEnd={handleCollapseDragEnd}
        className={cn(
          'flex flex-col overflow-hidden duration-300 ease-in-out',
          // Transition only layout-affecting properties — leaving `transform`
          // alone so framer-motion's drag transforms don't double-animate.
          'transition-[flex,height,background-color]',
          'max-md:min-h-0',
          videoEnabled
            ? 'max-md:flex-1 max-md:bg-background/95 max-md:backdrop-blur-lg'
            : 'max-md:h-0',
          'md:contents',
        )}
      >
        {/* 0. Mobile-only drag handle — grab target for swipe-down-to-collapse.
            Rendered via `md:hidden` so the expanded mobile stack gets a visible
            pill, while desktop never sees it. Pointer-down starts the drag
            on the parent motion.div (dragListener=false keeps taps elsewhere
            from triggering dismissal). */}
        {collapseDragActive && (
          <div
            onPointerDown={(e) => collapseControls.start(e)}
            role="button"
            tabIndex={-1}
            aria-label="Drag handle — swipe down to collapse player"
            className="pointer-events-auto flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing md:hidden"
          >
            <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
          </div>
        )}

        {/* 1. Global Controls row (mobile only in flow) */}
        <GlobalControls
          hideVolume
          className="pointer-events-auto shrink-0 border-b border-border/50 bg-background/50 px-3 py-1 md:hidden"
        />

        {/* 2. Library Drawer — inline on mobile */}
        <LibraryDrawerInline className="pointer-events-auto shrink-0 md:hidden" />

        {/* 3. Video Stage — exactly one instance for all breakpoints */}
        <VideoStage
          isMobileExpanded={!isDesktop && videoEnabled}
          className="pointer-events-auto"
        />

        {/* 4. Action Buttons */}
        <ActionButtons className="pointer-events-auto shrink-0 border-t border-border/50 bg-background/50 px-2 md:hidden" />

        {/* 5. Queue Controls */}
        <QueueControls className="pointer-events-auto shrink-0 border-t border-border/50 bg-background/50 px-2 py-1 md:hidden" />

        {/* 6. Info Drawer — inline on mobile */}
        <InfoDrawerInline className="pointer-events-auto shrink-0 md:hidden" />
      </motion.div>

      {/* Desktop: sheet variants (VideoStage stays in the column above). */}
      {isDesktop && (
        <>
          <InfoDrawerSheet />
          <LibraryDrawerSheet />
        </>
      )}

      {/* ================================================================
          BOTTOM BAR — always rendered (slides in/out with controlsVisible)
          ================================================================ */}
      <BottomBar />
    </aside>
  )
}
