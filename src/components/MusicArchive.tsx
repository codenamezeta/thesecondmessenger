'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutGrid,
  List,
  CalendarArrowDown,
  Search,
  ArrowUpDown,
  Disc,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song, Media } from '@/payload-types'

type ViewMode = 'grid' | 'list' | 'timeline'
type SortMode = 'newest' | 'oldest' | 'az' | 'za' | 'shortest' | 'longest'

type FilterState = {
  composition: 'all' | 'Original' | 'Cover' | 'Public Domain'
  recording: 'all' | 'Studio' | 'Live' | 'Demo'
  explicit: 'show' | 'hide'
}

interface MusicArchiveProps {
  initialSongs: Song[]
}

export const MusicArchive = ({ initialSongs }: MusicArchiveProps) => {
  const [view, setView] = useState<ViewMode>('timeline')
  const [sort, setSort] = useState<SortMode>('newest')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    composition: 'all',
    recording: 'all',
    explicit: 'show',
  })

  // --- FILTER & SORT LOGIC ---
  const filteredSongs = useMemo(() => {
    let data = [...initialSongs]

    // 1. Filter by Search (Deep Search)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter((s) => {
        // Basic Fields
        if (s.title.toLowerCase().includes(q)) return true
        if (s.tagline && s.tagline.toLowerCase().includes(q)) return true

        // Extended Fields
        if (s.lyrics && s.lyrics.toLowerCase().includes(q)) return true
        if (
          s.moods &&
          s.moods.some((m) => typeof m !== 'number' && m.name.toLowerCase().includes(q))
        )
          return true
        if (
          s.genres &&
          s.genres.some((g) => typeof g !== 'number' && g.name.toLowerCase().includes(q))
        )
          return true

        // Credits (Array of objects)
        if (s.credits && s.credits.some((c) => c.name.toLowerCase().includes(q))) return true

        return false
      })
    }

    // 2. Filter by Composition Type
    if (filters.composition !== 'all') {
      data = data.filter((s) => {
        // Accessing nested field safely?
        // Payload types might be tricky if not fully generated or if `classification` is in a tab.
        // Based on Songs.ts, `compositionType` is inside a collapsible "Classification".
        // Usually, top-level tabs flatten fields, but collapsibles might not unless name='classification' is set on the collapsible itself.
        // Looking at Songs.ts: The collapsible has NO name, so fields are at ROOT level of the doc.
        // Wait, let's verify Songs.ts structure.
        // Tab 2 -> Collapsible "Classification" -> Row -> compositionType
        // Collapsible has NO name. Row has NO name.
        // So `compositionType` is a direct property of `s`.
        return (s as any).compositionType === filters.composition
      })
    }

    // 3. Filter by Recording Type
    if (filters.recording !== 'all') {
      data = data.filter((s) => (s as any).recordingType === filters.recording)
    }

    // 4. Filter by Explicit
    if (filters.explicit === 'hide') {
      data = data.filter((s) => !(s as any).isExplicit)
    }

    // 5. Sort
    data.sort((a, b) => {
      // Helper for duration
      const getDuration = (song: Song) => (song as any).duration || 0

      switch (sort) {
        case 'az':
          return a.title.localeCompare(b.title)
        case 'za':
          return b.title.localeCompare(a.title)
        case 'shortest':
          return getDuration(a) - getDuration(b)
        case 'longest':
          return getDuration(b) - getDuration(a)
        case 'oldest': {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          return dateA - dateB
        }
        case 'newest':
        default: {
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0
          return dateB - dateA
        }
      }
    })

    return data
  }, [initialSongs, search, sort, filters])

  // --- HELPER: Safe Date Year ---
  const getYear = (dateStr?: string | null) => {
    if (!dateStr) return '----'
    return new Date(dateStr).getFullYear()
  }

  // 1. GRID CARD
  const GridItem = ({ song }: { song: Song }) => {
    // Handle coverArt being Media object or ID or null
    const coverUrl = (song.coverArt as Media)?.url

    return (
      <li>
        <Link
          href={`/songs/${song.slug}`}
          className="group block bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all hover:bg-popover"
        >
          <div className="aspect-square relative bg-background">
            {coverUrl ? (
              <Image
                src={coverUrl}
                fill
                alt={song.title}
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Disc size={64} />
              </div>
            )}

            {/* Overlay Date */}
            <div className="absolute top-2 right-2 bg-background backdrop-blur border border-border/50 px-2 py-1 text-[10px] font-mono text-foreground/75 rounded-lg">
              {getYear(song.releaseDate)}
            </div>
          </div>
          <div className="p-5">
            <h3 className="text-lg font-heading text-foreground uppercase tracking-wider group-hover:text-primary transition-colors truncate">
              {song.title}
            </h3>
            <p className="text-xs text-card-foreground/75 font-mono mt-1 truncate">
              {song.tagline || 'Encrypted Audio File'}
            </p>
          </div>
        </Link>
      </li>
    )
  }

  // 2. LIST ROW
  const ListItem = ({ song }: { song: Song }) => (
    <li>
      <Link
        href={`/songs/${song.slug}`}
        className="group flex items-center gap-6 p-4 border-b border-border hover:bg-card transition-colors"
      >
        <div className="w-16 h-16 bg-white/5 rounded-md shrink-0 flex items-center justify-center border border-border/50 text-muted-foreground overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
          {(song.coverArt as Media)?.url ? (
            <Image
              src={(song.coverArt as Media).url!}
              fill
              alt={song.title}
              className="object-cover"
            />
          ) : (
            <Disc size={24} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary truncate">
            {song.title}
          </h3>
          <p className="text-xs text-muted-foreground group-hover:text-card-foreground font-mono truncate">
            {song.tagline}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="text-xs font-mono text-muted-foreground group-hover:text-card-foreground">
            {song.releaseDate ? new Date(song.releaseDate).toLocaleDateString() : 'Unreleased'}
          </div>
          <div className="text-[10px] text-primary/60 uppercase tracking-widest mt-1">
            {song.releaseDate && new Date(song.releaseDate) <= new Date()
              ? 'Released'
              : 'Scheduled'}
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-muted-foreground group-hover:text-primary group-hover:animate-bounce transition-transform group-hover:translate-x-1"
        />
      </Link>
    </li>
  )

  // 3. TIMELINE NODE
  const TimelineItem = ({ song, index }: { song: Song; index: number }) => {
    const isLeft = index % 2 === 0
    return (
      <li className="relative pl-8 md:pl-0">
        {/* Center Line (Desktop) */}
        <div className="left-[0.38rem] md:block absolute md:left-1/2 top-0 bottom-0 w-px bg-border/50 -ml-px"></div>

        {/* Node Dot */}
        <div
          className={cn(
            'absolute left-0 md:left-1/2 w-3 h-3 rounded-full border-2 border-secondary bg-background translate-y-6',
            'md:-ml-[6px]',
          )}
        ></div>

        <div
          className={cn(
            'md:w-1/2 pb-12 pt-4 relative transform transition-all duration-500 hover:-translate-y-1',
            isLeft ? 'md:pr-12 md:text-right md:ml-0' : 'md:pl-12 md:ml-auto md:text-left',
          )}
        >
          <Link href={`/songs/${song.slug}`} className="group inline-block max-w-lg">
            {/* Artwork Thumbnail */}
            {song.coverArt && (
              <div
                className={cn(
                  'relative w-24 h-24 mb-6 bg-muted/10 border border-white/10 rounded-sm overflow-hidden shadow-2xl',
                  isLeft ? 'md:ml-auto' : 'md:mr-auto',
                )}
              >
                <Image
                  src={(song.coverArt as Media).url!}
                  fill
                  alt={song.title}
                  sizes="96px"
                  className="object-cover saturate-[0.67] group-hover:saturate-100 transition-all duration-500 scale-105 group-hover:scale-110"
                />
              </div>
            )}

            <span className="font-mono text-xs text-primary mb-2 block tracking-widest uppercase">
              {song.releaseDate
                ? new Date(song.releaseDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Date Unknown'}
            </span>

            <h3 className="text-3xl font-heading text-foreground uppercase tracking-widest group-hover:text-accent transition-colors leading-[0.9]">
              {song.title}
            </h3>
            {song.isExplicit && (
              <span className="text-xs text-red-500/30 font-mono uppercase tracking-widest">
                Explicit
              </span>
            )}

            <p
              className={cn(
                'text-sm text-muted-foreground mt-3 font-mono leading-relaxed',
                isLeft ? 'ml-auto' : 'mr-auto',
              )}
            >
              {song.tagline}
            </p>
          </Link>
        </div>
      </li>
    )
  }

  // --- RENDER ---
  return (
    <section className="space-y-8">
      {/* CONTROLS TOOLBAR */}
      <div className="bg-input p-4 rounded-lg border border-border/30 space-y-4">
        {/* Top Row: Search & View Toggles */}
        <div className="flex flex-row gap-4 items-center justify-between flex-wrap">
          {/* Search */}
          <div className="relative min-w-64 flex-auto max-w-96">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground"
            />
            <input
              type="text"
              placeholder="Search by title, lyrics, credits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-input border border-border/30 rounded pl-9 pr-4 py-2 text-sm text-foreground focus:border-primary outline-none"
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center bg-input rounded-lg border border-border/30 gap-1 p-1">
            <button
              onClick={() => setView('timeline')}
              className={cn(
                'p-2 rounded-md transition-all border border-transparent',
                view === 'timeline'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:bg-primary/20 hover:text-primary hover:border-primary/50',
              )}
              title="Timeline View"
            >
              <CalendarArrowDown size={16} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn(
                'p-2 rounded-md transition-all border border-transparent',
                view === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:bg-primary/20 hover:text-primary hover:border-primary/50',
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'p-2 rounded-md transition-all border border-transparent',
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:bg-primary/20 hover:text-primary hover:border-primary/50',
              )}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground uppercase">Filter:</span>

            {/* Composition Type */}
            <select
              value={filters.composition}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, composition: e.target.value as any }))
              }
              className="bg-input border border-border/50 rounded-md p-1 text-xs text-foreground/75 outline-none focus:border-primary"
            >
              <option value="all">All Composition Types</option>
              <option value="Original">Originals</option>
              <option value="Cover">Covers</option>
              {/* <option value="Public Domain">Public Domain</option> */}
            </select>

            {/* Recording Type */}
            <select
              value={filters.recording}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, recording: e.target.value as any }))
              }
              className="bg-input border border-border/50 rounded-md p-1 text-xs text-foreground/75 outline-none focus:border-primary"
            >
              <option value="all">All Recording Types</option>
              <option value="Studio">Studio</option>
              <option value="Live">Live</option>
              <option value="Demo">Demo</option>
            </select>

            {/* Explicit Toggle */}
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  explicit: prev.explicit === 'show' ? 'hide' : 'show',
                }))
              }
              className={cn(
                'p-1 rounded-md text-xs border transition-colors duration-500',
                filters.explicit === 'hide'
                  ? 'bg-input text-muted-foreground border-border/50 hover:bg-red-500/20 hover:text-red-200 hover:border-red-500/50'
                  : 'bg-input text-muted-foreground border-border/50 hover:bg-blue-500/20 hover:text-blue-200 hover:border-blue-500/50',
              )}
            >
              {filters.explicit === 'hide' ? 'Show Explicit' : 'Hide Explicit'}
            </button>
          </div>

          <div className="flex-1" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-foreground/80" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortMode)}
              className="bg-transparent text-xs uppercase font-bold text-foreground/80 outline-none [&>option]:bg-input"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="az">A - Z</option>
              <option value="za">Z - A</option>
              <option value="shortest">Shortest</option>
              <option value="longest">Longest</option>
            </select>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <ol
        className={cn(
          'min-h-[400px] transition-all duration-500',
          view === 'grid' && 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          view === 'list' && 'flex flex-col',
          view === 'timeline' && 'relative pb-8',
        )}
      >
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song, i) => {
            if (view === 'grid') return <GridItem key={song.id} song={song} />
            if (view === 'list') return <ListItem key={song.id} song={song} />
            if (view === 'timeline') return <TimelineItem key={song.id} song={song} index={i} />
          })
        ) : (
          <li className="col-span-full py-20 text-center border border-border rounded-lg border-dashed">
            <div className="inline-block p-4 bg-primary rounded-full mb-4 text-primary-foreground">
              <Search size={32} />
            </div>
            <h3 className="text-xl text-secondary font-heading uppercase tracking-widest">
              No Data Found
            </h3>
            <p className="text-foreground/75 text-sm mt-2">
              Adjust search parameters to retrieve logs.
            </p>
          </li>
        )}
      </ol>
    </section>
  )
}
