'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, Library, Play, Shuffle } from 'lucide-react'
import { usePlayer, PlayableMedia } from '@/context/PlayerContext'
import { Playlist } from '@/payload-types'
import { cn } from '@/utilities/ui'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SwipeableDrawer } from './ui/SwipeableDrawer'

/** A unified shape covering both CMS playlists and auto-generated "smart" ones. */
type PlaylistView = {
  id: string
  title: string
  description?: string
  coverUrl?: string | null
  tracks: PlayableMedia[]
  kind: 'smart' | 'cms'
}

/** A song is "released" when it has a release date that is not in the future. */
const isReleased = (song: PlayableMedia): boolean => {
  const releaseDate = (song as { releaseDate?: string | null }).releaseDate
  if (!releaseDate) return false
  return new Date(releaseDate).getTime() <= Date.now()
}

const coverUrlOf = (media: PlayableMedia | undefined | null): string | null => {
  if (!media) return null
  if (media.coverImage) return media.coverImage
  const art = (media as { coverArt?: unknown }).coverArt
  if (art && typeof art === 'object' && 'url' in art) {
    return (art as { url?: string }).url ?? null
  }
  return null
}

/** Inner content shared between the desktop Sheet and mobile inline panel */
const LibraryContent = () => {
  const {
    queue,
    allSongs,
    currentSong,
    currentSongIndex,
    playPlaylist,
    shuffleQueue,
    activeLibraryTab,
    setActiveLibraryTab,
  } = usePlayer()

  const [cmsPlaylists, setCmsPlaylists] = useState<Playlist[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        const req = await fetch(
          '/api/playlists?depth=2&sort=displayOrder&limit=100',
        )
        const res = await req.json()
        if (res.docs) setCmsPlaylists(res.docs)
      } catch (e) {
        console.error('Failed to fetch playlists:', e)
      }
    }
    fetchPlaylists()
  }, [])

  // Auto-generated "smart" playlists derived from the discography, combined
  // with editor-curated CMS playlists. Discography always leads; other smart
  // playlists (e.g. Covers) trail the curated ones.
  const playlists = useMemo<PlaylistView[]>(() => {
    const released = allSongs.filter(isReleased)

    const discography: PlaylistView = {
      id: 'smart-discography',
      title: 'Discography',
      description: 'Every released track.',
      coverUrl: null,
      tracks: released,
      kind: 'smart',
    }

    const covers = released.filter(
      (s) => (s as { compositionType?: string }).compositionType === 'Cover',
    )
    const smartTrail: PlaylistView[] =
      covers.length > 0
        ? [
            {
              id: 'smart-covers',
              title: 'Covers',
              description: 'Reinterpretations of songs by other artists.',
              coverUrl: null,
              tracks: covers,
              kind: 'smart',
            },
          ]
        : []

    const cms: PlaylistView[] = cmsPlaylists.map((playlist) => ({
      id: String(playlist.id),
      title: playlist.title,
      description: playlist.description ?? undefined,
      coverUrl:
        playlist.coverArt &&
        typeof playlist.coverArt === 'object' &&
        'url' in playlist.coverArt
          ? (playlist.coverArt.url ?? null)
          : null,
      tracks: (playlist.tracks || []) as unknown as PlayableMedia[],
      kind: 'cms',
    }))

    return [discography, ...cms, ...smartTrail]
  }, [allSongs, cmsPlaylists])

  const selected = useMemo(
    () => playlists.find((p) => p.id === selectedId) ?? null,
    [playlists, selectedId],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tab Bar */}
      <div className="flex shrink-0 items-center border-b border-border/50">
        <button
          onClick={() => {
            setActiveLibraryTab('playlists')
            setSelectedId(null)
          }}
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
      <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden">
        {activeLibraryTab === 'queue' ? (
          <>
            <div className="flex shrink-0 items-center justify-between border-b border-border/50 px-3 py-2">
              <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {queue.length} in queue
              </span>
              <button
                onClick={shuffleQueue}
                disabled={queue.length <= 1}
                className="flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-foreground/75 uppercase transition-colors hover:text-primary disabled:opacity-40"
                title="Shuffle queue"
              >
                <Shuffle size={14} /> Shuffle
              </button>
            </div>
            <ol className="flex-1 space-y-2 overflow-y-auto p-2">
              {queue.map((song, index) => {
                const isNowPlaying = index === currentSongIndex
                const displaySong =
                  isNowPlaying && currentSong ? currentSong : song
                const coverArtUrl = coverUrlOf(displaySong)

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
          </>
        ) : selected ? (
          /* Playlist detail — preview tracks before committing the queue */
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex shrink-0 items-center gap-2 border-b border-border/50 p-2">
              <button
                onClick={() => setSelectedId(null)}
                aria-label="Back to playlists"
                className="flex size-9 shrink-0 items-center justify-center rounded-md text-foreground/75 transition-colors hover:bg-card/50 hover:text-foreground"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading text-sm font-bold text-foreground">
                  {selected.title}
                </p>
                <p className="text-xs text-foreground/75">
                  {selected.tracks.length} Tracks
                </p>
              </div>
              <button
                onClick={() => playPlaylist(selected.tracks, 0)}
                disabled={selected.tracks.length === 0}
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-primary/50 bg-primary/10 px-3 py-2 font-mono text-[10px] tracking-widest text-primary uppercase transition-colors hover:bg-primary/20 disabled:opacity-40"
              >
                <Play size={14} fill="currentColor" /> Play All
              </button>
            </div>
            <ol className="flex-1 space-y-1 overflow-y-auto p-2">
              {selected.tracks.map((song, index) => {
                const isNowPlaying = currentSong?.youtubeId === song.youtubeId
                const coverArtUrl = coverUrlOf(song)
                return (
                  <li
                    key={`${String(song.id ?? song.youtubeId)}-${index}`}
                    onClick={() => playPlaylist(selected.tracks, index)}
                    className={cn(
                      'flex cursor-pointer items-center gap-3 rounded-md border p-2 transition-colors',
                      isNowPlaying
                        ? 'border-primary/50 bg-primary/20'
                        : 'border-transparent hover:border-border/50 hover:bg-card/50',
                    )}
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded bg-muted/50">
                      {coverArtUrl ? (
                        <Image
                          src={coverArtUrl}
                          alt={`Cover art for ${song?.title ?? ''}`}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-foreground/75">
                          {index + 1}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 overflow-hidden">
                      <p className="truncate text-sm font-bold text-foreground">
                        {song?.title}
                      </p>
                      <p className="truncate text-xs text-foreground/75">
                        {(song as { artist?: string }).artist || ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        ) : (
          /* Playlist list — tapping a playlist opens its track preview */
          <ul className="flex-1 space-y-2 overflow-y-auto p-2">
            {playlists.map((playlist) => (
              <li
                key={playlist.id}
                onClick={() => setSelectedId(playlist.id)}
                className="flex cursor-pointer items-center gap-3 rounded-md border border-border/20 bg-card/20 p-3 transition-all hover:border-border/50 hover:bg-card/50"
              >
                <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-primary/20">
                  {playlist.coverUrl ? (
                    <Image
                      src={playlist.coverUrl}
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
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm font-bold text-foreground">
                    {playlist.title}
                  </p>
                  <p className="text-xs text-foreground/75">
                    {playlist.tracks.length} Tracks
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
