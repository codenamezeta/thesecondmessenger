'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
  Play,
  Pause,
  Disc,
  Activity,
  Clock,
  // FileAudio,
  Zap,
  Music2,
  // Fingerprint,
  // Hash,
  Globe,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song, Media, Tag } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'

interface SongCardProps {
  song: Song
  className?: string
}

// Helper: Handle the relationship data safely
const getTagName = (
  tag: string | number | Tag | null | undefined,
): string | null => {
  if (!tag) return null
  if (typeof tag === 'string' || typeof tag === 'number') return null
  return tag.name || null
}

// Format duration from seconds to MM:SS
const formatTime = (seconds?: number | null) => {
  if (!seconds) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
    .toString()
    .padStart(2, '0')
  return `${m}:${s}`
}

export const SongCard = ({ song, className }: SongCardProps) => {
  const { playMedia, isPlaying, currentSong } = usePlayer()

  const coverUrl = (song.coverArt as Media)?.url
  const releaseYear = song.releaseDate
    ? new Date(song.releaseDate).getFullYear()
    : '----'
  const isCurrent = isPlaying && currentSong?.id === song.id

  // --- DATA EXTRACTION ---
  // Stat Block Leaders
  const genre = song.genres?.[0] ? getTagName(song.genres[0]) : 'Unclassified'

  // Flavor Tags: Get up to 3 of each
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
      color: 'text-yellow-500/70',
    })),
    ...(themeTags || []).map((t) => ({
      text: t,
      icon: Globe,
      color: 'text-blue-500/70',
    })),
  ].slice(0, 6) // Max 6 total tags to prevent overflow

  // Format Duration (MM:SS)
  const duration = song.duration
    ? `${Math.floor(song.duration / 60)}:${Math.round(song.duration % 60)
        .toString()
        .padStart(2, '0')}`
    : '--:--'

  // "Serial Number" Construction: LOG-[YEAR]-[TYPE]-[ID]
  const serialNumber = `LOG-${releaseYear}-${song.compositionType === 'Original' ? 'ORG' : 'CVR'}-${song.id.toString().padStart(3, '0')}`

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    playMedia(song)
  }

  return (
    <div
      className={cn(
        'group relative overflow-visible bg-transparent transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(var(--primary-rgb),0.3)]',
        className,
      )}
    >
      {/* --- 1. THE OUTER FRAME (Borders & Corners) --- */}
      <div className="pointer-events-none absolute inset-0 z-20 border border-white/10 transition-colors duration-500 group-hover:border-primary/50">
        {/* Tech Corners */}
        <div className="absolute top-0 left-0 h-2 w-2 border-t border-l border-white/40 transition-colors group-hover:border-primary" />
        <div className="absolute top-0 right-0 h-2 w-2 border-t border-r border-white/40 transition-colors group-hover:border-primary" />
        <div className="absolute bottom-0 left-0 h-2 w-2 border-b border-l border-white/40 transition-colors group-hover:border-primary" />
        <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-white/40 transition-colors group-hover:border-primary" />
      </div>

      {/* --- 2. THE HOLO FOIL & TEXTURE --- */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden mix-blend-screen">
        {/* Sparse Particle Texture using SVG filter */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogIDxmaWx0ZXIgaWQ9Im4iPgogICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMTIiIG51bU9jdGF2ZXM9IjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+CiAgICA8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAxICAwIDAgMCAwIDEgIDAgMCAwIDAgMSAgMCAwIDAgMTAwIC04MCIgLz4KICA8L2ZpbHRlcj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuNiIgLz4KPC9zdmc+')]" />
      </div>

      {/* Shine Effect */}
      <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
        <div
          className="absolute inset-0 -translate-x-[150%] bg-gradient-to-tr from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%]"
          style={{ width: '200%' }}
        />
      </div>

      {/* --- 3. MAIN CARD CONTENT --- */}
      <Link
        href={`/songs/${song.slug}`}
        className="relative z-10 flex h-full flex-col overflow-hidden bg-card/20 backdrop-blur-sm"
      >
        {/* --- IMAGE SECTION (The Viewscreen) --- */}
        <div className="relative aspect-square w-full border-b border-white/10 bg-black/50 transition-colors group-hover:border-primary/30">
          {/* Cover Art */}
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={song.title}
              fill
              className={cn(
                'object-cover mix-blend-normal transition-all duration-700',
                isCurrent
                  ? 'scale-105 opacity-40 grayscale'
                  : 'opacity-90 group-hover:scale-105 group-hover:opacity-100',
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/20">
              <Disc size={64} strokeWidth={1} />
            </div>
          )}

          {/* Viewscreen HUD Overlays */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
            <button
              onClick={handlePlay}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full border border-primary bg-black/80 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)] backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:bg-primary hover:text-black',
                isCurrent && 'bg-primary text-black opacity-100',
              )}
            >
              {isCurrent ? (
                <Pause size={24} fill="currentColor" />
              ) : (
                <Play size={24} fill="currentColor" className="ml-1" />
              )}
            </button>
          </div>

          {/* Top Badges */}
          <div className="absolute top-2 right-2 left-2 z-20 flex justify-between">
            <div className="rounded-sm border border-white/10 bg-black/60 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-widest text-white/70 uppercase backdrop-blur-md">
              {serialNumber}
            </div>
            {song.isExplicit && (
              <div className="flex items-center gap-1 rounded-sm border border-red-500/50 bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-500 backdrop-blur-md">
                <AlertCircle size={8} /> EXP
              </div>
            )}
          </div>
        </div>

        {/* --- DATA BLOCK (The Stats) --- */}
        <div className="relative flex flex-1 flex-col bg-gradient-to-b from-black/80 to-black/40 p-4">
          {/* Scanline Texture */}
          <div className="pointer-events-none absolute inset-0 bg-[url('/imgs/scanlines.png')] bg-[length:4px_4px] opacity-5" />

          <div className="relative z-10 flex h-full flex-col gap-3">
            {/* 1. Header: Title & Type */}
            <div>
              <h3
                className={cn(
                  'font-heading mb-1 truncate text-lg leading-tight tracking-wide uppercase transition-colors',
                  isCurrent
                    ? 'text-shadow-glow text-primary'
                    : 'text-white group-hover:text-primary',
                )}
              >
                {song.title}
              </h3>

              <div className="mb-1.5 flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                <span className="text-primary/80">{genre}</span>
                <span className="text-white/20">|</span>
                <span>{song.compositionType}</span>
              </div>

              {/* TAGLINE */}
              {song.tagline && (
                <p className="line-clamp-2 border-l-2 border-white/10 pl-2 font-serif text-xs leading-snug text-muted-foreground italic">
                  &quot;{song.tagline}&quot;
                </p>
              )}
            </div>

            {/* 2. The "Tech Grid" (3 Columns) */}
            <div className="mt-auto grid grid-cols-3 gap-px overflow-hidden rounded border border-white/10 bg-white/10">
              {/* BPM */}
              <div className="flex flex-col items-center justify-center gap-0.5 bg-black/40 p-1.5">
                <Activity size={10} className="text-muted-foreground" />
                <span className="font-mono text-[10px] font-bold text-white">
                  {song.bpm || '--'}
                </span>
              </div>
              {/* KEY */}
              <div className="flex flex-col items-center justify-center gap-0.5 border-r border-l border-white/5 bg-black/40 p-1.5">
                <Music2 size={10} className="text-muted-foreground" />
                <span className="w-full truncate text-center font-mono text-[10px] font-bold text-white">
                  {song.key || '-'}
                </span>
              </div>
              {/* TIME */}
              <div className="flex flex-col items-center justify-center gap-0.5 bg-black/40 p-1.5">
                <Clock size={10} className="text-muted-foreground" />
                <span className="font-mono text-[10px] font-bold text-white">
                  {duration}
                </span>
              </div>
            </div>

            {/* 3. The "Flavor Tags" (Moods & Themes) */}
            {allFlavorTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allFlavorTags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 rounded-sm border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground uppercase transition-colors group-hover:border-primary/30"
                  >
                    <tag.icon size={8} className={tag.color} /> {tag.text}
                  </div>
                ))}
              </div>
            )}

            {/* 4. Decorative Footer (Barcode) */}
            <div className="mt-2 flex items-end justify-between border-t border-white/5 pt-2 opacity-50 transition-opacity group-hover:opacity-80">
              <div className="flex h-3 items-end gap-[1px]">
                {[...Array(12)].map((_, i) => {
                  const idStr = String(song.id)
                  const seed = idStr
                    .split('')
                    .reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  const x = Math.sin(seed + i + 1) * 10000
                  const height = (x - Math.floor(x)) * 100
                  return (
                    <div
                      key={i}
                      className="w-[1px] bg-white/40"
                      style={{ height: `${height}%` }}
                    />
                  )
                })}
              </div>
              <div className="font-mono text-[8px] tracking-widest text-muted-foreground uppercase">
                // SECURE_DATA
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
