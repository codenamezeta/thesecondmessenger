import { useState } from 'react'
import Image from 'next/image'
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

const DETAILS_TABS_TEMP: string[] = ['about', 'lyrics', 'stems', 'credits']

export type LibraryTab = 'playlists' | 'queue'
export type DetailsTab = 'about' | 'lyrics' | 'stems' | 'credits'

interface BrowserProps {
  isVideoEnabled: boolean
  toggleVideo: () => void
  miniMode: boolean
  setMiniMode: (mode: boolean) => void
  activeLibraryTab: LibraryTab
  setActiveLibraryTab: (tab: LibraryTab) => void
  activeDetailsTab: DetailsTab
  setActiveDetailsTab: (tab: DetailsTab) => void
  currentSong: any // Typing as any for now to avoid context issues, but ideally strict typed
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

  const coverArtUrl =
    typeof currentSong.coverArt === 'object' ? currentSong.coverArt?.url : undefined

  return (
    <section
      id="media_player_browser"
      className={cn(
        // AUDIO/HIDDEN (Default): Hidden but mounted (for audio playback)
        'opacity-0 translate-y-full w-full container h-full flex flex-col flex-auto border border-accent rounded transition-all duration-700 ease-in-out overflow-hidden bg-black/50 backdrop-blur-lg pointer-events-auto',
        // THEATER MODE
        isVideoEnabled && 'translate-y-0 opacity-100',
        // MINI MODE: (Bottom right corner)
        miniMode &&
          'flex-none h-72 w-auto mt-auto ml-auto mr-4 mb-4 rounded border border-primary/20 shadow-2xl',
      )}
    >
      {/* Header over all panels */}
      <div className="flex items-center justify-center border-b border-white/10 bg-black/20 px-4 py-2 transition-all duration-500 ease-in-out">
        {/* Library Toggle */}
        <button
          onClick={() => setIsLibraryPanelOpen((prev) => !prev)}
          className={cn(
            'flex items-center gap-1 mr-auto p-2 text-xs text-muted bg-black rounded backdrop-blur-md border border-white/10 hover:scale-105 transition-all',
            isLibraryPanelOpen ? 'hover:text-secondary' : 'hover:text-primary',
          )}
          title="Open Library to view Queue & Playlists"
        >
          {isLibraryPanelOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          {miniMode ? '' : isLibraryPanelOpen ? 'Close Library' : 'Library'}
        </button>

        {/* Collapse Browser Button */}

        <button
          onClick={toggleVideo}
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 ml-2 px-2 py-1 bg-black/60 hover:bg-white/10 text-muted hover:text-white rounded-l-full backdrop-blur-md border border-r border-white/10 transition-all"
        >
          <ChevronDown size={16} />
          <span className="text-[0.67em] font-bold uppercase">Close Browser</span>
        </button>

        {/* Mini Mode Toggle */}
        <button
          onClick={() => setMiniMode((prev) => !prev)}
          className="hidden sm:flex items-center justify-center w-32 truncate gap-1 mr-2 px-2 py-1 bg-black/60 hover:bg-white/10 text-muted hover:text-white rounded-r-full backdrop-blur-md border border-l-0 border-white/10 transition-all"
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
            'flex items-center gap-1 ml-auto p-2 text-xs text-muted bg-black rounded backdrop-blur-md border border-white/10 hover:scale-105 transition-all',
            isDetailsPanelOpen ? 'hover:text-secondary' : 'hover:text-primary',
          )}
          title="Open Song Details Panel"
        >
          {miniMode ? '' : isDetailsPanelOpen ? 'Close Panel' : 'Details'}
          {isDetailsPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
        </button>
      </div>

      {/* A flex container for all the panels. */}
      <div className="flex flex-1 min-h-0 w-full">
        {/* --- LIBRARY PANEL --- */}
        <div
          className={cn(
            'flex flex-col h-full transition-all duration-700 ease-in-out overflow-hidden border-white/10 bg-black/40',
            isLibraryPanelOpen ? 'w-2/5 translate-x-0 min-w-52' : '-translate-x-full w-0 min-w-0',
          )}
        >
          {/* Library Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveLibraryTab('playlists')}
                className={cn(
                  'text-xs font-heading uppercase tracking-wider transition-colors',
                  activeLibraryTab === 'playlists' ? 'text-primary' : 'text-muted hover:text-white',
                )}
              >
                Playlists
              </button>
              <button
                onClick={() => setActiveLibraryTab('queue')}
                className={cn(
                  'text-xs font-heading uppercase tracking-wider transition-colors',
                  activeLibraryTab === 'queue' ? 'text-primary' : 'text-muted hover:text-white',
                )}
              >
                Queue
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-auto overflow-y-auto overflow-x-hidden">
            {activeLibraryTab === 'queue' ? (
              <ol className="space-y-2">
                <li className="p-3 bg-primary/10 rounded border border-primary/30 cursor-pointer flex items-center gap-3">
                  <div className="w-8 h-8 bg-black relative rounded overflow-hidden shrink-0">
                    {coverArtUrl && (
                      <Image
                        src={coverArtUrl}
                        alt="art"
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-white font-bold text-sm truncate">{currentSong.title}</p>
                    <p className="text-xs text-primary truncate">Now Playing</p>
                  </div>
                </li>
                {/* Mock items for now */}
                {[1, 2, 3, 4].map((i) => (
                  <li
                    key={i}
                    className="p-3 hover:bg-white/5 rounded border border-transparent hover:border-white/10 cursor-pointer transition-colors opacity-60 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 bg-black/50 rounded flex items-center justify-center text-xs text-muted shrink-0">
                      {i}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-white font-bold text-sm truncate">Upcoming Track {i}</p>
                      <p className="text-xs text-muted truncate">The Second Messenger</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-4">
                <li
                  onClick={() => setActiveLibraryTab('queue')}
                  className="p-4 bg-white/5 border border-white/10 rounded hover:border-primary/50 cursor-pointer transition-all"
                >
                  <Library size={20} className="mb-2 text-primary" />
                  <p className="font-heading text-lg">Discography</p>
                  <p className="text-xs text-muted">All Tracks</p>
                </li>
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
            isDetailsPanelOpen ? 'w-2/5 -translate-x-0 min-w-52' : 'translate-x-full w-0 min-w-0',
          )}
        >
          {/* Panel Header */}
          <div className="flex items-baseline w-full justify-around py-4 border-b border-white/10 bg-black/20">
            {DETAILS_TABS_TEMP.map((tab, i) => (
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

          {/* Panel Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {activeDetailsTab === 'lyrics' && (
              <pre className="whitespace-pre-wrap font-mono text-xs text-muted p-3 pb-12">
                {currentSong.lyrics}
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
              <div className="flex flex-col items-center justify-center text-muted gap-4 h-full">
                <p className="text-center text-sm">
                  Wow...
                  <br />I guess this song doesn't have any credits.
                  <br />
                  What a shame.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
