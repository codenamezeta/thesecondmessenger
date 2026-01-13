import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { PlayableMedia, usePlayer } from '@/context/PlayerContext'
import {
  ChevronDown,
  Library,
  Layers,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'

interface BrowserProps {
  isVideoEnabled: boolean
  toggleVideo: () => void
  miniMode: boolean
  setMiniMode: (mode: boolean) => void
  activeLibraryTab: string
  setActiveLibraryTab: (tab: string) => void
  activeDetailsTab: string
  setActiveDetailsTab: (tab: string) => void
  currentSong: PlayableMedia | null
  children: React.ReactNode
}

export const Browser = ({
  isVideoEnabled,
  toggleVideo,
  miniMode,
  setMiniMode,
  activeLibraryTab,
  setActiveLibraryTab,
  activeDetailsTab,
  setActiveDetailsTab,
  currentSong,
  children,
}: BrowserProps) => {
  const [isLibraryPanelOpen, setIsLibraryPanelOpen] = useState(false)
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false)

  const { queue, currentSongIndex, playPlaylist, allSongs } = usePlayer()
  const [playlists, setPlaylists] = useState<any[]>([])

  const details = useMemo(() => {
    const tabs: string[] = []
    if (!currentSong) return tabs

    tabs.push('about')
    if (currentSong.lyrics) tabs.push('lyrics')
    if (Array.isArray(currentSong.stems) && currentSong.stems.length > 0) tabs.push('stems')
    if (Array.isArray(currentSong.credits) && currentSong.credits.length > 0) tabs.push('credits')

    return tabs
  }, [currentSong])

  const groupedCredits = useMemo(() => {
    if (!currentSong?.credits || !Array.isArray(currentSong.credits)) return null

    const groups: Record<string, any[]> = {}

    currentSong.credits.forEach((credit: any) => {
      const category = credit.category || 'General'
      if (!groups[category]) groups[category] = []
      groups[category].push(credit)
    })

    return groups
  }, [currentSong])

  useEffect(() => {
    if (details.length > 0 && !details.includes(activeDetailsTab)) {
      setActiveDetailsTab(details[0])
    }
  }, [details, activeDetailsTab, setActiveDetailsTab])

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
    <section
      id="media_player_browser"
      className={cn(
        // AUDIO/HIDDEN (Default): Hidden but mounted (for audio playback)
        'opacity-0 translate-y-full container flex flex-col flex-auto border-primary/50 border-0 rounded-xl transition-all duration-700 ease-in-out overflow-hidden bg-transparent backdrop-blur-lg pointer-events-auto',
        // THEATER MODE
        isVideoEnabled && 'opacity-100 translate-y-0 border size-full',
        // MINI MODE: (Bottom right corner)
        miniMode &&
          'flex-none h-72 w-auto mt-auto ml-auto mr-4 mb-4 rounded-lg border border-primary/20 shadow-2xl',
      )}
    >
      {/* Header over all panels */}
      <div className="flex items-center justify-center border-b border-border/50 bg-transparent px-4 py-2 transition-all duration-500 ease-in-out">
        {/* Library Toggle */}
        <button
          onClick={() => setIsLibraryPanelOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1 mr-auto p-[0.5em] text-xs uppercase tracking-wide text-muted-foreground border border-border/50 rounded-md hover:text-primary hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all',
            isLibraryPanelOpen && 'text-primary bg-primary/10 border-primary/20',
          )}
          title="Open Library to view Queue & Playlists"
        >
          {isLibraryPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          {miniMode ? '' : 'Library'}
        </button>

        {/* Collapse Browser Button */}

        <button
          onClick={toggleVideo}
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 ml-2 px-2 py-1 bg-muted/20 text-muted-foreground hover:text-foreground rounded-l-full border border-r border-border/50 transition-all"
        >
          <ChevronDown size={16} />
          <span className="text-[0.67em] font-bold uppercase">
            {miniMode ? 'Audio Only' : 'Close Browser'}
          </span>
        </button>

        {/* Mini Mode Toggle */}
        <button
          onClick={() => setMiniMode(!miniMode)}
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 mr-2 px-2 py-1 bg-muted/20 text-muted-foreground hover:text-foreground rounded-r-full border border-l-0 border-border/50 transition-all"
        >
          <span className="text-[0.67em] font-bold uppercase">
            {miniMode ? 'Theater Mode' : 'Mini Player'}
          </span>
          {miniMode ? (
            <Maximize2 size={12} className="rotate-90" />
          ) : (
            <Minimize2 size={12} className="rotate-90" />
          )}
        </button>

        {/* Details Toggle */}

        <button
          onClick={() => setIsDetailsPanelOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1 ml-auto p-[0.5em] text-xs uppercase tracking-wide text-muted-foreground border border-border/50 rounded-md hover:text-primary hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all',
            isDetailsPanelOpen && 'text-primary bg-primary/10 border-primary/20',
          )}
          title="Open Song Details Panel"
        >
          {miniMode ? '' : 'Details'}
          {isDetailsPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </div>

      {/* A flex container for all the panels. */}
      <div className="flex flex-1 min-h-0 w-full">
        {/* --- LIBRARY PANEL --- */}
        <div
          className={cn(
            'flex flex-col h-full transition-all duration-700 ease-in-out overflow-hidden border-border/50 bg-transparent',
            isLibraryPanelOpen ? 'w-2/5 translate-x-0 min-w-60' : '-translate-x-full w-0 min-w-0',
          )}
        >
          {/* Library Panel Header */}
          <div className="flex items-center justify-around border-b border-border/50 bg-transparent">
            <button
              onClick={() => setActiveLibraryTab('playlists')}
              className={cn(
                'text-xs font-heading uppercase tracking-wider h-12 w-full transition-colors duration-300',
                activeLibraryTab === 'playlists'
                  ? 'text-primary bg-primary/20 border-b-2 border-primary'
                  : 'text-foreground/75 bg-transparent hover:text-foreground hover:bg-primary/10',
              )}
            >
              Playlists
            </button>
            <button
              onClick={() => setActiveLibraryTab('queue')}
              className={cn(
                'text-xs font-heading uppercase tracking-wider h-12 w-full transition-colors duration-300',
                activeLibraryTab === 'queue'
                  ? 'text-primary bg-primary/20 border-b-2 border-primary'
                  : 'text-foreground/75 bg-transparent hover:text-foreground hover:bg-primary/10',
              )}
            >
              Queue
            </button>
          </div>

          {/* Panel Content - Library */}
          <div className="flex-auto overflow-y-auto overflow-x-hidden">
            {activeLibraryTab === 'queue' ? (
              <ol className="space-y-2 p-2">
                {queue.map((song, index) => {
                  const isNowPlaying = index === currentSongIndex
                  // The song object in the queue might be minimal, so we fall back.
                  // For the currently playing song, we use the richer `currentSong` prop from Browser if available.
                  const displaySong = isNowPlaying && currentSong ? currentSong : song

                  const coverArtUrl =
                    displaySong?.coverImage ||
                    (typeof displaySong?.coverArt === 'object'
                      ? displaySong?.coverArt?.url
                      : undefined)

                  return (
                    <li
                      key={`${song.id || song.youtubeId}-${index}`}
                      onClick={() => playPlaylist(queue, index)}
                      className={cn(
                        'p-3 rounded-md border cursor-pointer flex items-center gap-3 transition-all duration-300 ease-in-out',
                        isNowPlaying
                          ? 'bg-primary/20 border-primary/50'
                          : 'bg-transparent hover:bg-card/50 border-border/50 hover:border-border opacity-50 hover:opacity-80 hover:scale-y-105',
                      )}
                    >
                      <div className="size-12 bg-transparent relative rounded-lg overflow-hidden shrink-0">
                        {coverArtUrl ? (
                          <Image
                            src={coverArtUrl}
                            alt={`Cover art for ${displaySong?.title}`}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="size-full bg-muted/75 flex items-center justify-center text-xs text-foreground/75">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        {isNowPlaying && (
                          <p className="text-foreground/75 tracking-widest text-[0.67rem] truncate">
                            Now Playing
                          </p>
                        )}
                        <p className="text-white font-bold font-heading">{displaySong?.title}</p>
                        <p className="text-xs text-foreground/75 truncate">
                          {song.artist
                            ? song.artist
                            : displaySong?.artist
                              ? displaySong.artist
                              : ''}
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
                    className="p-3 rounded-md border border-border/20 hover:border-border/50 bg-card/20 hover:bg-card/50 cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <div className="size-12 bg-primary/20 relative rounded-md overflow-hidden shrink-0">
                      {playlist.coverImage?.url ? (
                        <Image
                          src={playlist.coverImage.url}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="size-full flex items-center justify-center bg-primary/20 text-primary">
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

        {/* --- CENTER STAGE --- */}
        {children}

        {/* --- DETAILS PANEL --- */}
        <div
          id="media_player_details_panel"
          className={cn(
            'flex flex-col h-full transition-all duration-700 ease-in-out overflow-hidden border-border/50 bg-transparent',
            isDetailsPanelOpen ? 'w-2/5 -translate-x-0 min-w-60' : 'translate-x-full w-0 min-w-0',
          )}
        >
          {/* Panel Header */}
          <div className="flex items-baseline w-full justify-around border-b border-border/50 bg-transparent">
            {details.map((tab, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveDetailsTab(tab)
                }}
                className={cn(
                  'size-full py-3 text-xs font-heading uppercase tracking-wider transition-colors cursor-pointer',
                  activeDetailsTab === tab
                    ? 'text-secondary border-b-2 border-secondary bg-secondary/20'
                    : 'text-foreground/75 hover:text-foreground hover:bg-secondary/20',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Panel Content - Details */}
          <div className="flex-auto overflow-y-auto overflow-x-hidden">
            {activeDetailsTab === 'about' && (
              <>
                {currentSong?.about && typeof currentSong.about === 'object' ? (
                  <pre>
                    <RichText
                      data={currentSong.about}
                      className="whitespace-pre-wrap p-3 pb-12 text-sm"
                    />
                  </pre>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/50 p-3 pb-12">
                    {currentSong?.description || 'Sorry, there are no details yet available.'}
                  </pre>
                )}
              </>
            )}
            {activeDetailsTab === 'lyrics' && (
              <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/50 p-3 pb-12">
                {currentSong?.lyrics}
              </pre>
            )}
            {activeDetailsTab === 'stems' && (
              <div className="flex flex-col items-center justify-center text-foreground/50 gap-4 h-full">
                <Layers size={48} className="opacity-50" />
                <p className="text-center text-sm">
                  Stem Player functionality
                  <br />
                  is currently under development.
                </p>
              </div>
            )}
            {activeDetailsTab === 'credits' && (
              <div className="h-full overflow-y-auto">
                {groupedCredits ? (
                  <div className="flex flex-col gap-6 p-4 pb-12">
                    {Object.entries(groupedCredits).map(([category, credits]) => (
                      <div key={category} className="flex flex-col gap-2">
                        <h4 className="text-primary font-heading font-bold uppercase text-xs tracking-widest border-b border-white/10 pb-1 mb-2">
                          {category}
                        </h4>
                        <ul className="flex flex-col gap-3">
                          {credits.map((credit: any) => (
                            <li key={credit.id} className="flex flex-col">
                              <span className="text-foreground font-bold text-sm">
                                {credit.name}
                              </span>
                              <span className="text-xs text-foreground/50">
                                {Array.isArray(credit.roles)
                                  ? credit.roles
                                      .map((r: any) => (typeof r === 'string' ? r : r.role))
                                      .join(', ')
                                  : credit.roles}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-foreground/50 p-3 pb-12">
                    {String(currentSong?.credits || '')}
                  </pre>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
