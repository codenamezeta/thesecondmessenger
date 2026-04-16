'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Library } from 'lucide-react'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SwipeableDrawer } from './ui/SwipeableDrawer'

/** Inner content shared between the desktop Sheet and mobile inline panel */
const LibraryContent = () => {
  const {
    queue,
    currentSong,
    currentSongIndex,
    playPlaylist,
    activeLibraryTab,
    setActiveLibraryTab,
  } = usePlayer()

  const [playlists, setPlaylists] = useState<any[]>([])

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const req = await fetch('/api/playlists?depth=2')
        const res = await req.json()
        if (res.docs) setPlaylists(res.docs)
      } catch (e) {
        console.error('Failed to fetch playlists:', e)
      }
    }
    fetchPlaylists()
  }, [])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tab Bar */}
      <div className="flex shrink-0 items-center border-b border-border/50">
        <button
          onClick={() => setActiveLibraryTab('playlists')}
          className={cn(
            'h-10 w-full font-heading text-xs tracking-wider uppercase transition-colors duration-300',
            activeLibraryTab === 'playlists'
              ? 'border-b-2 border-primary bg-primary/20 text-primary'
              : 'text-foreground/75 hover:bg-primary/10 hover:text-foreground',
          )}
        >
          Playlists
        </button>
        <button
          onClick={() => setActiveLibraryTab('queue')}
          className={cn(
            'h-10 w-full font-heading text-xs tracking-wider uppercase transition-colors duration-300',
            activeLibraryTab === 'queue'
              ? 'border-b-2 border-primary bg-primary/20 text-primary'
              : 'text-foreground/75 hover:bg-primary/10 hover:text-foreground',
          )}
        >
          Queue
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {activeLibraryTab === 'queue' ? (
          <ol className="space-y-2 p-2">
            {queue.map((song, index) => {
              const isNowPlaying = index === currentSongIndex
              const displaySong =
                isNowPlaying && currentSong ? currentSong : song
              const coverArtUrl =
                displaySong?.coverImage ||
                (typeof displaySong?.coverArt === 'object'
                  ? (displaySong?.coverArt as { url?: string })?.url
                  : undefined)

              return (
                <li
                  key={`${String(song.id ?? song.youtubeId)}-${index}`}
                  onClick={() => playPlaylist(queue, index)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-all duration-300 ease-in-out',
                    isNowPlaying
                      ? 'border-primary/50 bg-primary/20'
                      : 'border-border/50 bg-transparent opacity-50 hover:scale-y-105 hover:border-border hover:bg-card/50 hover:opacity-80',
                  )}
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-transparent">
                    {coverArtUrl ? (
                      <Image
                        src={coverArtUrl}
                        alt={`Cover art for ${displaySong?.title ?? ''}`}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center bg-muted/75 text-xs text-foreground/75">
                        {index + 1}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    {isNowPlaying && (
                      <p className="truncate text-[0.67rem] tracking-widest text-foreground/75">
                        Now Playing
                      </p>
                    )}
                    <p className="font-heading font-bold text-foreground">
                      {displaySong?.title}
                    </p>
                    <p className="truncate text-xs text-foreground/75">
                      {(song as { artist?: string }).artist ||
                        (displaySong as { artist?: string })?.artist ||
                        ''}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        ) : (
          <ul className="space-y-2 p-2">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                onClick={() => playPlaylist(playlist.tracks || [], 0)}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border/20 bg-card/20 p-3 transition-all hover:border-border/50 hover:bg-card/50"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-primary/20">
                  {playlist.coverImage?.url ? (
                    <Image
                      src={playlist.coverImage.url}
                      alt={playlist.title}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center bg-primary/20 text-primary">
                      <Library size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">
                    {playlist.title}
                  </p>
                  <p className="text-xs text-foreground/75">
                    {playlist.tracks?.length || 0} Tracks
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop Sheet
// ---------------------------------------------------------------------------

export const LibraryDrawerSheet = () => {
  const { isLibraryDrawerOpen, setIsLibraryDrawerOpen } = usePlayer()

  return (
    <Sheet open={isLibraryDrawerOpen} onOpenChange={setIsLibraryDrawerOpen}>
      <SheetContent
        side="right"
        className={cn(
          'flex flex-col gap-0 border-r border-border/50 bg-background/90 p-0 backdrop-blur-lg',
          'top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))]',
          'h-[calc(100svh-var(--admin-bar-height,0px)-var(--main-nav-bar-height,0px))]',
        )}
        showCloseButton={true}
      >
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 py-3">
          <SheetTitle className="py-3 font-heading text-sm tracking-widest text-muted-foreground uppercase">
            Library
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <LibraryContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Mobile inline collapsible panel
// ---------------------------------------------------------------------------

interface LibraryDrawerInlineProps {
  className?: string
}

export const LibraryDrawerInline = ({
  className,
}: LibraryDrawerInlineProps) => {
  const { isLibraryDrawerOpen, setIsLibraryDrawerOpen } = usePlayer()

  return (
    <div
      className={cn(
        'w-full overflow-hidden transition-[max-height] duration-500 ease-in-out',
        isLibraryDrawerOpen ? 'max-h-[40svh]' : 'max-h-0',
        className,
      )}
    >
      <div className="h-[40svh] border-b border-border/50 bg-background/75 backdrop-blur-sm">
        <SwipeableDrawer onClose={() => setIsLibraryDrawerOpen(false)}>
          <LibraryContent />
        </SwipeableDrawer>
      </div>
    </div>
  )
}
