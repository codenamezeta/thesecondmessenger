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
    <section className="backdrop-blur-0 relative w-full overflow-hidden border-b border-white/10 bg-muted/30">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        {coverArtUrl && (
          <Image
            src={coverArtUrl}
            alt="bg"
            fill
            className="scale-110 object-cover blur-[6px]"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-background to-background/20" />
      </div>

      <div className="relative z-10 container py-12 md:py-20">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[300px_1fr]">
          {/* 1. ARTWORK */}
          <div className="group relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border border-accent/25 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] md:mx-0">
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
              <div className="flex h-full w-full items-center justify-center bg-background/50 text-muted-foreground">
                Signal Interference... No Artwork Data Received.
              </div>
            )}

            {/* Overlay Play Button */}
            <button
              onClick={() => (isCurrent ? togglePlay() : playMedia(song))}
              className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_var(--color-primary)] transition-transform hover:scale-110">
                {isActive ? (
                  <Pause size={32} fill="currentColor" />
                ) : (
                  <Play size={32} fill="currentColor" className="ml-1" />
                )}
              </div>
            </button>
          </div>

          {/* 2. METADATA */}
          <div className="flex h-full flex-col items-center justify-around text-center md:items-start md:text-left">
            <h1 className="font-heading text-4xl font-bold tracking-wide text-foreground uppercase drop-shadow-lg md:text-6xl">
              {song.title}
            </h1>
            <span className="-my-6 font-heading text-xl tracking-widest text-primary uppercase opacity-80 md:text-2xl">
              The Second Messenger
            </span>
            {song.tagline && (
              <p className="max-w-4xl font-mono text-base text-muted-foreground italic">
                &quot;{song.tagline}&quot;
              </p>
            )}

            {/* Stat Grid */}
            <div className="flex flex-wrap justify-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase md:justify-start">
              {/* Genre */}
              <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                <Music2 size={12} className="text-accent" />
                <span className="text-foreground">
                  {song.genres?.[0] && typeof song.genres[0] !== 'number'
                    ? song.genres[0].name
                    : 'Song'}
                </span>
              </div>

              {/* Duration */}
              {song.duration && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <Clock size={12} className="text-accent" />
                  <span className="text-foreground">
                    {formatTime(song.duration)}
                  </span>
                </div>
              )}

              {/* BPM */}
              {song.bpm && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <Activity size={12} className="text-accent" />
                  <span className="text-foreground">{song.bpm} BPM</span>
                </div>
              )}

              {/* Key */}
              {song.key && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <ListMusic size={12} className="text-accent" />
                  <span className="text-foreground">{song.key}</span>
                </div>
              )}
            </div>

            {/* Action Bar */}

            <Button
              onClick={() => playMedia(song)}
              variant={isActive ? 'default' : 'outline'}
              size="lg"
              className={cn(
                'group w-96 animate-in border-primary font-bold tracking-widest uppercase shadow-[0_0_20px_hsla(--primary,0.4)] duration-300 group-hover:text-accent group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] hover:border-accent',
                isActive && 'animate-none group-hover:text-primary-foreground',
              )}
            >
              {isActive ? (
                <>
                  <Pause
                    size={16}
                    className="mr-2 text-primary-foreground group-hover:fill-primary-foreground"
                  />{' '}
                  Pause
                </>
              ) : (
                <>
                  <Play
                    size={16}
                    className="mr-2 text-primary group-hover:fill-accent group-hover:text-accent"
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
