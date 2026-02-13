'use client'

import React from 'react'
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
const getTagName = (tag: string | number | Tag | null | undefined): string | null => {
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
  const releaseYear = song.releaseDate ? new Date(song.releaseDate).getFullYear() : '----'
  const isCurrent = isPlaying && currentSong?.id === song.id

  // --- DATA EXTRACTION ---
  // Stat Block Leaders
  const genre = song.genres?.[0] ? getTagName(song.genres[0]) : 'Unclassified'

  // Flavor Tags: Get up to 3 of each
  const moodTags = song.moods?.slice(0, 3).map(getTagName).filter(Boolean) as string[]
  const themeTags = song.themes?.slice(0, 3).map(getTagName).filter(Boolean) as string[]

  const allFlavorTags = [
    ...(moodTags || []).map((t) => ({ text: t, icon: Zap, color: 'text-yellow-500/70' })),
    ...(themeTags || []).map((t) => ({ text: t, icon: Globe, color: 'text-blue-500/70' })),
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
        'group relative bg-transparent overflow-visible transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_rgba(var(--primary-rgb),0.3)]',
        className,
      )}
    >
      {/* --- 1. THE OUTER FRAME (Borders & Corners) --- */}
      <div className="absolute inset-0 z-20 pointer-events-none border border-white/10 group-hover:border-primary/50 transition-colors duration-500">
        {/* Tech Corners */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/40 group-hover:border-primary transition-colors" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/40 group-hover:border-primary transition-colors" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/40 group-hover:border-primary transition-colors" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/40 group-hover:border-primary transition-colors" />
      </div>

      {/* --- 2. THE HOLO FOIL & TEXTURE --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen">
        {/* Sparse Particle Texture using SVG filter */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogIDxmaWx0ZXIgaWQ9Im4iPgogICAgPGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMTIiIG51bU9jdGF2ZXM9IjUiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+CiAgICA8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAxICAwIDAgMCAwIDEgIDAgMCAwIDAgMSAgMCAwIDAgMTAwIC04MCIgLz4KICA8L2ZpbHRlcj4KICA8cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbikiIG9wYWNpdHk9IjAuNiIgLz4KPC9zdmc+')]" />
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out"
          style={{ width: '200%' }}
        />
      </div>

      {/* --- 3. MAIN CARD CONTENT --- */}
      <Link
        href={`/songs/${song.slug}`}
        className="flex flex-col h-full overflow-hidden relative z-10 bg-card/20 backdrop-blur-sm"
      >
        {/* --- IMAGE SECTION (The Viewscreen) --- */}
        <div className="relative aspect-square w-full bg-black/50 border-b border-white/10 group-hover:border-primary/30 transition-colors">
          {/* Cover Art */}
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={song.title}
              fill
              className={cn(
                'object-cover transition-all duration-700 mix-blend-normal',
                isCurrent
                  ? 'opacity-40 grayscale scale-105'
                  : 'opacity-90 group-hover:opacity-100 group-hover:scale-105',
              )}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/20">
              <Disc size={64} strokeWidth={1} />
            </div>
          )}

          {/* Viewscreen HUD Overlays */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/80 to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <button
              onClick={handlePlay}
              className={cn(
                'flex items-center justify-center w-14 h-14 rounded-full border border-primary bg-black/80 text-primary backdrop-blur-sm transition-transform duration-300 hover:scale-110 hover:bg-primary hover:text-black shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]',
                isCurrent && 'opacity-100 bg-primary text-black',
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
          <div className="absolute top-2 left-2 right-2 flex justify-between z-20">
            <div className="px-1.5 py-0.5 bg-black/60 border border-white/10 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest text-white/70 backdrop-blur-md">
              {serialNumber}
            </div>
            {song.isExplicit && (
              <div className="px-1.5 py-0.5 bg-red-500/20 border border-red-500/50 rounded-sm text-[9px] font-bold text-red-500 backdrop-blur-md flex items-center gap-1">
                <AlertCircle size={8} /> EXP
              </div>
            )}
          </div>
        </div>

        {/* --- DATA BLOCK (The Stats) --- */}
        <div className="flex-1 flex flex-col p-4 relative bg-gradient-to-b from-black/80 to-black/40">
          {/* Scanline Texture */}
          <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('/imgs/scanlines.png')] bg-[length:4px_4px]" />

          <div className="relative z-10 flex flex-col h-full gap-3">
            {/* 1. Header: Title & Type */}
            <div>
              <h3
                className={cn(
                  'text-lg font-heading uppercase tracking-wide leading-tight mb-1 truncate transition-colors',
                  isCurrent
                    ? 'text-primary text-shadow-glow'
                    : 'text-white group-hover:text-primary',
                )}
              >
                {song.title}
              </h3>

              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-widest mb-1.5">
                <span className="text-primary/80">{genre}</span>
                <span className="text-white/20">|</span>
                <span>{song.compositionType}</span>
              </div>

              {/* TAGLINE */}
              {song.tagline && (
                <p className="text-xs text-muted-foreground italic font-serif leading-snug line-clamp-2 border-l-2 border-white/10 pl-2">
                  &quot;{song.tagline}&quot;
                </p>
              )}
            </div>

            {/* 2. The "Tech Grid" (3 Columns) */}
            <div className="grid grid-cols-3 gap-px bg-white/10 border border-white/10 rounded overflow-hidden mt-auto">
              {/* BPM */}
              <div className="bg-black/40 p-1.5 flex flex-col items-center justify-center gap-0.5">
                <Activity size={10} className="text-muted-foreground" />
                <span className="text-[10px] font-bold font-mono text-white">
                  {song.bpm || '--'}
                </span>
              </div>
              {/* KEY */}
              <div className="bg-black/40 p-1.5 flex flex-col items-center justify-center gap-0.5 border-l border-r border-white/5">
                <Music2 size={10} className="text-muted-foreground" />
                <span className="text-[10px] font-bold font-mono text-white truncate w-full text-center">
                  {song.key || '-'}
                </span>
              </div>
              {/* TIME */}
              <div className="bg-black/40 p-1.5 flex flex-col items-center justify-center gap-0.5">
                <Clock size={10} className="text-muted-foreground" />
                <span className="text-[10px] font-bold font-mono text-white">{duration}</span>
              </div>
            </div>

            {/* 3. The "Flavor Tags" (Moods & Themes) */}
            {allFlavorTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {allFlavorTags.map((tag, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-sm border border-white/10 bg-white/5 text-[9px] text-muted-foreground font-mono uppercase tracking-wider group-hover:border-primary/30 transition-colors"
                  >
                    <tag.icon size={8} className={tag.color} /> {tag.text}
                  </div>
                ))}
              </div>
            )}

            {/* 4. Decorative Footer (Barcode) */}
            <div className="pt-2 mt-2 border-t border-white/5 flex items-end justify-between opacity-50 group-hover:opacity-80 transition-opacity">
              <div className="flex gap-[1px] h-3 items-end">
                {[...Array(12)].map((_, i) => {
                  const idStr = String(song.id)
                  const seed = idStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                  const x = Math.sin(seed + i + 1) * 10000
                  const height = (x - Math.floor(x)) * 100
                  return (
                    <div key={i} className="bg-white/40 w-[1px]" style={{ height: `${height}%` }} />
                  )
                })}
              </div>
              <div className="text-[8px] font-mono text-muted-foreground uppercase tracking-widest">
                // SECURE_DATA
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
