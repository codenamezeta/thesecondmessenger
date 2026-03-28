'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Pause,
  Disc,
  Activity,
  Clock,
  Zap,
  Music2,
  Globe,
  AlertCircle,
  Radio,
  Mic2,
  Headphones,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song, Media, Tag } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'

interface SongCardProps {
  song: Song
  className?: string
}

const getTagName = (
  tag: string | number | Tag | null | undefined,
): string | null => {
  if (!tag) return null
  if (typeof tag === 'string' || typeof tag === 'number') return null
  return tag.name || null
}

/** FNV-1a 32-bit — deterministic fingerprint for visuals (SSR-safe). */
function fnv1a32(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function barcodeSource(song: Song): string {
  const fromIsrc = song.isrc?.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  if (fromIsrc && fromIsrc.length >= 4) return fromIsrc
  const slug = typeof song.slug === 'string' ? song.slug : ''
  return `TSM${song.id}${slug}`.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function barcodeHeights(source: string, count: number): number[] {
  if (!source.length) {
    return Array.from({ length: count }, () => 40)
  }
  const expanded =
    source.length < count
      ? source.repeat(Math.ceil(count / source.length))
      : source
  const out: number[] = []
  for (let i = 0; i < count; i++) {
    const a = expanded.charCodeAt(i % expanded.length)
    const b = expanded.charCodeAt((i + 11) % expanded.length)
    const c = expanded.charCodeAt((i + 23) % expanded.length)
    // 22–100% bar height, stable per index + source
    const mix = (a * 31 + b * 17 + c + i * 13) % 79
    out.push(22 + mix)
  }
  return out
}

function compositionAbbrev(t: Song['compositionType']): string {
  switch (t) {
    case 'Original':
      return 'ORG'
    case 'Cover':
      return 'CVR'
    case 'Public Domain':
      return 'PD'
    case 'Remix':
      return 'RMX'
    case 'Arrangement':
      return 'ARR'
    case 'Derivative Work':
      return 'DRV'
    case 'Interpolation':
      return 'INT'
    case 'Mashup':
      return 'MSH'
    case 'Sample':
      return 'SMP'
    case 'Other':
      return 'OTH'
    default: {
      const _exhaustive: never = t
      return _exhaustive
    }
  }
}

function recordingTypePresentation(t: Song['recordingType']): {
  label: string
  chipClass: string
  Icon: typeof Mic2
} {
  switch (t) {
    case 'Studio':
      return {
        label: 'STUDIO',
        chipClass: 'border-border/80 bg-background/40 text-muted-foreground',
        Icon: Headphones,
      }
    case 'Live':
      return {
        label: 'LIVE',
        chipClass: 'border-chart-2/40 bg-chart-2/10 text-chart-2',
        Icon: Mic2,
      }
    case 'Demo':
      return {
        label: 'DEMO',
        chipClass:
          'border-muted-foreground/25 bg-muted/30 text-muted-foreground',
        Icon: Radio,
      }
    case 'Other':
      return {
        label: 'REC',
        chipClass: 'border-border/80 bg-background/40 text-muted-foreground',
        Icon: Disc,
      }
    default: {
      const _exhaustive: never = t
      return _exhaustive
    }
  }
}

const CHART_ACCENT = [
  'from-primary/25 via-chart-1/15 to-transparent',
  'from-primary/20 via-chart-2/20 to-transparent',
  'from-primary/22 via-chart-3/18 to-transparent',
  'from-primary/20 via-chart-4/18 to-transparent',
  'from-primary/18 via-chart-5/22 to-transparent',
] as const

export const SongCard = ({ song, className }: SongCardProps) => {
  const { playMedia, isPlaying, currentSong } = usePlayer()

  const coverUrl = (song.coverArt as Media)?.url
  const releaseYear = song.releaseDate
    ? new Date(song.releaseDate).getFullYear()
    : '----'
  const isCurrent = isPlaying && currentSong?.id === song.id
  const href = song.slug ? `/music/${song.slug}` : null

  const genre = song.genres?.[0] ? getTagName(song.genres[0]) : 'Unclassified'

  const moodTags = song.moods
    ?.slice(0, 3)
    .map(getTagName)
    .filter(Boolean) as string[]
  const themeTags = song.themes
    ?.slice(0, 3)
    .map(getTagName)
    .filter(Boolean) as string[]

  const allFlavorTags = [
    ...(moodTags || []).map((t) => ({
      text: t,
      icon: Zap,
      color: 'text-chart-1',
    })),
    ...(themeTags || []).map((t) => ({
      text: t,
      icon: Globe,
      color: 'text-chart-2',
    })),
  ].slice(0, 6)

  const duration = song.duration
    ? `${Math.floor(song.duration / 60)}:${Math.round(song.duration % 60)
        .toString()
        .padStart(2, '0')}`
    : '--:--'

  const serialNumber = `LOG-${releaseYear}-${compositionAbbrev(song.compositionType)}-${song.id.toString().padStart(3, '0')}`
  const rec = recordingTypePresentation(song.recordingType)
  const RecIcon = rec.Icon

  const identityKey = [
    song.isrc ?? '',
    song.key ?? '',
    song.bpm ?? '',
    song.recordingType,
    song.compositionType,
    String(song.duration ?? ''),
  ].join('|')
  const accentIdx = fnv1a32(identityKey) % CHART_ACCENT.length
  const accentGradient = CHART_ACCENT[accentIdx]
  const foilSkewDeg = (fnv1a32(song.title + identityKey) % 7) - 3
  const meshPhase = fnv1a32(barcodeSource(song)) % 360

  const bars = barcodeHeights(barcodeSource(song), 32)

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playMedia(song)
  }

  const cardSurface = (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-lg border border-border/60 bg-card/30 shadow-sm backdrop-blur-md transition-[transform,box-shadow,border-color] duration-500 ease-out',
        'group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_20px_50px_-20px] group-hover:shadow-primary/25',
        isCurrent && 'border-primary/50 shadow-[0_0_0_1px] shadow-primary/20',
      )}
    >
      {/* Deterministic ambient plane (tempo / key / recording identity) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      >
        <div
          className={cn(
            'absolute -inset-[40%] bg-linear-to-br mix-blend-soft-light',
            accentGradient,
          )}
          style={{ transform: `rotate(${foilSkewDeg}deg)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            background: `radial-gradient(ellipse at ${20 + (meshPhase % 55)}% 0%, color-mix(in oklch, var(--color-primary) 14%, transparent) 0%, transparent 58%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.11' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Specular sweep — premium hover */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-sm"
        aria-hidden
      >
        <div className="absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-foreground/10 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />
      </div>

      {/* Art frame */}
      <div
        className={cn(
          'relative z-10 aspect-square w-full border-b border-border/80 bg-muted/40 transition-colors duration-500 group-hover:border-primary/25',
        )}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              isCurrent
                ? 'scale-105 opacity-50 saturate-75'
                : 'opacity-95 group-hover:scale-[1.04] group-hover:opacity-100',
            )}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Disc size={64} strokeWidth={1} aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-background/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/95 to-transparent" />

        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handlePlay}
            aria-label={isCurrent ? 'Pause' : `Play ${song.title}`}
            className={cn(
              'size-12 min-h-12 min-w-12 rounded-full border-primary/60 bg-background/85 text-primary shadow-lg backdrop-blur-sm transition-all duration-300',
              'max-sm:scale-100 max-sm:opacity-95 sm:scale-90 sm:opacity-0 sm:group-hover:scale-100 sm:group-hover:opacity-100',
              'hover:bg-primary hover:text-primary-foreground hover:shadow-primary/30',
              'focus-visible:scale-100 focus-visible:opacity-100 active:scale-95',
              isCurrent &&
                'scale-100 border-primary bg-primary text-primary-foreground opacity-100 shadow-primary/40 sm:opacity-100',
            )}
          >
            {isCurrent ? (
              <Pause className="size-6" fill="currentColor" aria-hidden />
            ) : (
              <Play className="ml-0.5 size-6" fill="currentColor" aria-hidden />
            )}
          </Button>
        </div>

        <div className="absolute top-2 right-2 left-2 z-20 flex items-start justify-between gap-2">
          <div className="rounded-sm border border-border/80 bg-background/70 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase backdrop-blur-md">
            {serialNumber}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase backdrop-blur-md',
                rec.chipClass,
              )}
            >
              <RecIcon className="size-2.5 shrink-0 opacity-90" aria-hidden />
              {rec.label}
            </div>
            {song.isExplicit ? (
              <div className="flex items-center gap-0.5 rounded-sm border border-destructive/40 bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive backdrop-blur-md">
                <AlertCircle className="size-2.5" aria-hidden />
                EXP
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Data panel */}
      <div className="relative z-10 flex flex-1 flex-col bg-linear-to-b from-card/90 to-card/50 px-4">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              var(--color-border) 2px,
              var(--color-border) 3px
            )`,
          }}
          aria-hidden
        />

        <div className="relative z-10 flex h-full flex-1 flex-col gap-3">
          <div>
            <h3
              className={cn(
                'mt-3 mb-1 truncate font-heading text-lg leading-tight tracking-wide uppercase transition-colors md:text-xl',
                isCurrent
                  ? 'text-primary drop-shadow-[0_0_12px_var(--color-primary)]'
                  : 'text-foreground group-hover:text-primary',
              )}
            >
              {song.title}
            </h3>

            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <span className="text-primary/90">{genre}</span>
              <span className="text-border" aria-hidden>
                |
              </span>
              <span>{song.compositionType}</span>
            </div>

            {song.tagline ? (
              <p className="line-clamp-2 border-l-2 border-border pl-2 font-body text-xs leading-snug text-muted-foreground italic">
                &quot;{song.tagline}&quot;
              </p>
            ) : null}
          </div>

          <div className="mt-auto grid grid-cols-3 gap-px overflow-hidden rounded-sm border border-border/80 bg-border/40">
            <div className="flex flex-col items-center justify-center gap-0.5 bg-card/80 p-2">
              <Activity
                className="size-2.5 text-muted-foreground"
                aria-hidden
              />
              <span className="font-mono text-[10px] font-bold text-foreground">
                {song.bpm ?? '--'}
              </span>
              <span className="font-mono text-[7px] tracking-wider text-muted-foreground uppercase">
                BPM
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 border-x border-border/30 bg-card/80 p-2">
              <Music2 className="size-2.5 text-muted-foreground" aria-hidden />
              <span className="w-full truncate text-center font-mono text-[10px] font-bold text-foreground">
                {song.key || '—'}
              </span>
              <span className="font-mono text-[7px] tracking-wider text-muted-foreground uppercase">
                Key
              </span>
            </div>
            <div className="flex flex-col items-center justify-center gap-0.5 bg-card/80 p-2">
              <Clock className="size-2.5 text-muted-foreground" aria-hidden />
              <span className="font-mono text-[10px] font-bold text-foreground">
                {duration}
              </span>
              <span className="font-mono text-[7px] tracking-wider text-muted-foreground uppercase">
                Time
              </span>
            </div>
          </div>

          {allFlavorTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {allFlavorTags.map((tag, i) => (
                <div
                  key={`${tag.text}-${i}`}
                  className="flex items-center gap-1 rounded-sm border border-border/60 bg-muted/20 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground uppercase transition-colors group-hover:border-primary/35"
                >
                  <tag.icon className={cn('size-2.5', tag.color)} aria-hidden />
                  {tag.text}
                </div>
              ))}
            </div>
          ) : null}
          <div className="flex-1" />
          <div className="mt-1 flex items-end justify-between gap-3 border-t border-border/50 pt-1">
            <div
              className="flex h-4 min-w-0 flex-1 items-end gap-px"
              role="img"
              aria-label={
                song.isrc
                  ? `Barcode pattern derived from ISRC ${song.isrc}`
                  : 'Catalog barcode pattern'
              }
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="bar w-0.5 min-w-px bg-foreground/35 transition-[height,background-color] duration-300 group-hover:bg-primary/50"
                  style={{ height: `calc(${h}% + 5px)` }}
                />
              ))}
            </div>
            <div className="shrink-0 pb-1 text-right font-mono text-[7px] leading-tight tracking-widest text-muted-foreground uppercase">
              {song.isrc ? (
                <>
                  <span className="block text-foreground/80">{song.isrc}</span>
                  <span className="opacity-70">ISRC</span>
                </>
              ) : (
                <span className="opacity-70">No ISRC</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const shellClass = cn(
    'group relative block h-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    !href && 'cursor-default',
    className,
  )

  if (href) {
    return (
      <Link href={href} className={shellClass}>
        <span className="sr-only">Open song page: {song.title}</span>
        {cardSurface}
      </Link>
    )
  }

  return (
    <div className={shellClass} role="group" aria-label={song.title}>
      {cardSurface}
    </div>
  )
}
