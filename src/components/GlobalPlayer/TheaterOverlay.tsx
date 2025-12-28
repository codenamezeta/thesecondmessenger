import { useState } from 'react'
import Image from 'next/image'
import {
  ChevronDown,
  Library,
  ThumbsUp,
  Layers,
  PanelLeftClose,
  PanelRightClose,
  PanelLeftOpen,
  PanelRightOpen,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { ViewMode, LeftTab, RightTab } from './types'

interface TheaterOverlayProps {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  activeLeftTab: LeftTab
  setActiveLeftTab: (tab: LeftTab) => void
  activeRightTab: RightTab
  setActiveRightTab: (tab: RightTab) => void
  currentSong: any // Typing as any for now to avoid context issues, but ideally strict typed
  children: React.ReactNode
}

const RIGHT_TABS: RightTab[] = ['lyrics', 'stems', 'bonus']

export const TheaterOverlay = ({
  viewMode,
  setViewMode,
  activeLeftTab,
  setActiveLeftTab,
  activeRightTab,
  setActiveRightTab,
  currentSong,
  children,
}: TheaterOverlayProps) => {
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false)
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false)

  const coverArtUrl =
    typeof currentSong.coverArt === 'object' ? currentSong.coverArt?.url : undefined

  // --- RENDER HELPERS ---
  const renderLeftPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 min-h-[60px]">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveLeftTab('playlists')}
            className={cn(
              'text-xs font-heading uppercase tracking-wider transition-colors',
              activeLeftTab === 'playlists' ? 'text-primary' : 'text-muted hover:text-white',
            )}
          >
            Playlists
          </button>
          <button
            onClick={() => setActiveLeftTab('queue')}
            className={cn(
              'text-xs font-heading uppercase tracking-wider transition-colors',
              activeLeftTab === 'queue' ? 'text-primary' : 'text-muted hover:text-white',
            )}
          >
            Queue
          </button>
        </div>
        <button
          onClick={() => setIsLeftPanelOpen(false)}
          className="text-muted hover:text-white"
          title="Close Panel"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeLeftTab === 'queue' ? (
          <div className="space-y-2">
            <div className="p-3 bg-primary/10 rounded border border-primary/30 cursor-pointer flex items-center gap-3">
              <div className="w-8 h-8 bg-black relative rounded overflow-hidden shrink-0">
                {coverArtUrl && <Image src={coverArtUrl} alt="art" fill className="object-cover" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-white font-bold text-sm truncate">{currentSong.title}</p>
                <p className="text-xs text-primary truncate">Now Playing</p>
              </div>
            </div>
            {/* Mock items */}
            {[1, 2, 3, 4].map((i) => (
              <div
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
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-white/5 border border-white/10 rounded hover:border-primary/50 cursor-pointer transition-all">
              <Library size={20} className="mb-2 text-primary" />
              <p className="font-heading text-lg">Discography</p>
              <p className="text-xs text-muted">All Tracks</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderRightPanel = () => (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Panel Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 min-h-[60px]">
        <button
          onClick={() => setIsRightPanelOpen(false)}
          className="text-muted hover:text-white"
          title="Close Panel"
        >
          <PanelRightClose size={16} />
        </button>
        <div className="flex gap-4">
          {RIGHT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveRightTab(tab)
                setIsRightPanelOpen(false)
              }}
              className={cn(
                'text-xs font-heading uppercase tracking-wider transition-colors',
                activeRightTab === tab ? 'text-primary' : 'text-muted hover:text-white',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        {activeRightTab === 'lyrics' && (
          <pre className="whitespace-pre-wrap font-sans text-sm text-muted">
            {currentSong.lyrics}
          </pre>
        )}
        {activeRightTab === 'stems' && (
          <div className="flex flex-col items-center justify-center text-muted gap-4 h-full">
            <Layers size={48} className="opacity-20" />
            <p className="text-center text-sm">
              Stem Player functionality
              <br />
              is currently under development.
            </p>
          </div>
        )}
        {activeRightTab === 'bonus' && (
          <div className="flex flex-col items-center justify-center text-muted gap-4 h-full">
            <p className="text-center text-sm">
              Wow...
              <br />I guess this song doesn't have any bonus content.
              <br />
              What a shame.
            </p>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <section
      id="media_player_expanded_interface"
      className={cn(
        'fixed transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] z-20 overflow-hidden',
        // THEATER MODE: Full screen (minus nav and bottom bar)
        viewMode === 'theater' &&
          'top-20 left-0 right-0 bottom-20 bg-background/95 backdrop-blur-xl border-t border-white/10 pointer-events-auto flex flex-col md:flex-row',
        // MINI MODE: Bottom right corner
        viewMode === 'mini' &&
          'top-auto left-auto bottom-24 right-4 w-2/5 aspect-video rounded-lg border border-primary/20 shadow-2xl pointer-events-auto bg-black',
        // AUDIO/HIDDEN: Hidden but mounted (for audio playback)
        (viewMode === 'audio' || viewMode === 'hidden') &&
          'top-auto left-auto bottom-0 right-0 w-1 h-1 opacity-0 pointer-events-none',
      )}
    >
      {/* --- LEFT PANEL --- */}
      {/* Only visible in Theater mode. Collapsible. */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out overflow-hidden border-white/10 bg-black/40',
          viewMode === 'theater'
            ? isLeftPanelOpen
              ? 'w-full h-1/3 lg:w-1/4 xl:w-1/6 lg:h-full border-b lg:border-b-0 lg:border-r'
              : 'w-full h-0 lg:w-0 lg:h-full border-none'
            : 'w-0 h-0 border-none', // Hidden in mini/audio
        )}
      >
        {renderLeftPanel()}
      </div>

      {/* --- CENTER STAGE (VIDEO) --- */}
      {/* Overlay Controls (Only visible in Theater Mode) */}
      <div className="flex-1 relative flex flex-col">
        {/* Center stage header row */}
        <div
          className={cn(
            viewMode === 'theater'
              ? 'flex items-center justify-between p-4 border-b border-white/10 bg-black/20 min-h-[60px]'
              : 'hidden',
          )}
        >
          {viewMode === 'theater' && (
            <div className="absolute top-4 h-12 left-4 right-4 flex justify-between items-start pointer-events-none">
              {/* Left Toggle */}
              <div className="pointer-events-auto">
                {!isLeftPanelOpen && (
                  <button
                    onClick={() => setIsLeftPanelOpen(true)}
                    className="p-2 bg-black/60 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                    title="Open Library"
                  >
                    <PanelLeftOpen size={20} />
                  </button>
                )}
              </div>

              {/* Center Collapse Button */}
              <div className="pointer-events-auto">
                <button
                  onClick={() => setViewMode('audio')}
                  className="flex items-center gap-2 px-4 py-2 bg-black/60 hover:bg-white/10 text-white rounded-full backdrop-blur-md border border-white/10 transition-all"
                >
                  <ChevronDown size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Collapse</span>
                </button>
              </div>

              {/* Right Toggle */}
              <div className="pointer-events-auto">
                {!isRightPanelOpen && (
                  <button
                    onClick={() => setIsRightPanelOpen(true)}
                    className="hidden md:block p-2 bg-black/60 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-md transition-all"
                    title="Open Details"
                  >
                    <PanelRightOpen size={20} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        {/* Video Area */}
        <div className="flex-1 relative">{children}</div>
        {/* Center stage footer row (Only on mobile / portrait) */}
        {/* {viewMode === 'theater' && (
          <div
            className={cn(
              viewMode === 'theater'
                ? 'md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-black/20 min-h-[60px]'
                : 'hidden',
            )}
          >
            <button
              onClick={() => setIsRightPanelOpen(true)}
              className="p-2 bg-black/60 hover:bg-primary text-white hover:text-black rounded-full backdrop-blur-md transition-all"
              title="Open Details"
            >
              <PanelRightOpen size={20} />
            </button>
          </div>
        )} */}
      </div>

      {/* --- RIGHT PANEL --- */}
      {/* Only visible in Theater mode. Collapsible. */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out overflow-hidden border-white/10 bg-black/40',
          viewMode === 'theater'
            ? isRightPanelOpen
              ? 'w-full h-2/3 lg:w-1/4 xl:w-1/6 lg:h-full border-t lg:border-t-0 lg:border-l'
              : 'w-full h-16 lg:w-0 lg:h-full border-none'
            : 'w-0 h-0 border-none', // Hidden in mini/audio
        )}
      >
        {renderRightPanel()}
      </div>
    </section>
  )
}
