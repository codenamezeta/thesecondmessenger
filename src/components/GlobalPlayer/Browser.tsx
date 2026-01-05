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
        'opacity-0 translate-y-full w-full container h-full flex flex-col flex-auto border border-white/20 rounded-xl transition-all duration-700 ease-in-out overflow-hidden bg-main/50 backdrop-blur-lg pointer-events-auto',
        // THEATER MODE
        isVideoEnabled && 'translate-y-0 opacity-100',
        // MINI MODE: (Bottom right corner)
        miniMode &&
          'flex-none h-72 w-auto mt-auto ml-auto mr-4 mb-4 rounded border border-primary/20 shadow-2xl',
      )}
    >
      {/* Header over all panels */}
      <div className="flex items-center justify-center border-b border-white/10 bg-main/50 px-4 py-2 transition-all duration-500 ease-in-out">
        {/* Library Toggle */}
        <button
          onClick={() => setIsLibraryPanelOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1 mr-auto p-[0.5em] text-xs uppercase tracking-wide text-muted border border-white/10 rounded hover:text-primary hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all',
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
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 ml-2 px-2 py-1 bg-card/60 hover:bg-white/10 text-muted hover:text-white rounded-l-full backdrop-blur-md border border-r border-white/10 transition-all"
        >
          <ChevronDown size={16} />
          <span className="text-[0.67em] font-bold uppercase">
            {miniMode ? 'Audio Only' : 'Close Browser'}
          </span>
        </button>

        {/* Mini Mode Toggle */}
        <button
          onClick={() => setMiniMode(!miniMode)}
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 mr-2 px-2 py-1 bg-card/60 hover:bg-white/10 text-muted hover:text-white rounded-r-full backdrop-blur-md border border-l-0 border-white/10 transition-all"
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
            'flex items-center gap-1 ml-auto p-[0.5em] text-xs uppercase tracking-wide text-muted border border-white/10 rounded hover:text-primary hover:bg-primary/10 hover:border-primary/50 hover:scale-105 transition-all',
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
            'flex flex-col h-full transition-all duration-700 ease-in-out overflow-hidden border-white/10 bg-black/40',
            isLibraryPanelOpen ? 'w-2/5 translate-x-0 min-w-60' : '-translate-x-full w-0 min-w-0',
          )}
        >
          {/* Library Panel Header */}
          <div className="flex items-center justify-around border-b border-white/10 bg-black/20">
            <button
              onClick={() => setActiveLibraryTab('playlists')}
              className={cn(
                'text-xs font-heading uppercase tracking-wider h-12 w-full transition-colors duration-300',
                activeLibraryTab === 'playlists'
                  ? 'text-primary bg-primary/20 border-b-2 border-primary'
                  : 'text-muted hover:text-white hover:bg-primary/10',
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
                  : 'text-muted hover:text-white hover:bg-primary/10',
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
                        'p-3 rounded border cursor-pointer flex items-center gap-3 transition-all duration-300 ease-in-out',
                        isNowPlaying
                          ? 'bg-primary/10 border-primary/20'
                          : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/20 opacity-60 hover:opacity-80 hover:scale-y-110',
                      )}
                    >
                      <div className="w-8 h-8 bg-black relative rounded overflow-hidden shrink-0">
                        {coverArtUrl ? (
                          <Image
                            src={coverArtUrl}
                            alt={`Cover art for ${displaySong?.title}`}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        ) : (
                          <div className="w-full h-full bg-black/50 flex items-center justify-center text-xs text-muted">
                            {index + 1}
                          </div>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        {isNowPlaying && (
                          <p className="text-muted tracking-widest text-xs truncate">Now Playing</p>
                        )}
                        <p className="text-white font-bold font-heading truncate">
                          {displaySong?.title}
                        </p>
                        <p className="text-xs text-muted truncate">
                          {song.artist
                            ? song.artist
                            : displaySong?.artist
                              ? displaySong.artist
                              : 'YouTube'}
                        </p>
                      </div>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <ul className="space-y-2 p-2">
                <li
                  onClick={() => playPlaylist(allSongs, 0)}
                  className="p-3 rounded border border-transparent hover:border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-all"
                >
                  <div className="w-12 h-12 bg-black relative rounded overflow-hidden shrink-0 flex items-center justify-center bg-primary/20 text-primary">
                    <Library size={24} />
                  </div>
                  <div>
                    <p className="font-heading text-sm font-bold text-white">Discography</p>
                    <p className="text-xs text-muted">All Tracks</p>
                  </div>
                </li>
                {playlists.map((playlist) => (
                  <li
                    key={playlist.id}
                    onClick={() => playPlaylist(playlist.tracks || [], 0)}
                    className="p-3 rounded border border-transparent hover:border-white/20 bg-white/5 hover:bg-white/10 cursor-pointer flex items-center gap-3 transition-all"
                  >
                    <div className="w-12 h-12 bg-black relative rounded overflow-hidden shrink-0">
                      {playlist.coverImage?.url ? (
                        <Image
                          src={playlist.coverImage.url}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                          <Library size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-heading text-sm font-bold text-white">{playlist.title}</p>
                      <p className="text-xs text-muted">{playlist.tracks?.length || 0} Tracks</p>
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
            'flex flex-col h-full transition-all duration-700 ease-in-out overflow-hidden border-white/10 bg-black/40',
            isDetailsPanelOpen ? 'w-2/5 -translate-x-0 min-w-60' : 'translate-x-full w-0 min-w-0',
          )}
        >
          {/* Panel Header */}
          <div className="flex items-baseline w-full justify-around py-4 border-b border-white/10 bg-black/20">
            {details.map((tab, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveDetailsTab(tab)
                }}
                className={cn(
                  'text-xs font-heading uppercase tracking-wider transition-colors',
                  activeDetailsTab === tab ? 'text-secondary' : 'text-muted hover:text-white',
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
                  <RichText data={currentSong.about} className="p-3 pb-12 text-sm" enableProse />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-xs text-muted p-3 pb-12">
                    {currentSong?.description || 'Sorry, there are no details yet available.'}
                  </pre>
                )}
              </>
            )}
            {activeDetailsTab === 'lyrics' && (
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted p-3 pb-12">
                {currentSong?.lyrics}
              </pre>
            )}
            {activeDetailsTab === 'stems' && (
              <div className="flex flex-col items-center justify-center text-muted gap-4 h-full">
                <Layers size={48} className="opacity-20" />
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
                              <span className="text-white font-bold text-sm">{credit.name}</span>
                              <span className="text-xs text-muted">
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
                  <pre className="whitespace-pre-wrap font-mono text-xs text-muted p-3 pb-12">
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
