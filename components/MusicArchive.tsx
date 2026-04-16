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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SongCard } from './SongCard'

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
  const [view, setView] = useState<ViewMode>('grid')
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

  //- 1. GRID CARD
  const GridItem = ({ song }: { song: Song }) => {
    return (
      <li className="h-full">
        <SongCard song={song} />
      </li>
    )
  }

  //- 2. LIST ROW
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
      <li className="relative my-0 py-6 pl-8 md:pl-0">
        {/* Center Line (Desktop) */}
        <div className="absolute top-0 bottom-0 left-[0.38rem] -ml-px w-[2px] bg-foreground/50 md:left-1/2 md:block"></div>

        {/* Node Dot */}
        <div
          className={cn(
            'absolute left-0 h-3 w-3 translate-y-6 rounded-full border-2 border-accent bg-background md:left-1/2',
            'md:-ml-[6px]',
          )}
        ></div>

        <div
          className={cn(
            'relative transform transition-all duration-500 hover:-translate-y-1 md:w-1/2',
            isLeft
              ? 'md:ml-0 md:pr-12 md:text-right'
              : 'md:ml-auto md:pl-12 md:text-left',
          )}
        >
          <Link
            href={`/music/${song.slug}`}
            className="group inline-block max-w-lg rounded p-4 hover:border"
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

            <span className="mb-2 block font-mono text-lg font-bold tracking-widest text-primary uppercase">
              {song.releaseDate
                ? new Date(song.releaseDate).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : 'Date Unknown'}
            </span>

            <h3 className="font-heading text-3xl leading-[0.9] font-bold tracking-widest text-foreground uppercase transition-colors group-hover:text-accent">
              {song.title}
            </h3>
            {song.isExplicit && (
              <span className="font-mono text-xs tracking-widest text-red-500/30 uppercase">
                Explicit
              </span>
            )}

            <p
              className={cn(
                'mt-3 font-mono text-sm leading-relaxed text-pretty text-muted-foreground',
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
    <section className="space-y-0">
      {/* CONTROLS TOOLBAR */}
      <div className="space-y-4 rounded-lg border border-border bg-linear-to-b from-secondary to-background p-4">
        {/* Top Row: Search & View Toggles */}
        <div className="flex flex-col items-center justify-between gap-4 sm:items-end lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative w-full min-w-64 flex-auto lg:max-w-1/2">
            <Label htmlFor="music-archive-search" className="sr-only">
              Search songs by title, lyrics, credits, moods, or genres
            </Label>
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 z-10 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="music-archive-search"
              type="search"
              placeholder="Search by title, lyrics, credits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="pl-9"
            />
          </div>
          {/* Filters */}
          <div className="flex flex-col items-center gap-1 sm:flex-row">
            <span
              className="hidden font-mono text-xs text-muted-foreground uppercase sm:block"
              aria-hidden
            >
              Filter:
            </span>

            {/* Composition Type */}
            <div className="flex gap-1">
              <Label htmlFor="music-archive-composition" className="sr-only">
                Composition type
              </Label>
              <Select
                value={filters.composition}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    composition: value as FilterState['composition'],
                  }))
                }
              >
                <SelectTrigger
                  id="music-archive-composition"
                  size="sm"
                  className="w-full min-w-44 text-xs"
                >
                  <SelectValue placeholder="Composition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Composition Types</SelectItem>
                  <SelectItem value="Original">Originals</SelectItem>
                  <SelectItem value="Cover">Covers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recording Type */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="music-archive-recording" className="sr-only">
                Recording type
              </Label>
              <Select
                value={filters.recording}
                onValueChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    recording: value as FilterState['recording'],
                  }))
                }
              >
                <SelectTrigger
                  id="music-archive-recording"
                  size="sm"
                  className="w-full min-w-42 text-xs"
                >
                  <SelectValue placeholder="Recording type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Recording Types</SelectItem>
                  <SelectItem value="Studio">Studio</SelectItem>
                  <SelectItem value="Live">Live</SelectItem>
                  <SelectItem value="Demo">Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Explicit Toggle */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={cn(
                'text-xs',
                filters.explicit === 'hide' &&
                  'text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive',
                filters.explicit === 'show' &&
                  'text-muted-foreground hover:border-primary/50 hover:bg-primary/10 hover:text-primary',
              )}
              aria-pressed={filters.explicit === 'show'}
              aria-label={
                filters.explicit === 'hide'
                  ? 'Show songs marked explicit in results'
                  : 'Hide songs marked explicit from results'
              }
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  explicit: prev.explicit === 'show' ? 'hide' : 'show',
                }))
              }
            >
              {filters.explicit === 'hide' ? 'Show Explicit' : 'Hide Explicit'}
            </Button>
          </div>
        </div>

        {/* Bottom Row: Filters & Sort */}
        <div className="flex flex-col flex-wrap items-center gap-4 border-t border-border/30 pt-4 sm:flex-row">
          {/* View Toggles */}
          <div
            className="flex items-center gap-1 rounded-lg border border-border/30 bg-input p-1"
            role="group"
            aria-label="Library layout"
          >
            <Button
              type="button"
              variant={view === 'timeline' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'timeline'}
              aria-label="Timeline view"
              onClick={() => setView('timeline')}
            >
              <CalendarArrowDown className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'list'}
              aria-label="List view"
              onClick={() => setView('list')}
            >
              <List className="size-4" />
            </Button>
          </div>

          <div className="hidden flex-1 sm:block" />

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown
              size={14}
              className="hidden shrink-0 text-muted-foreground sm:block"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="music-archive-sort" className="sr-only">
                Sort order
              </Label>
              <Select
                value={sort}
                onValueChange={(value) => setSort(value as SortMode)}
              >
                <SelectTrigger
                  id="music-archive-sort"
                  size="sm"
                  className="min-w-40 border-0 bg-transparent text-xs font-semibold tracking-wide uppercase shadow-none focus-visible:ring-offset-0"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="az">A - Z</SelectItem>
                  <SelectItem value="za">Z - A</SelectItem>
                  <SelectItem value="shortest">Shortest</SelectItem>
                  <SelectItem value="longest">Longest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <ol
        className={cn(
          'my-0 min-h-[400px] transition-all duration-500',
          view === 'grid' &&
            'grid auto-rows-fr grid-cols-1 gap-6 pt-4 pb-12 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
          view === 'list' && 'flex flex-col',
          view === 'timeline' && 'relative',
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
