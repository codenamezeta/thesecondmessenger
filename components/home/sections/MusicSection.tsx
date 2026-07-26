'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Database, Play, Radio } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { pickMediaImageUrl } from '@/utilities/getMediaUrl'
import SpotlightCard from '@/components/SpotlightCard'
import { ReleaseCountdown } from '@/components/ReleaseCountdown'
import { usePlayer } from '@/context/PlayerContext'
import { MUSIC } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import type { Media } from '@/payload-types'
import type { YoutubeChannelVideo } from '@/actions/youtube'
import { fadeUp, stagger } from '../homeSectionVariants'
import type { SongPreview, PremiereTeaser } from '../homeSectionTypes'

// TODO: mixed-content data model — `✎ POST` cards land here once the posts
// feed task (Phase 3) is built. For now the feed mixes tracks + videos.

type FeedItem =
  | { kind: 'track'; key: string; song: SongPreview }
  | { kind: 'video'; key: string; video: YoutubeChannelVideo }

function TypeTag({ kind }: { kind: 'track' | 'video' }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border/40 bg-background/70 px-2 py-0.5 font-mono text-[9px] tracking-[0.25em] text-primary/80 uppercase backdrop-blur-sm">
      {kind === 'track' ? '♪ TRACK' : '▶ VIDEO'}
    </span>
  )
}

function PlayOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
      <div
        className="flex h-14 w-14 items-center justify-center border border-primary bg-background/60 backdrop-blur-sm"
        style={{
          boxShadow:
            '0 0 30px color-mix(in oklch, var(--primary) 40%, transparent)',
        }}
      >
        <Play className="ml-0.5 h-5 w-5 text-primary" />
      </div>
    </div>
  )
}

/** Metadata to spark curiosity: mood/genre chips + one intrigue stat. */
function CuriosityMeta({ song }: { song: SongPreview }) {
  const chips = song.tagNames.slice(0, 2)
  return (
    <>
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((tag) => (
            <span
              key={tag}
              className="border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-[8px] tracking-[0.15em] text-primary/70 uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {song.bpm ? (
        <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground/70 uppercase">
          {song.bpm} BPM
          {song.durationText ? ` · ${song.durationText}` : ''}
        </span>
      ) : song.tagline ? (
        <span className="line-clamp-1 font-mono text-[9px] tracking-wide text-muted-foreground/70">
          {song.tagline}
        </span>
      ) : null}
    </>
  )
}

function TrackCard({
  song,
  featured = false,
}: {
  song: SongPreview
  featured?: boolean
}) {
  const { playMedia } = usePlayer()
  const coverArt = song.coverArt as Media | null
  const coverUrl =
    pickMediaImageUrl(coverArt, featured ? 'feature' : 'card') || null
  const coverAlt = coverArt?.alt ?? song.title ?? 'Cover art'

  return (
    <SpotlightCard
      className={cn(
        'flex h-full flex-col rounded-none border-border/30 bg-card/5 p-0 backdrop-blur-sm transition-all duration-300 hover:border-primary/50',
        featured && 'min-h-[420px] border-primary/40',
      )}
      spotlightColor={`color-mix(in oklch, var(--primary) ${featured ? 14 : 10}%, transparent)`}
    >
      {/* Instant play — triggers the global player, no navigation */}
      <button
        type="button"
        className="group relative flex w-full flex-1 cursor-pointer flex-col text-left focus:outline-none"
        onClick={() =>
          song.youtubeId && playMedia(song as Parameters<typeof playMedia>[0])
        }
        aria-label={`Play ${song.title}`}
      >
        <div
          className={cn(
            'relative w-full overflow-hidden',
            featured ? 'min-h-[260px] flex-1' : 'aspect-video',
          )}
        >
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={coverAlt}
              fill
              sizes={
                featured
                  ? '(max-width: 768px) 100vw, 60vw'
                  : '(max-width: 768px) 100vw, 25vw'
              }
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/5 to-background">
              <Radio className="h-12 w-12 text-primary/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <TypeTag kind="track" />
          </div>
          {song.youtubeId && <PlayOverlay />}
          {song.durationText && !featured && (
            <div className="absolute right-3 bottom-3 border border-border/40 bg-background/70 px-2 py-0.5 font-mono text-[9px] tracking-widest text-foreground/70 backdrop-blur-sm">
              {song.durationText}
            </div>
          )}
        </div>
      </button>

      <div className={cn('shrink-0 space-y-2 p-4', featured && 'space-y-3 pb-5')}>
        <h3
          className={cn(
            'font-heading leading-tight font-bold tracking-tight text-foreground uppercase',
            featured ? 'text-2xl md:text-3xl' : 'text-sm',
          )}
        >
          {song.title}
        </h3>
        <CuriosityMeta song={song} />
        {featured && song.tagline && song.bpm && (
          <p className="line-clamp-2 font-body text-xs leading-relaxed text-muted-foreground">
            {song.tagline}
          </p>
        )}
        {/* View more — routes to the song's full page */}
        <div>
          <Link
            href={`/music/${song.slug}`}
            className="group/link inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-foreground/60 uppercase transition-colors hover:text-primary"
          >
            Details
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  )
}

function VideoCard({ video }: { video: YoutubeChannelVideo }) {
  const { playMedia } = usePlayer()

  return (
    <SpotlightCard
      className="flex h-full flex-col rounded-none border-border/30 bg-card/5 p-0 backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
      spotlightColor="color-mix(in oklch, var(--primary) 10%, transparent)"
    >
      <button
        type="button"
        className="group relative flex w-full flex-1 cursor-pointer flex-col text-left focus:outline-none"
        onClick={() =>
          playMedia({
            id: video.youtubeId,
            youtubeId: video.youtubeId,
            title: video.title,
          })
        }
        aria-label={`Play video: ${video.title}`}
      >
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={`https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`}
            alt={video.title}
            fill
            sizes="(max-width: 768px) 100vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />
          <div className="absolute top-3 left-3">
            <TypeTag kind="video" />
          </div>
          <PlayOverlay />
        </div>
      </button>
      <div className="shrink-0 space-y-2 p-4">
        <h3 className="line-clamp-2 font-heading text-sm leading-tight font-bold tracking-tight text-foreground uppercase">
          {video.title}
        </h3>
        <span className="block font-mono text-[9px] tracking-[0.2em] text-muted-foreground/70 uppercase">
          {new Date(video.publishedDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      </div>
    </SpotlightCard>
  )
}

/**
 * Featured slot when a scheduled premiere exists: biggest box, glowing
 * border, countdown. Returning fans come back for this.
 */
function PremiereFeaturedCard({ premiere }: { premiere: PremiereTeaser }) {
  const coverArt = premiere.coverArt as Media | null
  const coverUrl = pickMediaImageUrl(coverArt, 'feature') || null

  return (
    <div
      className="relative flex h-full min-h-[420px] flex-col overflow-hidden border border-primary/60 bg-card/5"
      style={{
        boxShadow:
          '0 0 60px color-mix(in oklch, var(--primary) 25%, transparent), inset 0 0 120px color-mix(in oklch, var(--primary) 6%, transparent)',
      }}
    >
      {coverUrl && (
        <Image
          src={coverUrl}
          alt={coverArt?.alt ?? premiere.title}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className="object-cover"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-background/95 via-background/50 to-background/10" />

      <div className="relative z-10 mt-auto space-y-4 p-6 md:p-8">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {'// SCHEDULED PREMIERE'}
        </div>
        <h3 className="font-heading text-3xl leading-tight font-bold tracking-tight text-foreground uppercase md:text-4xl">
          {premiere.title}
        </h3>
        {premiere.tagline && (
          <p className="max-w-md font-body text-sm leading-relaxed text-muted-foreground">
            {premiere.tagline}
          </p>
        )}
        <ReleaseCountdown
          releaseDate={premiere.releaseDate}
          premiereAt={premiere.premiereAt}
          variant="featured"
          embedded
        />
        {premiere.slug && (
          <Link
            href={`/music/${premiere.slug}`}
            className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2 font-mono text-[10px] tracking-[0.25em] text-primary uppercase transition-colors hover:bg-primary hover:text-background"
          >
            View Premiere
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  )
}

function shuffle<T>(input: T[]): T[] {
  const out = [...input]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function MusicSection({
  songs,
  videos,
  premiere,
}: {
  songs: SongPreview[]
  videos: YoutubeChannelVideo[]
  premiere: PremiereTeaser | null
}) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  // Featured slot stays FIXED: the scheduled premiere when one exists,
  // otherwise the most recent release.
  const featuredSong = premiere ? null : (songs[0] ?? null)
  const poolSongs = premiere ? songs : songs.slice(1)

  const initialFeed: FeedItem[] = [
    ...poolSongs
      .slice(0, 8)
      .map<FeedItem>((song) => ({
        kind: 'track',
        key: `track-${song.id}`,
        song,
      })),
    ...videos
      .slice(0, 3)
      .map<FeedItem>((video) => ({
        kind: 'video',
        key: `video-${video.youtubeId}`,
        video,
      })),
  ]

  // Non-featured cards randomize each visit so the page feels alive on
  // repeat visits. The shuffle must NOT run during SSR/hydration (markup
  // would mismatch), so we deliberately reorder once after mount — one extra
  // render is the cost of per-visit randomization.
  const [feed, setFeed] = useState(initialFeed)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFeed((current) => shuffle(current))
  }, [])

  const sideItems = feed.slice(0, 2)
  const bottomItems = feed.slice(2)

  const renderItem = (item: FeedItem) =>
    item.kind === 'track' ? (
      <TrackCard song={item.song} />
    ) : (
      <VideoCard video={item.video} />
    )

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 80% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Database}
            eyebrow={MUSIC.eyebrow}
            heading={MUSIC.heading}
            subheading={MUSIC.subheading}
          />
        </motion.div>

        {songs.length > 0 || premiere ? (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={stagger}
            className="grid grid-cols-1 gap-px bg-border/20 md:grid-cols-12"
          >
            {/* Featured slot — fixed, biggest box */}
            <motion.div
              variants={fadeUp}
              className="md:col-span-7 md:row-span-2"
            >
              {premiere ? (
                <PremiereFeaturedCard premiere={premiere} />
              ) : featuredSong ? (
                <TrackCard song={featuredSong} featured />
              ) : null}
            </motion.div>

            {/* Side cards */}
            {sideItems.map((item) => (
              <motion.div key={item.key} variants={fadeUp} className="md:col-span-5">
                {renderItem(item)}
              </motion.div>
            ))}

            {/* Bottom cards — hidden past the 4th card on mobile to kill the
                too-much-scrolling problem; full bento on md+ */}
            {bottomItems.map((item, i) => (
              <motion.div
                key={item.key}
                variants={fadeUp}
                className={cn('md:col-span-4', i >= 2 && 'hidden md:block')}
              >
                {renderItem(item)}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="border border-dashed border-border/30 p-16 text-center">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {'// NO TRANSMISSIONS FOUND IN DATABASE'}
            </p>
          </div>
        )}

        {/* Hear Everything — accent, visually pops */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="mt-10 flex justify-center"
        >
          <Link
            href="/music"
            className="group inline-flex items-center gap-3 border border-accent bg-accent px-8 py-4 font-mono text-xs font-bold tracking-[0.25em] text-accent-foreground uppercase transition-all duration-300 hover:bg-accent/80"
            style={{
              boxShadow:
                '0 0 40px color-mix(in oklch, var(--accent) 35%, transparent)',
            }}
          >
            {MUSIC.exploreCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
