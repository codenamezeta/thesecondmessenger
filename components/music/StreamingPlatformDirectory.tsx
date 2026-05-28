'use client'

import { useMemo, useState } from 'react'
import { Radio } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getAllPlatforms,
  sortPlatforms,
  SORT_MODE_DESCRIPTIONS,
  SORT_MODE_LABELS,
  type SortMode,
} from '@/lib/platforms'
import { PlatformDirectoryRow } from '@/components/music/PlatformLinkTile'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SORT_MODES: SortMode[] = [
  'Optimized',
  'Support',
  'Popularity',
  'Alphabetical',
]

export function StreamingPlatformDirectory() {
  const [sortMode, setSortMode] = useState<SortMode>('Optimized')

  const platforms = useMemo(
    () => sortPlatforms(getAllPlatforms(), sortMode),
    [sortMode],
  )

  return (
    <section
      className="w-full space-y-6 py-6"
      aria-labelledby="streaming-directory-heading"
    >
      <div className="flex container flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
            {'// External playback nodes'}
          </p>
          <h2
            id="streaming-directory-heading"
            className="font-heading text-2xl font-bold tracking-tight text-foreground uppercase sm:text-3xl"
          >
            Listen Everywhere
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Prefer our player or Bandcamp when you can — every link below still
            routes to an official profile. Sort to match how you discover music.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <Label
            htmlFor="platform-sort"
            className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
          >
            Sort
          </Label>
          <Select
            value={sortMode}
            onValueChange={(value) => setSortMode(value as SortMode)}
          >
            <SelectTrigger
              id="platform-sort"
              className="w-full min-w-[200px] rounded-none border-border/60 bg-background/40 sm:w-[220px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {SORT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {SORT_MODE_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="font-mono text-[10px] text-muted-foreground">
            {SORT_MODE_DESCRIPTIONS[sortMode]}
          </p>
        </div>
      </div>

      <div
        className="flex container flex-wrap gap-2 sm:hidden"
        role="tablist"
        aria-label="Sort platforms"
      >
        {SORT_MODES.map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={sortMode === mode}
            onClick={() => setSortMode(mode)}
            className={cn(
              'min-h-10 rounded-none border px-3 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors',
              sortMode === mode
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 bg-background/30 text-muted-foreground hover:border-primary/30',
            )}
          >
            {SORT_MODE_LABELS[mode]}
          </button>
        ))}
      </div>

      <ol className="grid container grid-cols-1 gap-4 lg:grid-cols-2">
        {platforms.map((platform) => (
          <li key={platform.id}>
            <PlatformDirectoryRow
              config={platform}
              trailing={
                <span className="hidden font-mono text-[10px] tracking-widest text-muted-foreground uppercase sm:inline">
                  {platform.payoutTier}
                </span>
              }
            />
          </li>
        ))}
      </ol>

      <p className="flex container items-start gap-2 border-l border-primary/30 pl-4 font-mono text-[10px] leading-relaxed tracking-wide text-muted-foreground uppercase">
        <Radio size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden />
        Native playback and Bandcamp send the most support back to the artist.
        Major streaming services are included for convenience.
      </p>
    </section>
  )
}
