'use client'

import { useRef, type MouseEvent } from 'react'
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
import { fadeUp, SECTION_PAD, sectionGlow, sectionInView, stagger, staggerFast } from '../homeSectionVariants'
import { HomeCta } from '../HomeCta'
import type { SongPreview, PremiereTeaser } from '../homeSectionTypes'

// TODO: mixed-content data model — `✎ POST` cards land here once the posts
// feed task (Phase 3) is built. For now the feed mixes tracks + videos.

type FeedItem =
  | { kind: 'track'; key: string; song: SongPreview }
  | { kind: 'video'; key: string; video: YoutubeChannelVideo }

function TypeTag({ kind }: { kind: 'track' | 'video' }) {
  return (
    <span className="inline-flex items-center gap-1.5 border border-border/40 bg-background/70 px-2 py-0.5 font-mono text-[10px] tracking-[0.25em] text-primary/80 uppercase backdrop-blur-sm">
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
              className="border border-primary/20 bg-primary/5 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.15em] text-primary/70 uppercase"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {song.bpm ? (
        <span className="font-mono text-xs tracking-[0.2em] text-muted-foreground/70 uppercase">
          {song.bpm} BPM
          {song.durationText ? ` · ${song.durationText}` : ''}
        </span>
      ) : song.tagline ? (
        <span className="line-clamp-1 font-mono text-xs tracking-wide text-muted-foreground/70">
          {song.tagline}
        </span>
      ) : null}
    </>
  )
}

function formatReleaseChip(releaseDate?: string | null): string | null {
  if (!releaseDate) return null
  const date = new Date(releaseDate)
  if (Number.isNaN(date.getTime())) return null
  return date
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase()
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
  const releaseChip = formatReleaseChip(song.releaseDate)

  const handlePlay = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (song.youtubeId) {
      playMedia(song as Parameters<typeof playMedia>[0])
    }
  }

  return (
    <SpotlightCard
      className={cn(
        'group relative flex h-full flex-col rounded-none border-border/30 bg-card/5 p-0',
        featured &&
          'min-h-[420px] border-primary/50 shadow-[0_0_60px_-20px_color-mix(in_oklch,var(--primary)_35%,transparent)]',
      )}
      spotlightColor={`color-mix(in oklch, var(--primary) ${featured ? 18 : 10}%, transparent)`}
      elevated={featured}
    >
      {/* Stretch link: whole card opens the song page */}
      <Link
        href={`/music/${song.slug}`}
        className="absolute inset-0 z-0"
        aria-label={`View ${song.title}`}
      />

      {/* Visual content is non-interactive so clicks fall through to the link */}
      <div
        className={cn(
          'pointer-events-none relative w-full overflow-hidden',
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
        {releaseChip && (
          <div className="absolute right-3 bottom-3 border border-border/40 bg-background/70 px-2 py-0.5 font-mono text-[10px] tracking-widest text-foreground/70 backdrop-blur-sm">
            {releaseChip}
          </div>
        )}
      </div>

      <div
        className={cn(
          'pointer-events-none relative z-10 flex shrink-0 items-start gap-3 p-4',
          featured && 'gap-4 pb-5',
        )}
      >
        <div className={cn('min-w-0 flex-1 space-y-2', featured && 'space-y-3')}>
          <h3
            className={cn(
              'font-heading leading-snug font-bold tracking-tight text-foreground uppercase',
              featured ? 'text-2xl md:text-3xl' : 'text-base md:text-lg',
            )}
          >
            {song.title}
          </h3>
          <CuriosityMeta song={song} />
          {featured && song.tagline && song.bpm && (
            <p className="line-clamp-2 font-body text-sm leading-relaxed text-muted-foreground">
              {song.tagline}
            </p>
          )}
        </div>

        {/* Playback sits on the right so the body isn't left-heavy */}
        {song.youtubeId && (
          <button
            type="button"
            onClick={handlePlay}
            aria-label={`Play ${song.title}`}
            className={cn(
              'pointer-events-auto inline-flex shrink-0 items-center justify-center border border-primary/50 bg-primary/10 text-primary transition-all duration-300 hover:border-primary hover:bg-primary hover:text-background focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none',
              featured ? 'h-14 w-14' : 'h-12 w-12',
            )}
            style={{
              boxShadow:
                '0 0 20px color-mix(in oklch, var(--primary) 25%, transparent)',
            }}
          >
            <Play
              className={cn('fill-current', featured ? 'h-5 w-5' : 'h-4 w-4')}
            />
          </button>
        )}
      </div>
    </SpotlightCard>
  )
}

function VideoCard({ video }: { video: YoutubeChannelVideo }) {
  const { playMedia, setVideoEnabled } = usePlayer()

  const handlePlay = () => {
    playMedia({
      id: video.youtubeId,
      youtubeId: video.youtubeId,
      title: video.title,
    })
    // Videos should be watched, not just heard. Leaves videoMode
    // (theater vs mini) at whatever the visitor last chose.
    setVideoEnabled(true)
  }

  return (
    <SpotlightCard
      className="flex h-full flex-col rounded-none border-border/30 bg-card/5 p-0 hover:border-primary/45"
      spotlightColor="color-mix(in oklch, var(--primary) 10%, transparent)"
    >
      {/* Image stays aspect-locked; no flex-1 so body padding matches track cards */}
      <button
        type="button"
        className="group relative aspect-video w-full shrink-0 cursor-pointer overflow-hidden text-left focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
        onClick={handlePlay}
        aria-label={`Play video: ${video.title}`}
      >
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
      </button>
      <div className="shrink-0 space-y-2 p-4">
        <h3 className="line-clamp-2 font-heading text-base leading-snug font-bold tracking-tight text-foreground uppercase md:text-lg">
          {video.title}
        </h3>
        <span className="block font-mono text-xs tracking-[0.2em] text-muted-foreground/70 uppercase">
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
  const inView = useInView(ref, sectionInView)

  // Featured slot stays FIXED: the scheduled premiere when one exists,
  // otherwise the most recent release.
  const featuredSong = premiere ? null : (songs[0] ?? null)
  const poolSongs = premiere ? songs : songs.slice(1)

  // Most recently published first, tracks and videos interleaved by date.
  const feed: FeedItem[] = [
    ...poolSongs.map<FeedItem & { publishedAt: number }>((song) => ({
      kind: 'track',
      key: `track-${song.id}`,
      song,
      publishedAt: song.releaseDate ? Date.parse(song.releaseDate) : 0,
    })),
    ...videos.map<FeedItem & { publishedAt: number }>((video) => ({
      kind: 'video',
      key: `video-${video.youtubeId}`,
      video,
      publishedAt: Date.parse(video.publishedDate) || 0,
    })),
  ]
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .slice(0, 11)

  const sideItems = feed.slice(0, 2)
  const bottomItems = feed.slice(2)

  const renderItem = (item: FeedItem) =>
    item.kind === 'track' ? (
      <TrackCard song={item.song} />
    ) : (
      <VideoCard video={item.video} />
    )

  return (
    <section ref={ref} className={cn('relative overflow-hidden px-4', SECTION_PAD.peak)}>
      <div className="absolute inset-0" style={sectionGlow('medium')} />
      {/* Soft console grid — Music is the catalog peak */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in oklch, var(--primary) 40%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 40%, transparent) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          maskImage:
            'radial-gradient(ellipse 70% 60% at 70% 40%, black, transparent)',
        }}
      />

      <div className="home-shell container relative">
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
            size="lg"
          />
        </motion.div>

        {songs.length > 0 || premiere ? (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={staggerFast}
            className="grid grid-cols-1 gap-px bg-border/25 md:grid-cols-12"
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

        {/* Hear Everything — primary action (accent reserved for emotional register) */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="mt-12 flex justify-center"
        >
          <HomeCta href="/music" variant="primary" size="default">
            {MUSIC.exploreCta}
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </HomeCta>
        </motion.div>
      </div>
    </section>
  )
}
