'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Song } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'
import {
  Play,
  Pause,
  Clock,
  Music2,
  Activity,
  ListMusic,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import formatTime from '@/utilities/formatTime'
import type { Media } from '@/payload-types'
import placeholderArt from '@/public/imgs/placeholder-art.png'
import { pickMediaImageUrl } from '@/utilities/getMediaUrl'
import { isSongPlayable } from '@/lib/music/songRelease'

type SongHeroProps = {
  song: Song
  /** Filter-aware return link to `/music` (defaults to bare archive). */
  archiveReturnHref?: string
}

export const SongHero = ({
  song,
  archiveReturnHref = '/music',
}: SongHeroProps) => {
  const { playMedia, currentSong, isPlaying, togglePlay } = usePlayer()

  const playable = isSongPlayable(song.releaseDate, song.premiereAt)

  const isCurrent = playable && currentSong?.id === song.id
  const isActive = isCurrent && isPlaying

  const coverArt = song.coverArt as Media | null | undefined
  const coverArtUrl = pickMediaImageUrl(coverArt, 'card')
  const coverArtBlurUrl = pickMediaImageUrl(coverArt, 'thumbnail')

  return (
    <section className="backdrop-blur-0 relative w-full overflow-hidden border-b border-white/10 bg-muted/30">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        {coverArtBlurUrl && (
          <Image
            src={coverArtBlurUrl}
            alt=""
            aria-hidden
            fill
            sizes="96px"
            quality={40}
            className="scale-110 object-cover blur-[6px]"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-br from-background to-background/20" />
      </div>

      <div className="relative z-10 container py-12 md:py-20">
        <nav aria-label="Breadcrumb" className="mb-4">
          <ol className="my-0 flex flex-wrap items-center gap-x-1.5 gap-y-1 font-mono text-[10px] leading-none tracking-widest uppercase md:text-[11px]">
            <li className="my-0">
              <Link
                href="/"
                className="font-normal text-muted-foreground no-underline transition-colors hover:text-primary"
              >
                Home
              </Link>
            </li>
            <li aria-hidden className="my-0 text-muted-foreground/40">
              /
            </li>
            <li className="my-0">
              <Link
                href={archiveReturnHref}
                className="font-normal text-muted-foreground no-underline transition-colors hover:text-primary"
              >
                Music
              </Link>
            </li>
            <li aria-hidden className="my-0 text-muted-foreground/40">
              /
            </li>
            <li
              aria-current="page"
              className="my-0 font-normal text-foreground"
            >
              {song.title}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-[300px_1fr]">
          <div className="group relative mx-auto aspect-square w-full max-w-[300px] overflow-hidden rounded-lg border border-accent/25 shadow-[0_0_40px_rgba(var(--color-primary-rgb),0.2)] md:mx-0">
            {coverArtUrl ? (
              <Image
                src={coverArtUrl}
                alt={song.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
                sizes="(max-width: 768px) 100vw, 300px"
                quality={85}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-6">
                <h2 className="relative z-10 text-center font-heading text-2xl font-bold tracking-widest text-pretty text-accent uppercase drop-shadow">
                  {song.title}
                </h2>
                <Image
                  src={placeholderArt}
                  alt="No artwork... yet."
                  fill
                  sizes="300px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
            )}

            {playable && song.youtubeId && (
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
            )}
          </div>

          <div className="flex h-full flex-col items-center justify-between space-y-3 text-center md:items-start md:justify-center md:text-left">
            <h1 className="font-heading text-4xl leading-[0.75] font-bold tracking-wide text-foreground uppercase drop-shadow-lg md:text-6xl">
              {song.title}
            </h1>
            <span className="font-mono text-2xl font-black tracking-widest text-muted-foreground uppercase opacity-80 md:text-2xl">
              The Second Messenger
            </span>
            {song.tagline && (
              <p className="max-w-4xl font-body text-base leading-tight text-pretty text-muted-foreground italic">
                {song.tagline}
              </p>
            )}

            <div className="flex flex-wrap justify-center gap-2 font-mono text-xs tracking-wider text-muted-foreground uppercase md:justify-start">
              <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                <Music2 size={12} className="text-accent" />
                <span className="text-foreground">
                  {song.genres?.[0] && typeof song.genres[0] !== 'number'
                    ? song.genres[0].name
                    : 'Song'}
                </span>
              </div>

              {song.duration && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <Clock size={12} className="text-accent" />
                  <span className="text-foreground">
                    {formatTime(song.duration)}
                  </span>
                </div>
              )}

              {song.bpm && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <Activity size={12} className="text-accent" />
                  <span className="text-foreground">{song.bpm} BPM</span>
                </div>
              )}

              {song.key && (
                <div className="flex items-center gap-2 rounded border border-border bg-muted px-3 py-1.5">
                  <ListMusic size={12} className="text-accent" />
                  <span className="text-foreground">{song.key}</span>
                </div>
              )}
            </div>

            {song.youtubeId && playable && (
              <Button
                onClick={() => playMedia(song)}
                variant={isActive ? 'default' : 'outline'}
                size="lg"
                className={cn(
                  'group w-96 animate-in border-primary font-bold tracking-widest uppercase shadow-[0_0_20px_hsla(--primary,0.4)] duration-300 group-hover:text-accent group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.6)] hover:border-accent',
                  isActive &&
                    'animate-none group-hover:text-primary-foreground',
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
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
