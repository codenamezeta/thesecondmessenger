'use client'

import { useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, useReducedMotion } from 'motion/react'
import {
  Play,
  Pause,
  Disc,
  Activity,
  Clock,
  Music2,
  Gauge,
  AlertCircle,
  Radio,
  Mic2,
  Headphones,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song, Media } from '@/payload-types'
import { getSongTagField, getTagNames } from '@/lib/songs/tagFields'
import { chipCategory, pickCardTagGroups } from '@/lib/songs/pickCardChips'
import { buildCardFragment } from '@/lib/songs/cardFragment'
import { getCardRarity, type RarityVariant } from '@/lib/songs/cardRarity'
import { tempoMarkingForBpm } from '@/lib/songs/tempoDescriptor'
import { songHrefFromArchive, tagLandingHref } from '@/lib/music/filterState'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'
import DecryptedText from '@/components/DecryptedText'
import { normalizeMediaUrlForImage } from '@/utilities/getMediaUrl'

interface SongCardProps {
  song: Song
  className?: string
  /** Serialized `/music` filter query — preserved for archive return navigation. */
  archiveQuery?: string
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

/** Single-letter recording-type code for the catalog number. */
function recordingCode(t: Song['recordingType']): string {
  switch (t) {
    case 'Studio':
      return 'S'
    case 'Live':
      return 'L'
    case 'Demo':
      return 'D'
    case 'Other':
      return 'X'
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
  'from-primary/20 via-accent/20 to-transparent',
  'from-special/50 via-special/25 to-transparent',
  'from-primary/20 via-chart-4/20 to-transparent',
  'from-primary/30 via-chart-5/25 to-transparent',
] as const

/** Gem accent color (CSS var) by rarity variant/tier. Gem-only, no labels. */
function gemColorFor(variant: RarityVariant, tier: string): string {
  if (variant === 'vault') return 'var(--color-special)'
  if (variant === 'deluxe') return 'var(--color-primary)'
  if (tier === 'holo') return 'var(--color-primary)'
  if (tier === 'rare') return 'var(--color-accent)'
  return 'var(--color-muted-foreground)'
}

/** A single quantitative stat cell in the spec strip. */
function StatCell({
  Icon,
  value,
  label,
  hasModifier,
  title,
}: {
  Icon: LucideIcon
  value: string
  label: string
  hasModifier?: boolean
  title?: string
}) {
  return (
    <div
      className="relative flex flex-col items-center justify-center gap-0.5 bg-card/80 p-2"
      title={title}
    >
      {hasModifier ? (
        <span
          className="absolute top-1 right-1 font-mono text-[9px] leading-none text-primary"
          aria-hidden
        >
          ⇄
        </span>
      ) : null}
      <Icon className="size-2.5 text-muted-foreground" aria-hidden />
      <span className="w-full truncate text-center font-mono text-[10px] font-bold text-foreground">
        {value}
      </span>
      <span className="font-mono text-[7px] tracking-wider text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  )
}

export const SongCard = ({ song, className, archiveQuery }: SongCardProps) => {
  const router = useRouter()
  const { playMedia, isPlaying, currentSong } = usePlayer()
  const prefersReducedMotion = useReducedMotion()

  const tiltRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number | null>(null)
  const interactiveRef = useRef(false)

  // Pointer tilt + foil tracking only on fine pointers without a
  // reduced-motion preference. Checked once on mount.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const fine = window.matchMedia('(pointer: fine)').matches
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    interactiveRef.current = fine && !reduce
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!interactiveRef.current) return
    const el = tiltRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const maxTilt = 6
      el.style.setProperty('--rx', `${(px - 0.5) * 2 * maxTilt}deg`)
      el.style.setProperty('--ry', `${-(py - 0.5) * 2 * maxTilt}deg`)
      el.style.setProperty('--mx', `${(px * 100).toFixed(2)}%`)
      el.style.setProperty('--my', `${(py * 100).toFixed(2)}%`)
      el.style.setProperty('--pointer', '1')
    })
  }, [])

  const resetTilt = useCallback(() => {
    const el = tiltRef.current
    if (!el) return
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--mx', '50%')
    el.style.setProperty('--my', '0%')
    el.style.setProperty('--pointer', '0')
  }, [])

  const coverUrl = normalizeMediaUrlForImage((song.coverArt as Media)?.url)
  const releaseYear = song.releaseDate
    ? new Date(song.releaseDate).getFullYear()
    : '----'
  const isCurrent = isPlaying && currentSong?.id === song.id
  const href = song.slug ? songHrefFromArchive(song.slug, archiveQuery) : null

  const subGenre =
    getTagNames(getSongTagField(song, 'subGenres'))[0] ??
    getTagNames(getSongTagField(song, 'genres'))[0] ??
    'Unclassified'

  const rarity = getCardRarity(song)
  const showGem = rarity.level >= 1
  const gemColor = gemColorFor(rarity.variant, rarity.tier)

  // Labeled tag groups ("Mood", "Sounds like", "Great for", "About",
  // "Also") — each heading tells the listener what its chips mean, so the
  // tags carry the description instead of duplicating a prose line.
  const tagGroups = pickCardTagGroups(song)
  const fragment = buildCardFragment(song)

  const duration = song.duration
    ? `${Math.floor(song.duration / 60)}:${Math.round(song.duration % 60)
        .toString()
        .padStart(2, '0')}`
    : '--:--'
  const tempo = tempoMarkingForBpm(song.bpm)

  const catalogSeq = (song.catalogSequence ?? song.id)
    .toString()
    .padStart(3, '0')
  const serialNumber = `TSM-${releaseYear}-${compositionAbbrev(song.compositionType)}-${catalogSeq}-${recordingCode(song.recordingType)}`
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
  const entranceDelay = (fnv1a32(song.title) % 26) / 100

  const bars = barcodeHeights(barcodeSource(song), 32)

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playMedia(song)
  }

  const cardSurface = (
    <div
      className={cn(
        'relative flex h-full flex-col overflow-hidden rounded-lg border-t border-r-2 border-b-2 border-l-2 border-border border-r-border/50 border-b-border/60 border-l-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-500 ease-out',
        'group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_20px_50px_-20px] group-hover:shadow-primary/25',
        rarity.level >= 1 && 'border-t-primary/40',
        rarity.level >= 2 && 'shadow-[0_0_0_1px] shadow-primary/10',
        isCurrent && 'tsm-now-playing border-primary/60',
      )}
    >
      {/* Deterministic ambient plane (tempo / key / recording identity) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        aria-hidden
      >
        <div
          className={cn(
            'absolute inset-[-40%] bg-linear-to-br mix-blend-soft-light',
            accentGradient,
          )}
          style={{ transform: `rotate(${foilSkewDeg}deg)` }}
        />
        {/* Top specular wash — strength scales with rarity */}
        <div
          className="absolute inset-0"
          style={{
            opacity: 0.05 + rarity.level * 0.04,
            background: `radial-gradient(ellipse at ${20 + (meshPhase % 55)}% 0%, color-mix(in oklch, var(--color-primary) 14%, transparent) 0%, transparent 58%)`,
          }}
        />
        {/* Film grain — feTurbulence + mix-blend-overlay; subtle on busy foil */}
        <div
          className="absolute inset-0 opacity-20 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.11' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.04 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Pointer-reactive holographic foil — holo + secret tiers only */}
      {rarity.isFoil ? (
        <div
          className="tsm-card-foil pointer-events-none absolute inset-0 z-20 rounded-lg"
          data-variant={rarity.variant}
          aria-hidden
        />
      ) : null}

      {/* Specular band — only sweeps into view on group-hover */}
      <div
        className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-sm"
        aria-hidden
      >
        <div className="absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-foreground/12 to-transparent opacity-100 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />
      </div>

      {/* Full-bleed texture under art + data */}
      <div className="absolute inset-0 bg-transparent">
        {/* Blueprint grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in oklch, var(--primary) 50%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 50%, transparent) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
            opacity: 0.12,
          }}
        />
        {/* Horizontal scanlines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.20) 3px, rgba(0,0,0,0.20) 4px)',
          }}
        />
      </div>

      {/* Art frame */}
      <div className="relative aspect-square w-full bg-transparent">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt=""
            fill
            className={cn(
              'object-cover transition-all duration-700 ease-out',
              isCurrent
                ? 'scale-[1.03] opacity-100 saturate-125'
                : 'opacity-90 group-hover:scale-[1.04] group-hover:opacity-100',
            )}
            style={{
              transform:
                'translate(calc((var(--mx, 50%) - 50%) * -0.05), calc((var(--my, 0%) - 50%) * -0.05))',
            }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/25">
            <Disc size={64} strokeWidth={1} aria-hidden />
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-background/90 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-background/95 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-linear-to-r from-background/50 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-2 bg-linear-to-l from-background/75 to-transparent" />

        <div className="absolute inset-0 z-30 flex items-center justify-center">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handlePlay}
            aria-label={isCurrent ? 'Pause' : `Play ${song.title}`}
            className={cn(
              'size-12 min-h-12 min-w-12 rounded-full border-primary/60 bg-background/90 text-primary shadow-lg transition-all duration-300',
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

        <div className="absolute top-2 right-2 left-2 z-30 flex items-start justify-between gap-2">
          <div className="rounded-sm border border-border/80 bg-background/85 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-muted-foreground uppercase">
            <DecryptedText
              text={serialNumber}
              animateOn="view"
              sequential
              revealDirection="start"
              speed={28}
              useOriginalCharsOnly={false}
              characters="ABCDEF0123456789-"
              className="text-muted-foreground"
              encryptedClassName="text-primary/60"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {showGem ? (
              <span
                className={cn(
                  'block size-2 rotate-45 rounded-[1px] border border-foreground/30',
                  rarity.isFoil && 'tsm-card-gem-foil',
                )}
                style={{
                  backgroundColor: gemColor,
                  boxShadow: `0 0 6px ${gemColor}`,
                }}
                aria-hidden
              />
            ) : null}
            <div
              className={cn(
                'flex items-center gap-0.5 rounded-sm border px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest uppercase',
                rec.chipClass,
              )}
            >
              <RecIcon className="size-2.5 shrink-0 opacity-90" aria-hidden />
              {rec.label}
            </div>
            {song.isExplicit ? (
              <div className="flex items-center gap-0.5 rounded-sm border border-destructive/40 bg-destructive/25 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
                <AlertCircle className="size-2.5" aria-hidden />
                EXP
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Data panel */}
      <div className="relative z-40 flex flex-1 flex-col bg-linear-to-b from-card to-transparent px-4">
        {/* Scanlines local to the data panel */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
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
                'mt-3 mb-1 font-heading text-lg leading-tight tracking-wide text-pretty uppercase transition-colors md:text-xl',
                isCurrent
                  ? 'glitch-text-2 text-primary drop-shadow-[0_0_12px_var(--color-primary)]'
                  : 'text-foreground group-hover:text-primary',
              )}
            >
              {song.title}
            </h3>

            <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <span className="text-primary/90">{subGenre}</span>
              <span className="text-border" aria-hidden>
                |
              </span>
              <span>{song.compositionType}</span>
            </div>

            {song.tagline ? (
              <p className="line-clamp-2 border-l-2 border-accent/50 pl-2 font-body text-xs leading-snug text-muted-foreground italic">
                {song.tagline}
              </p>
            ) : fragment ? (
              <p
                className="line-clamp-2 border-l-2 border-border/60 pl-2 font-mono text-[10px] leading-snug tracking-wide text-muted-foreground/80"
                aria-label="Tag-derived summary"
              >
                {fragment}
              </p>
            ) : null}
          </div>

          {/* Quantitative spec strip */}
          <div className="mt-auto grid grid-cols-4 gap-px overflow-hidden rounded-sm border border-border/80 bg-border/40">
            <StatCell
              Icon={Activity}
              value={song.bpm ? String(song.bpm) : '--'}
              label="BPM"
              hasModifier={Boolean(song.changesTempo)}
              title={
                song.changesTempo && song.bpm && song.bpmEnd
                  ? `Tempo shifts ${song.bpm} → ${song.bpmEnd} BPM`
                  : undefined
              }
            />
            <StatCell
              Icon={Music2}
              value={song.key || '—'}
              label="Key"
              hasModifier={Boolean(song.changesKey)}
              title={
                song.changesKey && song.key && song.keyEnd
                  ? `Key shifts ${song.key} → ${song.keyEnd}`
                  : undefined
              }
            />
            <StatCell
              Icon={Gauge}
              value={tempo?.label ?? '—'}
              label="Tempo"
              title={
                tempo && song.bpm
                  ? `${song.bpm} BPM — ${tempo.feel}`
                  : undefined
              }
            />
            <StatCell Icon={Clock} value={duration} label="Time" />
          </div>

          {tagGroups.length > 0 ? (
            <div className="flex flex-col gap-1.5 pt-0.5">
              {tagGroups.map((group) => {
                const HeadingIcon = group.icon
                return (
                  <div
                    key={group.field}
                    className="flex flex-wrap items-center gap-x-1.5 gap-y-1"
                  >
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[9px] font-semibold tracking-widest text-muted-foreground/70 uppercase">
                      <HeadingIcon
                        className="size-2.5 shrink-0 text-muted-foreground/55"
                        aria-hidden
                      />
                      {group.label}
                    </span>
                    {group.chips.map((tag) => {
                      const filterHref = tag.slug
                        ? tagLandingHref(chipCategory(tag), tag.slug)
                        : null
                      const tagLabel = `${group.label}: ${tag.text}`
                      return (
                        <button
                          key={`${tag.field}-${tag.tagId}`}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            if (filterHref) router.push(filterHref)
                          }}
                          aria-label={
                            filterHref
                              ? `Browse ${tagLabel} tag archive`
                              : tagLabel
                          }
                          disabled={!filterHref}
                          className={cn(
                            'rounded-sm border border-border/60 bg-muted/20 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-foreground/80 uppercase transition-colors',
                            filterHref &&
                              'cursor-pointer hover:border-primary/60 hover:bg-primary/15 hover:text-primary',
                            'group-hover:border-primary/35',
                          )}
                        >
                          {tag.text}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ) : null}

          <div className="flex-1" />
          <div className="mt-1 flex items-end justify-between gap-3 border-t border-border/50 pt-1">
            <div
              className="flex h-4 min-w-0 flex-1 items-end gap-px"
              role="img"
              aria-label={
                isCurrent
                  ? 'Now playing — animated level meter'
                  : song.isrc
                    ? `Barcode pattern derived from ISRC ${song.isrc}`
                    : 'Catalog barcode pattern'
              }
            >
              {bars.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-0.5 min-w-px bg-foreground/35 transition-[height,background-color] duration-300 group-hover:bg-primary/50',
                    isCurrent && 'tsm-eq-bar bg-primary/70',
                  )}
                  style={{
                    height: `calc(${h}% + 5px)`,
                    animationDelay: isCurrent ? `${(i % 8) * 90}ms` : undefined,
                  }}
                />
              ))}
            </div>
            <div className="shrink-0 pb-1 text-right font-mono text-[7px] leading-tight tracking-widest text-muted-foreground uppercase">
              {song.isrc ? (
                <>
                  <span className="block opacity-70">ISRC</span>
                  <span className="block text-foreground/80">
                    <DecryptedText
                      text={song.isrc}
                      animateOn="view"
                      sequential
                      revealDirection="end"
                      speed={26}
                      characters="ABCDEF0123456789"
                      className="text-foreground/80"
                      encryptedClassName="text-primary/50"
                    />
                  </span>
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
    'group relative block h-full bg-transparent [perspective:1100px] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    !href && 'cursor-default',
    className,
  )

  const tilt = (
    <div
      ref={tiltRef}
      className="tsm-card-tilt h-full"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetTilt}
    >
      {cardSurface}
    </div>
  )

  const inner = href ? (
    <Link href={href} className={shellClass}>
      <span className="sr-only">Open song page: {song.title}</span>
      {tilt}
    </Link>
  ) : (
    <div className={shellClass} role="group" aria-label={song.title}>
      {tilt}
    </div>
  )

  return (
    <motion.div
      className="h-full"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -8% 0px' }}
      transition={{
        duration: 0.5,
        delay: entranceDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {inner}
    </motion.div>
  )
}
