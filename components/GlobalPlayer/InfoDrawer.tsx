'use client'

import { useMemo, useEffect } from 'react'
import { Layers } from 'lucide-react'
import { type DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'
import RichText from '@/components/RichText'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { SwipeableDrawer } from './ui/SwipeableDrawer'

/** Inner content shared between the desktop Sheet and mobile inline panel */
const InfoContent = () => {
  const {
    currentSong,
    activeInfoTab,
    setActiveInfoTab,
    setIsInfoDrawerOpen,
    setIsLibraryDrawerOpen,
  } = usePlayer()

  const availableTabs = useMemo(() => {
    if (!currentSong) return ['about']
    const tabs: string[] = ['about']
    if ((currentSong as { lyrics?: string }).lyrics) tabs.push('lyrics')
    if (
      Array.isArray((currentSong as { stems?: unknown[] }).stems) &&
      ((currentSong as { stems?: unknown[] }).stems?.length ?? 0) > 0
    )
      tabs.push('stems')
    if (
      Array.isArray((currentSong as { credits?: unknown[] }).credits) &&
      ((currentSong as { credits?: unknown[] }).credits?.length ?? 0) > 0
    )
      tabs.push('credits')
    return tabs
  }, [currentSong])

  // Ensure the active tab is always valid
  useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.includes(activeInfoTab)) {
      setActiveInfoTab(availableTabs[0] ?? 'about')
    }
  }, [availableTabs, activeInfoTab, setActiveInfoTab])

  type SongCredit = {
    id?: string | null
    name: string
    category?: string | null
    roles?: { role?: string | null; id?: string | null }[] | null
  }

  const groupedCredits = useMemo(() => {
    const credits = (currentSong as { credits?: SongCredit[] })?.credits
    if (!credits || !Array.isArray(credits)) return null
    const groups: Record<string, SongCredit[]> = {}
    credits.forEach((credit) => {
      const category: string = credit.category || 'General'
      if (!groups[category]) groups[category] = []
      groups[category].push(credit)
    })
    return groups
  }, [currentSong])

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Tab Bar — always visible so users can tap a tab even when the drawer is closed on mobile */}
      <div className="flex w-full shrink-0 items-baseline border-b border-border/50">
        {availableTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveInfoTab(tab)
              setIsLibraryDrawerOpen(false)
              setIsInfoDrawerOpen(true)
            }}
            className={cn(
              'h-10 w-full cursor-pointer py-2 font-heading text-xs tracking-wider uppercase transition-colors',
              activeInfoTab === tab
                ? 'border-b-2 border-secondary bg-secondary/20 text-muted-foreground'
                : 'text-foreground/75 hover:bg-secondary/20 hover:text-foreground',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        {activeInfoTab === 'about' && (
          <>
            {currentSong &&
            (currentSong as { about?: object }).about &&
            typeof (currentSong as { about?: object }).about === 'object' ? (
              <pre>
                <RichText
                  data={
                    (currentSong as { about: DefaultTypedEditorState }).about
                  }
                  className="p-3 pb-12 text-sm whitespace-pre-wrap"
                />
              </pre>
            ) : (
              <pre className="p-3 pb-12 font-mono text-xs whitespace-pre-wrap text-foreground/50">
                {(currentSong as { description?: string })?.description ||
                  'Sorry, there are no details yet available.'}
              </pre>
            )}
          </>
        )}

        {activeInfoTab === 'lyrics' && (
          <pre className="p-3 pb-12 font-mono text-xs whitespace-pre-wrap text-foreground/50">
            {(currentSong as { lyrics?: string })?.lyrics}
          </pre>
        )}

        {activeInfoTab === 'stems' && (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-foreground/50">
            <Layers size={48} className="opacity-50" />
            <p className="text-center text-sm">
              Stem Player functionality
              <br />
              is currently under development.
            </p>
          </div>
        )}

        {activeInfoTab === 'credits' && (
          <div className="h-full overflow-y-auto">
            {groupedCredits ? (
              <div className="flex flex-col gap-6 p-4 pb-12">
                {Object.entries(groupedCredits).map(([category, credits]) => (
                  <div key={category} className="flex flex-col gap-2">
                    <h4 className="mb-2 border-b border-white/10 pb-1 font-heading text-xs font-bold tracking-widest text-primary uppercase">
                      {category}
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {credits.map((credit) => (
                        <li key={credit.id} className="flex flex-col">
                          <span className="text-sm font-bold text-foreground">
                            {credit.name}
                          </span>
                          <span className="text-xs text-foreground/50">
                            {Array.isArray(credit.roles)
                              ? credit.roles.map((r) => r.role).join(', ')
                              : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <pre className="p-3 pb-12 font-mono text-xs whitespace-pre-wrap text-foreground/50">
                {String((currentSong as { credits?: unknown })?.credits || '')}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Desktop Sheet
// ---------------------------------------------------------------------------

export const InfoDrawerSheet = () => {
  const { isInfoDrawerOpen, setIsInfoDrawerOpen } = usePlayer()

  return (
    <Sheet open={isInfoDrawerOpen} onOpenChange={setIsInfoDrawerOpen}>
      <SheetContent
        side="left"
        className={cn(
          'flex flex-col gap-0 border-l border-border/50 bg-background/90 p-0 backdrop-blur-lg',
          'top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))]',
          'h-[calc(100svh-var(--admin-bar-height,0px)-var(--main-nav-bar-height,0px))]',
        )}
        showCloseButton={true}
      >
        <SheetHeader className="shrink-0 border-b border-border/50 px-4 py-3">
          <SheetTitle className="py-3 font-heading text-sm tracking-widest text-muted-foreground uppercase">
            Info
          </SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1">
          <InfoContent />
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ---------------------------------------------------------------------------
// Mobile inline collapsible panel
// ---------------------------------------------------------------------------

interface InfoDrawerInlineProps {
  className?: string
}

export const InfoDrawerInline = ({ className }: InfoDrawerInlineProps) => {
  const { isInfoDrawerOpen, setIsInfoDrawerOpen } = usePlayer()

  return (
    <div
      className={cn(
        'w-full overflow-hidden border-t border-border/50 transition-[max-height] duration-500 ease-in-out',
        isInfoDrawerOpen ? 'max-h-[40svh]' : 'max-h-10',
        className,
      )}
    >
      {/* Tab bar is always visible even when closed (height is the 2.5rem fallback).
          The drag handle only appears when the drawer is OPEN — otherwise it
          would consume the small 40px closed-state area and crop the tab bar. */}
      <div className="h-[40svh] bg-background/75 backdrop-blur-sm">
        <SwipeableDrawer
          onClose={() => setIsInfoDrawerOpen(false)}
          showHandle={isInfoDrawerOpen}
        >
          <InfoContent />
        </SwipeableDrawer>
      </div>
    </div>
  )
}
