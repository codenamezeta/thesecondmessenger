'use client'

import Image from 'next/image'
import { Song } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'
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
    <section className="relative w-full border-b border-white/10 bg-muted/30 backdrop-blur-0 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {coverArtUrl && (
          <Image src={coverArtUrl} alt="bg" fill className="object-cover blur-[6px] scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background/20" />
      </div>

      <div className="container relative z-10 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8 items-center">
          {/* 1. ARTWORK */}
          <div className="relative aspect-square w-full max-w-[300px] mx-auto md:mx-0 rounded-lg overflow-hidden border border-accent/25 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] group">
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
              <div className="w-full h-full bg-background/50 flex items-center justify-center text-muted-foreground">
                Signal Interference... No Artwork Data Received.
              </div>
            )}

            {/* Overlay Play Button */}
            <button
              onClick={() => (isCurrent ? togglePlay() : playMedia(song))}
              className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-[0_0_20px_var(--color-primary)] hover:scale-110 transition-transform">
                {isActive ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* 2. METADATA */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-wide text-foreground drop-shadow-lg leading-[0.8]">
              {song.title}
            </h1>
            <p className="text-xl md:text-2xl text-primary font-heading uppercase tracking-widest opacity-80">
              The Second Messenger
            </p>
            {song.tagline && (
              <p className="text-base text-muted-foreground italic font-mono max-w-4xl mt-2">
                &quot;{song.tagline}&quot;
              </p>
            )}

            {/* Stat Grid */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider my-6">
              {/* Genre */}
              <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-muted">
                <Music2 size={12} className="text-secondary/75" />
                <span className="text-foreground/80">
                  {song.genres?.[0] && typeof song.genres[0] !== 'number'
                    ? song.genres[0].name
                    : 'Song'}
                </span>
              </div>

              {/* Duration */}
              {song.duration && (
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-muted">
                  <Clock size={12} className="text-secondary/75" />
                  <span className="text-foreground/80">{formatTime(song.duration as any)}</span>
                </div>
              )}

              {/* BPM */}
              {song.bpm && (
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-muted">
                  <Activity size={12} className="text-secondary/75" />
                  <span className="text-foreground/80">{song.bpm} BPM</span>
                </div>
              )}

              {/* Key */}
              {song.key && (
                <div className="flex items-center gap-2 border border-border px-3 py-1.5 rounded bg-muted">
                  <ListMusic size={12} className="text-secondary/75" />
                  <span className="text-foreground/80">{song.key}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}

            <Button
              onClick={() => playMedia(song)}
              variant={isActive ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'w-96 group border-primary hover:border-accent group-hover:text-accent font-bold uppercase tracking-widest shadow-[0_0_20px_hsla(--primary,0.4)] group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] animate-in duration-300',
                isActive && 'group-hover:text-primary-foreground animate-none',
              )}
            >
              {isActive ? (
                <>
                  <Pause
                    size={16}
                    className="text-primary-foreground group-hover:fill-primary-foreground mr-2"
                  />{' '}
                  Pause
                </>
              ) : (
                <>
                  <Play
                    size={16}
                    className="text-primary group-hover:text-accent group-hover:fill-accent mr-2"
                  />{' '}
                  Initialize Playback
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
