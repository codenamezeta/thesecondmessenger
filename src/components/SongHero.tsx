'use client'

import Image from 'next/image'
import { Song } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Play, Pause, Clock, Music2, Activity, ListMusic } from 'lucide-react' // Added Icons
import { cn } from '@/utilities/ui'
import formatTime from '@/utilities/formatTime'
import type { Media } from '@/payload-types'

export const SongHero = ({ song }: { song: Song }) => {
  const { playMedia, currentSong, isPlaying, togglePlay } = usePlayer()

  const isCurrent = currentSong?.id === song.id
  const isActive = isCurrent && isPlaying

  const coverArtUrl = (song.coverArt as Media)?.url || ''

  return (
    <div className="relative w-full border-b border-white/10 bg-surface/30 backdrop-blur-0 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {coverArtUrl && (
          <Image src={coverArtUrl} alt="bg" fill className="object-cover blur-lg scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container relative z-10 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-center">
          {/* 1. ARTWORK */}
          <div className="relative aspect-square w-full max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden border border-white/20 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] group">
            {coverArtUrl ? (
              <Image
                src={coverArtUrl}
                alt={song.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 300px"
              />
            ) : (
              <div className="w-full h-full bg-black/50 flex items-center justify-center text-muted">
                Signal Interference... No Artwork Data Received.
              </div>
            )}

            {/* Overlay Play Button */}
            <button
              onClick={() => (isCurrent ? togglePlay() : playMedia(song))}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary text-black flex items-center justify-center shadow-[0_0_20px_var(--color-primary)] hover:scale-110 transition-transform">
                {isActive ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* 2. METADATA */}
          <div className="flex flex-col gap-4 text-center md:text-left">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-wide text-white drop-shadow-lg leading-[0.9]">
                {song.title}
              </h1>
              <p className="text-xl md:text-2xl text-primary font-heading uppercase tracking-widest opacity-80">
                The Second Messenger
              </p>
              {song.tagline && (
                <p className="text-base text-gray-400 italic font-mono max-w-2xl">
                  &quot;{song.tagline}&quot;
                </p>
              )}
            </div>

            {/* Stat Grid */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 py-4 text-xs font-mono text-muted uppercase tracking-wider">
              {/* Genre */}
              <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded bg-black/40">
                <Music2 size={12} className="text-primary" />
                <span>{typeof song.genres === 'string' ? song.genres.split(',')[0] : 'Rock'}</span>
              </div>

              {/* Duration */}
              {song.duration && (
                <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded bg-black/40">
                  <Clock size={12} className="text-primary" />
                  <span>{formatTime(song.duration as any)}</span>
                </div>
              )}

              {/* BPM */}
              {song.bpm && (
                <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded bg-black/40">
                  <Activity size={12} className="text-primary" />
                  <span>{song.bpm} BPM</span>
                </div>
              )}

              {/* Key */}
              {song.key && (
                <div className="flex items-center gap-2 border border-white/10 px-3 py-1.5 rounded bg-black/40">
                  <ListMusic size={12} className="text-primary" />
                  <span>{song.key}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
              <button
                onClick={() => playMedia(song)}
                className={cn(
                  'px-8 py-3 bg-primary hover:bg-white text-black font-bold uppercase tracking-widest rounded-sm transition-all shadow-[0_0_20px_rgba(var(--color-primary-rgb),0.4)] hover:shadow-[0_0_30px_rgba(var(--color-primary-rgb),0.6)] flex items-center gap-2 animate-pulse hover:animate-none',
                  isActive && 'bg-white animate-none',
                )}
              >
                {isActive ? (
                  <>
                    <Pause size={16} /> Pause
                  </>
                ) : (
                  <>
                    <Play size={16} /> Initialize Playback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
