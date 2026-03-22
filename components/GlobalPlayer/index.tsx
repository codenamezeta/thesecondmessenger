'use client'

import { useEffect } from 'react'
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
                ;(metadata as { description?: string }).description = snippet.description
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
  const { currentSong, videoEnabled } = usePlayer()

  // Detect desktop breakpoint (md = 768px). Defaults to false (mobile-first).
  const isDesktop = useMediaQuery('(min-width: 768px)')

  useYouTubeMetadataSync()

  if (!currentSong?.youtubeId) return null

  return (
    <aside
      id="media_player"
      className="pointer-events-none fixed inset-x-0 bottom-0 top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))] z-20 flex flex-col justify-end"
    >
      {/* ================================================================
          MOBILE LAYOUT (< md)
          Always mounted so VideoStage never unmounts (avoids playback restart).
          CSS height controls whether the expanded UI is visible.
          ================================================================ */}
      {!isDesktop && (
        <div
          className={cn(
            'flex flex-col overflow-hidden transition-all duration-300 ease-in-out bg-background/95 backdrop-blur-lg',
            // Expand to fill remaining space above the BottomBar when video is enabled.
            // Collapse to zero height (audio-only) when video is disabled — VideoStage
            // stays mounted inside and handles its own off-screen positioning for audio.
            videoEnabled ? 'flex-1 min-h-0' : 'h-0',
          )}
        >
          {/* 1. Global Controls row */}
          <GlobalControls
            hideVolume
            className="pointer-events-auto shrink-0 border-b border-border/50 bg-background/50 px-3 py-1"
          />

          {/* 2. Library Drawer (inline, height-expandable) */}
          <LibraryDrawerInline className="pointer-events-auto shrink-0" />

          {/* 3. Video Stage — STABLE tree position; never conditionally unmounted.
                When videoEnabled=false the container collapses to h-0 and VideoStage
                internally positions itself off-screen via its `isHidden` logic. */}
          <VideoStage isMobileExpanded={videoEnabled} className="pointer-events-auto" />

          {/* 4. Action Buttons */}
          <ActionButtons className="pointer-events-auto shrink-0 border-t border-border/50 bg-background/50 px-2" />

          {/* 5. Queue Controls */}
          <QueueControls className="pointer-events-auto shrink-0 border-t border-border/50 bg-background/50 px-2 py-1" />

          {/* 6. Info Drawer (inline, height-expandable, tab bar always visible) */}
          <InfoDrawerInline className="pointer-events-auto shrink-0" />
        </div>
      )}

      {/* ================================================================
          DESKTOP LAYOUT (md+)
          VideoStage uses fixed positioning internally; Sheets portal to root.
          ================================================================ */}
      {isDesktop && (
        <>
          <LibraryDrawerSheet />
          <InfoDrawerSheet />
          {/* VideoStage is always in this stable position on desktop */}
          <VideoStage isMobileExpanded={false} />
        </>
      )}

      {/* ================================================================
          BOTTOM BAR — always rendered (slides in/out with controlsVisible)
          ================================================================ */}
      <BottomBar />
    </aside>
  )
}
