'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Play, Pause, Disc, Activity, Clock, FileAudio, ExternalLink, Zap } from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Song, Media } from '@/payload-types' // Adjust path to your types
import { usePlayer } from '@/context/PlayerContext'

interface SongCardProps {
  song: Song
  className?: string
}

export const SongCard = ({ song, className }: SongCardProps) => {
  const { playMedia, isPlaying, currentSong } = usePlayer()

  const coverUrl = (song.coverArt as Media)?.url
  const releaseYear = song.releaseDate ? new Date(song.releaseDate).getFullYear() : '----'

  // Format duration from seconds to MM:SS
  const formatTime = (seconds?: number | null) => {
    if (!seconds) return '--:--'
    const m = Math.floor(seconds / 60)
    const s = Math.round(seconds % 60)
      .toString()
      .padStart(2, '0')
    return `${m}:${s}`
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault() // Stop the link click from happening
    e.stopPropagation()
    playMedia(song) // Call your global player
  }

  return (
    <div
      style={{
        backgroundImage: "url('/imgs/scanlines.png')",
        backgroundPosition: 'center',
        backgroundSize: 'contain',
      }}
      className={cn(
        'group flex flex-col relative border border-border/20 rounded-md overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_-10px_rgba(var(--primary-rgb),0.3)]',
        className,
      )}
    >
      {/* --- TRADING CARD HEADER --- */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30 bg-background/70">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
            Audio_Log_0{releaseYear.toString().slice(-2)}
          </span>
        </div>
        {/* Rarity / Type Badge */}
        <div className="px-1.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-[9px] tracking-wider font-bold text-primary uppercase">
          {song.compositionType || ''}
        </div>
      </div>

      {/* --- MAIN VISUAL (PLAY AREA) --- */}
      <div className="relative aspect-square w-full bg-background group-hover:bg-background/90 transition-colors">
        {/* The Image */}
        {coverUrl ? (
          <>
            <Image
              src={coverUrl}
              alt={song.title}
              fill
              className="opacity-80 group-hover:opacity-40 transition-opacity duration-500 grayscale-[25%] group-hover:grayscale-0"
            />
            <div className="absolute bottom-0 bg-gradient-to-t from-background from-5% to-transparent w-full h-[33%] group-hover:bg-transparent transition-colors"></div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/40">
            <Disc size={80} />
          </div>
        )}

        {/* PLAY BUTTON OVERLAY (Only visible on hover) */}
        <div className="group flex items-center justify-center size-full">
          <button
            onClick={handlePlay}
            className={cn(
              'size-36 z-10 rounded-full bg-primary text-primary-foreground hover:text-primary flex items-center justify-center hover:scale-110 hover:bg-white transition-all shadow-[0_0_20px_rgba(50,250,255,0.9)]',
              isPlaying && currentSong === song
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100',
            )}
          >
            {isPlaying && currentSong === song ? (
              <Pause size={60} fill="currentColor" className="ml-1" />
            ) : (
              <Play size={60} fill="currentColor" className="ml-1" />
            )}
          </button>
          <div className="absolute inset-0 z-0 bg-background/50 hover:animate-pulse opacity-0 group-hover:opacity-100"></div>
        </div>

        {/* Quick status label */}
        <div className="absolute -bottom-1 left-2 px-2 py-1 leading-3 bg-background/20 border border-border/50 text-[9px] font-mono text-foreground/80 backdrop-blur opacity-100 group-hover:text-primary group-hover:border-primary/20 transition-opacity">
          CLICK TO INITIALIZE
        </div>
      </div>

      {/* --- DATA GRID (THE "TRADING CARD" STATS) --- */}
      <Link
        href={`/songs/${song.slug}`}
        className="flex flex-col p-4 space-y-4 h-full bg-gradient-to-b from-background to-background/70"
      >
        <div className="flex flex-col mb-auto">
          <h3 className="text-xl font-heading text-primary uppercase tracking-wider group-hover:text-primary transition-colors">
            {song.title}
          </h3>
          <p className="text-xs text-card-foreground font-mono border-l-2 border-primary/30 pl-2 mt-1 mb-auto">
            {song.tagline || 'Unknown Transmission'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="flex justify-between items-center gap-px bg-sidebar/50 border border-primary/30 rounded-lg overflow-hidden">
          {/* BPM */}
          <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1 group/stat hover:bg-primary/10 transition-colors">
            <Activity size={12} className="text-primary/80 group-hover/stat:text-primary" />
            <span className="text-xs font-bold tracking-widest text-foreground/90">
              {song.bpm || '--'}
            </span>
            <span className="text-[0.6em] text-foreground/70 uppercase tracking-wider">BPM</span>
          </div>

          {/* Small vertical line */}
          <div className="w-0 h-[33%] my-auto border-l border-border/50"></div>

          {/* DURATION */}
          <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1 group/stat hover:bg-primary/10 transition-colors">
            <Clock size={12} className="text-primary/80 group-hover/stat:text-primary" />
            <span className="text-xs font-bold tracking-widest text-foreground/90">
              {formatTime(song.duration)}
            </span>
            <span className="text-[0.6em] text-foreground/70 uppercase tracking-wider">TIME</span>
          </div>

          {/* Small vertical line */}
          <div className="w-0 h-[33%] my-auto border-l border-border/50"></div>

          {/* KEY */}
          <div className="flex-1 p-2 flex flex-col items-center justify-center gap-1 group/stat hover:bg-primary/10 transition-colors">
            <FileAudio size={12} className="text-primary/80 group-hover/stat:text-primary" />
            <span className="text-xs font-bold tracking-widest text-foreground/90">
              {song.key || '-'}
            </span>
            <span className="text-[0.6em] text-foreground/70 uppercase tracking-wider">KEY</span>
          </div>
        </div>

        {/* Footer / CTA */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[9px] font-mono text-foreground/70 group-hover:text-foreground transition-colors">
            // ACCESS_DATA_CACHE
          </span>
          <Zap
            size={14}
            className="text-foreground/50 group-hover:text-primary group-hover:fill-current transition-all"
          />
        </div>
      </Link>

      {/* Decorative Corner Borders (CSS or SVG) */}
      <div className="absolute top-0 left-0 w-3 h-3 border-l border-t border-border rounded-tl-sm pointer-events-none" />
      <div className="absolute top-0 right-0 w-3 h-3 border-r border-t border-border rounded-tr-sm pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-l border-b border-border rounded-bl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-r border-b border-border rounded-br-sm pointer-events-none" />
    </div>
  )
}
