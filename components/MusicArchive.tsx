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
          s.moods.some(
            (m) => typeof m !== 'number' && m.name.toLowerCase().includes(q),
          )
        )
          return true
        if (
          s.genres &&
          s.genres.some(
            (g) => typeof g !== 'number' && g.name.toLowerCase().includes(q),
          )
        )
          return true

        // Credits (Array of objects)
        if (
          s.credits &&
          s.credits.some((c) => c.name.toLowerCase().includes(q))
        )
          return true

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
        return s.compositionType === filters.composition
      })
    }

    // 3. Filter by Recording Type
    if (filters.recording !== 'all') {
      data = data.filter((s) => s.recordingType === filters.recording)
    }

    // 4. Filter by Explicit
    if (filters.explicit === 'hide') {
      data = data.filter((s) => !s.isExplicit)
    }

    // 5. Sort
    data.sort((a, b) => {
      // Helper for duration
      const getDuration = (song: Song) => song.duration ?? 0

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
          href={`/music/${song.slug}`}
          className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary/50 hover:bg-popover"
        >
          <div className="relative aspect-square bg-background">
            {coverUrl ? (
              <Image
                src={coverUrl}
                fill
                alt={song.title}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Disc size={64} />
              </div>
            )}

            {/* Overlay Date */}
            <div className="absolute top-2 right-2 rounded-lg border border-border/50 bg-background px-2 py-1 font-mono text-[10px] text-foreground/75 backdrop-blur">
              {getYear(song.releaseDate)}
            </div>
          </div>
          <div className="p-5">
            <h3 className="truncate font-heading text-lg tracking-wider text-foreground uppercase transition-colors group-hover:text-primary">
              {song.title}
            </h3>
            <p className="mt-1 truncate font-mono text-xs text-card-foreground/75">
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
        href={`/music/${song.slug}`}
        className="group flex items-center gap-6 border-b border-border p-4 transition-colors hover:bg-card"
      >
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border/50 bg-white/5 text-muted-foreground transition-transform duration-500 group-hover:scale-105">
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
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold text-foreground group-hover:text-primary">
            {song.title}
          </h3>
          <p className="truncate font-mono text-xs text-muted-foreground group-hover:text-card-foreground">
            {song.tagline}
          </p>
        </div>
        <div className="hidden text-right md:block">
          <div className="font-mono text-xs text-muted-foreground group-hover:text-card-foreground">
            {song.releaseDate
              ? new Date(song.releaseDate).toLocaleDateString()
              : 'Unreleased'}
          </div>
          <div className="mt-1 text-[10px] tracking-widest text-primary/60 uppercase">
            {song.releaseDate && new Date(song.releaseDate) <= new Date()
              ? 'Released'
              : 'Scheduled'}
          </div>
        </div>
        <ArrowRight
          size={16}
          className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:animate-bounce group-hover:text-primary"
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
        <div className="absolute top-0 bottom-0 left-[0.38rem] -ml-px w-px bg-border/50 md:left-1/2 md:block"></div>

        {/* Node Dot */}
        <div
          className={cn(
            'absolute left-0 h-3 w-3 translate-y-6 rounded-full border-2 border-secondary bg-background md:left-1/2',
            'md:-ml-[6px]',
          )}
        ></div>

        <div
          className={cn(
            'relative transform pt-4 pb-12 transition-all duration-500 hover:-translate-y-1 md:w-1/2',
            isLeft
              ? 'md:ml-0 md:pr-12 md:text-right'
              : 'md:ml-auto md:pl-12 md:text-left',
          )}
        >
          <Link
            href={`/music/${song.slug}`}
            className="group inline-block max-w-lg"
          >
            {/* Artwork Thumbnail */}
            {song.coverArt && (
              <div
                className={cn(
                  'relative mb-6 h-24 w-24 overflow-hidden rounded-sm border border-white/10 bg-muted/10 shadow-2xl',
                  isLeft ? 'md:ml-auto' : 'md:mr-auto',
                )}
              >
                <Image
                  src={(song.coverArt as Media).url!}
                  fill
                  alt={song.title}
                  sizes="96px"
                  className="scale-105 object-cover saturate-[0.67] transition-all duration-500 group-hover:scale-110 group-hover:saturate-100"
                />
              </div>
            )}

            <span className="mb-2 block font-mono text-xs tracking-widest text-primary uppercase">
              {song.releaseDate
                ? new Date(song.releaseDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Date Unknown'}
            </span>

            <h3 className="font-heading text-3xl leading-[0.9] tracking-widest text-foreground uppercase transition-colors group-hover:text-accent">
              {song.title}
            </h3>
            {song.isExplicit && (
              <span className="font-mono text-xs tracking-widest text-red-500/30 uppercase">
                Explicit
              </span>
            )}

            <p
              className={cn(
                'mt-3 font-mono text-sm leading-relaxed text-muted-foreground',
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
      <div className="space-y-4 rounded-lg border border-border/30 bg-input p-4">
        {/* Top Row: Search & View Toggles */}
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="relative max-w-96 min-w-64 flex-auto">
            <Search
              size={16}
              className="absolute top-1/2 left-3 -translate-y-1/2 text-foreground"
            />
            <input
              type="text"
              placeholder="Search by title, lyrics, credits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded border border-border/30 bg-input py-2 pr-4 pl-9 text-sm text-foreground outline-none focus:border-primary"
            />
          </div>

          {/* View Toggles */}
          <div className="flex items-center gap-1 rounded-lg border border-border/30 bg-input p-1">
            <button
              onClick={() => setView('timeline')}
              className={cn(
                'rounded-md border border-transparent p-2 transition-all',
                view === 'timeline'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:border-primary/50 hover:bg-primary/20 hover:text-primary',
              )}
              title="Timeline View"
            >
              <CalendarArrowDown size={16} />
            </button>
            <button
              onClick={() => setView('grid')}
              className={cn(
                'rounded-md border border-transparent p-2 transition-all',
                view === 'grid'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:border-primary/50 hover:bg-primary/20 hover:text-primary',
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'rounded-md border border-transparent p-2 transition-all',
                view === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-primary/75 hover:border-primary/50 hover:bg-primary/20 hover:text-primary',
              )}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Bottom Row: Filters & Sort */}
        <div className="flex flex-wrap items-center gap-4 border-t border-white/5 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground uppercase">
              Filter:
            </span>

            {/* Composition Type */}
            <select
              value={filters.composition}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  composition: e.target.value as FilterState['composition'],
                }))
              }
              className="rounded-md border border-border/50 bg-input p-1 text-xs text-foreground/75 outline-none focus:border-primary"
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
                setFilters((prev) => ({
                  ...prev,
                  recording: e.target.value as FilterState['recording'],
                }))
              }
              className="rounded-md border border-border/50 bg-input p-1 text-xs text-foreground/75 outline-none focus:border-primary"
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
                'rounded-md border p-1 text-xs transition-colors duration-500',
                filters.explicit === 'hide'
                  ? 'border-border/50 bg-input text-muted-foreground hover:border-red-500/50 hover:bg-red-500/20 hover:text-red-200'
                  : 'border-border/50 bg-input text-muted-foreground hover:border-blue-500/50 hover:bg-blue-500/20 hover:text-blue-200',
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
              className="bg-transparent text-xs font-bold text-foreground/80 uppercase outline-none [&>option]:bg-input"
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
          view === 'grid' &&
            'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',
          view === 'list' && 'flex flex-col',
          view === 'timeline' && 'relative pb-8',
        )}
      >
        {filteredSongs.length > 0 ? (
          filteredSongs.map((song, i) => {
            if (view === 'grid') return <GridItem key={song.id} song={song} />
            if (view === 'list') return <ListItem key={song.id} song={song} />
            if (view === 'timeline')
              return <TimelineItem key={song.id} song={song} index={i} />
          })
        ) : (
          <li className="col-span-full rounded-lg border border-dashed border-border py-20 text-center">
            <div className="mb-4 inline-block rounded-full bg-primary p-4 text-primary-foreground">
              <Search size={32} />
            </div>
            <h3 className="font-heading text-xl tracking-widest text-secondary uppercase">
              No Data Found
            </h3>
            <p className="mt-2 text-sm text-foreground/75">
              Adjust search parameters to retrieve logs.
            </p>
          </li>
        )}
      </ol>
    </section>
  )
}
