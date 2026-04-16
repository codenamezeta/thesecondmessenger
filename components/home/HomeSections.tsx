'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView, useSpring, type Variants } from 'motion/react'
import {
  Play,
  ArrowRight,
  Database,
  Radio,
  Unlock,
  ChevronDown,
  Check,
  X,
  Zap,
  Signal,
  ShieldAlert,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import DecryptedText from '@/components/DecryptedText'
import SplitText from '@/components/SplitText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { usePlayer } from '@/context/PlayerContext'
import type { Song, Media } from '@/payload-types'
import { Button } from '../ui/button'

export type SongPreview = Pick<
  Song,
  | 'id'
  | 'title'
  | 'coverArt'
  | 'youtubeId'
  | 'slug'
  | 'releaseDate'
  | 'tagline'
  | 'durationText'
>

interface HomeProps {
  songs: SongPreview[]
}

// ---------------------------------------------------------------------------
// Shared animation variants
// ---------------------------------------------------------------------------

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

// ---------------------------------------------------------------------------
// HUD Section Label
// ---------------------------------------------------------------------------

function HudLabel({
  icon: Icon,
  text,
  color = 'primary',
}: {
  icon: React.ElementType
  text: string
  color?: string
}) {
  return (
    <div className="mb-6 flex items-center gap-2">
      <Icon className={cn('size-3', `text-${color}`)} />
      <DecryptedText
        text={text}
        animateOn="view"
        sequential
        revealDirection="start"
        speed={30}
        characters="XYZ1234!@#$%^&*()"
        className={cn(
          'font-mono text-[10px] tracking-[0.3em] uppercase',
          `text-${color}`,
        )}
        encryptedClassName={cn(
          'font-mono text-[10px] tracking-[0.3em] uppercase',
          `text-${color}/40`,
        )}
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Magnetic Button
// ---------------------------------------------------------------------------

function MagneticCta({
  href,
  onClick,
  children,
  variant = 'primary',
  className,
}: {
  href?: string
  onClick?: VoidFunction
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const springX = useSpring(0, { stiffness: 300, damping: 25 })
  const springY = useSpring(0, { stiffness: 300, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      springX.set((e.clientX - cx) * 0.35)
      springY.set((e.clientY - cy) * 0.35)
    },
    [springX, springY],
  )

  const handleMouseLeave = useCallback(() => {
    springX.set(0)
    springY.set(0)
  }, [springX, springY])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block p-6"
    >
      <motion.div style={{ x: springX, y: springY }}>
        {href ? (
          <Link
            href={href ?? ''}
            onClick={onClick}
            className={cn(
              'group relative inline-flex items-center gap-3 border px-8 py-4 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300',
              variant === 'primary'
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background'
                : 'border-border/50 bg-card/10 text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary',
              className,
            )}
            style={
              variant === 'primary'
                ? {
                    boxShadow:
                      '0 0 40px color-mix(in oklch, var(--primary) 22%, transparent)',
                    transition:
                      'background-color 0.3s, color 0.3s, box-shadow 0.3s',
                  }
                : undefined
            }
          >
            {children}
          </Link>
        ) : (
          <button
            onClick={onClick}
            className={cn(
              'group relative inline-flex items-center gap-3 border px-8 py-4 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300',
              variant === 'primary'
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background'
                : 'border-border/50 bg-card/10 text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary',
              className,
            )}
          >
            {children}
          </button>
        )}
      </motion.div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section 1 — THE TEASER TRAILER (Hero)
// ---------------------------------------------------------------------------

function HeroSection({ featuredSong }: { featuredSong?: SongPreview }) {
  const { playMedia } = usePlayer()

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden">
      {/* Background void */}
      <div className="absolute inset-0 bg-background">
        {/* Primary radial glow — blooms from top-center behind the title */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 90% 55% at 50% 5%, color-mix(in oklch, var(--primary) 18%, transparent), transparent 68%)',
          }}
        />
        {/* Secondary glow — faint from bottom */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 50% 30% at 50% 100%, color-mix(in oklch, var(--primary) 7%, transparent), transparent)',
          }}
        />
        {/* CSS grid pattern */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            opacity: 0.12,
          }}
        />
        {/* Vignette — darkens the corners to focus the eye on center */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.55))',
          }}
        />
        {/* Scanlines */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
          }}
        />
      </div>

      {/* Corner brackets */}
      <div className="absolute top-[10%] left-6 h-8 w-8 border-t border-l border-primary/30" />
      <div className="absolute top-[10%] right-6 h-8 w-8 border-t border-r border-primary/30" />
      <div className="absolute bottom-[12%] left-6 h-8 w-8 border-b border-l border-primary/30" />
      <div className="absolute right-6 bottom-[12%] h-8 w-8 border-r border-b border-primary/30" />

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto mb-24 flex w-full max-w-7xl flex-col items-center px-4 text-center"
        initial="hidden"
        animate="visible"
        variants={stagger}
      >
        {/* HUD status line */}
        <motion.div variants={fadeUp} className="mb-10 flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          <DecryptedText
            text="// SIGNAL ACQUIRED — INITIATING SEQUENCE"
            animateOn="view"
            sequential
            revealDirection="start"
            speed={25}
            characters="XYZ01234!@#$%^&*()"
            className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase"
            encryptedClassName="font-mono text-[10px] tracking-[0.25em] text-primary/30 uppercase"
          />
        </motion.div>

        {/* Main title — monolithic */}
        <motion.h1
          variants={fadeUp}
          className="flex flex-col font-heading leading-[0.75] font-black tracking-tighter text-foreground uppercase select-none"
          style={{ fontSize: 'clamp(3.5rem, 14vw, 11rem)' }}
        >
          <SplitText text="The Second" tag="span" className="" />
          <SplitText
            text="Messenger"
            tag="span"
            delay={0.75}
            className="glitch-text"
          />
        </motion.h1>

        {/* Tagline */}
        <motion.p
          variants={fadeUp}
          className="mt-10 border-l-2 border-primary/40 pl-4 text-left font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase"
        >
          Every track is written, performed, and produced independently.
          <br />
          No factory lines, just raw pop-rock built from the ground up.
        </motion.p>

        {/* Primary CTA */}
        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center sm:flex-row"
        >
          {featuredSong?.youtubeId ? (
            <MagneticCta
              variant="primary"
              onClick={() =>
                playMedia(featuredSong as Parameters<typeof playMedia>[0])
              }
            >
              <Play className="h-3 w-3" />
              Initiate Playback Sequence
            </MagneticCta>
          ) : (
            <MagneticCta href="/music" variant="primary">
              <Play className="h-3 w-3" />
              Initiate Playback Sequence
            </MagneticCta>
          )}
          <MagneticCta href="/music" variant="ghost">
            Enter the Archive
            <ArrowRight className="h-3 w-3" />
          </MagneticCta>
        </motion.div>

        {/* Meta tags */}
        <motion.div
          variants={fadeUp}
          className="mt-14 flex flex-wrap justify-center gap-4 font-mono text-[9px] tracking-widest text-muted-foreground/50 uppercase"
        >
          {['INDEPENDENT', 'UNFILTERED', 'FOREGROUND MUSIC', 'OPEN ACCESS'].map(
            (tag) => (
              <span key={tag} className="border border-border/20 px-3 py-1">
                {tag}
              </span>
            ),
          )}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40">
        <span className="font-mono text-[9px] tracking-[0.4em] text-muted-foreground uppercase">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </motion.div>
      </div>
    </main>
  )
}

// ---------------------------------------------------------------------------
// Section 2 — THE UNIVERSE (Bento Archive)
// ---------------------------------------------------------------------------

function SongTile({
  song,
  featured = false,
}: {
  song: SongPreview
  featured?: boolean
}) {
  const { playMedia } = usePlayer()
  const coverArt = song.coverArt as Media | null
  const coverUrl = coverArt?.url ?? null
  const coverAlt = coverArt?.alt ?? song.title ?? 'Cover art'
  const releaseYear = song.releaseDate
    ? new Date(song.releaseDate).getFullYear()
    : null

  return (
    <SpotlightCard
      className={cn(
        'flex flex-col rounded-none border-border/30 bg-card/5 p-0 backdrop-blur-sm transition-all duration-300 hover:border-accent/50',
        featured ? 'h-full min-h-[400px]' : 'h-full',
      )}
      spotlightColor="color-mix(in oklch, var(--primary) 12%, transparent)"
    >
      <button
        className="group relative flex h-full w-full cursor-pointer flex-col text-left focus:outline-none"
        onClick={() =>
          song.youtubeId && playMedia(song as Parameters<typeof playMedia>[0])
        }
        aria-label={`Play ${song.title}`}
      >
        {/* Cover image */}
        <div
          className={cn(
            'relative w-full overflow-hidden',
            featured ? 'flex-1' : 'aspect-video',
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
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/20 to-transparent" />

          {/* Play overlay */}
          {song.youtubeId && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
          )}

          {/* Duration badge */}
          {song.durationText && (
            <div className="absolute right-3 bottom-3 border border-border/40 bg-background/70 px-2 py-0.5 font-mono text-[9px] tracking-widest text-foreground/70 backdrop-blur-sm">
              {song.durationText}
            </div>
          )}
        </div>
      </button>
      {/* Info */}
      <div className={cn('shrink-0 space-y-2 p-4', featured ? 'pb-6' : '')}>
        <span className="font-mono text-[9px] tracking-[0.3em] text-primary/60 uppercase">
          {releaseYear ? ` STAR_DATE: ${releaseYear}` : ''}
        </span>
        <h3
          className={cn(
            'font-heading leading-tight font-bold tracking-tight text-foreground uppercase',
            featured ? 'text-2xl md:text-3xl' : 'text-sm',
          )}
        >
          {song.title}
        </h3>
        {featured && song.tagline && (
          <p className="mt-2 line-clamp-2 font-mono text-[10px] tracking-wide text-muted-foreground">
            {song.tagline}
          </p>
        )}
        <Button variant="default" size="sm" asChild>
          <Link href={`/music/${song.slug}`}>View Song</Link>
        </Button>
      </div>
    </SpotlightCard>
  )
}

function ArchiveSection({ songs }: { songs: SongPreview[] }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  const featured = songs[0]
  const sideSongs = songs.slice(1, 4)
  const bottomLargeSongs = songs.slice(4, 6)
  const bottomSmallSongs = songs.slice(6, 12)

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      {/* Ambient background glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 80% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />

      <div className="container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-12"
        >
          <motion.div variants={fadeUp}>
            <HudLabel icon={Database} text="// ACCESSING MAIN DIRECTORY" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-6xl"
          >
            The Music
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-2xl border-l border-primary/30 pl-4 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground"
          >
            You aren&apos;t just observing this world — you&apos;re invited to
            help shape what comes next. Every track is a transmission. Every
            play is a vote.
          </motion.p>
        </motion.div>

        {/* Bento Grid */}
        {songs.length > 0 ? (
          <motion.div
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            variants={stagger}
            className="grid grid-cols-2 gap-px bg-border/20 md:grid-cols-12"
          >
            {/* Featured tile */}
            {featured && (
              <motion.div
                variants={fadeUp}
                className="col-span-2 md:col-span-7 md:row-span-3"
              >
                <SongTile song={featured} featured />
              </motion.div>
            )}

            {/* Side tiles */}
            {sideSongs.map((song) => (
              <motion.div
                key={song.id}
                variants={fadeUp}
                className="col-span-2 md:col-span-5"
              >
                <SongTile song={song} />
              </motion.div>
            ))}

            {/* Bottom large tiles */}
            {bottomLargeSongs.map((song) => (
              <motion.div
                key={song.id}
                variants={fadeUp}
                className="md:col-span-6"
              >
                <SongTile song={song} />
              </motion.div>
            ))}
            {/* Bottom small tiles */}
            {bottomSmallSongs.map((song) => (
              <motion.div
                key={song.id}
                variants={fadeUp}
                className="md:col-span-4"
              >
                <SongTile song={song} />
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

        {/* Archive link */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="mt-8 flex justify-end"
        >
          <Link
            href="/music"
            className="group flex items-center gap-3 border border-border/30 bg-card/5 px-6 py-3 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase backdrop-blur-sm transition-colors duration-300 hover:border-primary/40 hover:text-primary"
          >
            Explore Full Music Database
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 3 — THE FANDOM (Signal Intercepts)
// ---------------------------------------------------------------------------

const INTERCEPTS = [
  {
    userId: 'SYS.USER_8492',
    platform: 'YT_COMMENT',
    timestamp: '2024.11.03_14:22',
    message:
      '"That chorus has been stuck in my head for three days straight. I don\'t even know how that\'s legal."',
  },
  {
    userId: 'SYS.USER_1177',
    platform: 'YT_REPLY',
    timestamp: '2025.02.17_09:41',
    message:
      '"Bro replied to my comment within an hour. An actual independent artist who talks to his listeners. This is what music is supposed to feel like."',
  },
  {
    userId: 'SYS.USER_3309',
    platform: 'YT_COMMENT',
    timestamp: '2025.01.08_22:55',
    message:
      '"The guitar tone in the bridge is doing something genuinely illegal. I\'ve listened to that 30-second section probably 200 times."',
  },
  {
    userId: 'SYS.USER_5821',
    platform: 'YT_COMMENT',
    timestamp: '2024.09.29_18:07',
    message:
      '"This is what foreground music means. You cannot have this on in the background. It demands your full attention and rewards every second of it."',
  },
]

function InterceptCard({
  intercept,
  index,
}: {
  intercept: (typeof INTERCEPTS)[0]
  index: number
}) {
  return (
    <SpotlightCard
      className="rounded-none border-border/25 bg-card/5 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
      spotlightColor="color-mix(in oklch, var(--primary) 8%, transparent)"
    >
      <div className="mb-3 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-primary/50 uppercase">
        <Signal className="h-2.5 w-2.5" />
        INTERCEPT_{String(index + 1).padStart(3, '0')} · {intercept.platform} ·{' '}
        {intercept.timestamp}
      </div>
      <div className="mb-3 font-mono text-[10px] tracking-[0.15em] text-primary uppercase">
        {intercept.userId}
        <span className="text-muted-foreground">:</span>
      </div>
      <p className="font-body text-sm leading-relaxed text-foreground/80 italic">
        {intercept.message}
      </p>
    </SpotlightCard>
  )
}

function SignalInterceptSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 20% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 80px, color-mix(in oklch, var(--border) 15%, transparent) 80px, color-mix(in oklch, var(--border) 15%, transparent) 81px)',
        }}
      />

      <div className="container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-12"
        >
          <motion.div variants={fadeUp}>
            <HudLabel icon={Signal} text="// INTERCEPTED USER SIGNALS" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-6xl"
          >
            The Fandom
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-4 max-w-xl border-l border-primary/30 pl-4 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground"
          >
            Others have already crossed the threshold. These are their
            transmissions back.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-px bg-border/15 md:grid-cols-2"
        >
          {INTERCEPTS.map((intercept, i) => (
            <motion.div key={i} variants={fadeUp}>
              <InterceptCard intercept={intercept} index={i} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 4 — THE BACKSTAGE PASS (3-Step Plan)
// ---------------------------------------------------------------------------

const STEPS = [
  {
    num: '01',
    icon: Play,
    title: 'Enter the Terminal',
    subtitle: 'Hit play.',
    body: 'No algorithm. No paywall. Just music with something to say. Press play on any track and let the music speak for itself.',
    cta: { label: 'Start Listening', href: '/music' },
  },
  {
    num: '02',
    icon: Radio,
    title: 'Access the Archive',
    subtitle: 'Unlock the Vault.',
    body: 'Inner-circle collaborators get access to the raw materials — stems, demos, and behind-the-scenes logs.',
    cta: { label: 'Become a Member', href: '/login' },
  },
  {
    num: '03',
    icon: Unlock,
    title: 'Join the Crew',
    subtitle: 'Subscribe.',
    body: "Become a premium member to get every new transmission the moment it drops. You're not following a brand — you're joining a community that shapes what comes next.",
    cta: {
      label: 'Become a Member',
      href: '/memberships',
    },
  },
]

function BackstageSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-24">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in oklch, var(--primary) 9%, transparent), transparent)',
        }}
      />

      <div className="container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-16"
        >
          <motion.div variants={fadeUp}>
            <HudLabel icon={Unlock} text="// CLEARANCE PROTOCOL — 3 STEPS" />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-6xl"
          >
            The Backstage Pass
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-6 bg-transparent md:grid-cols-3"
        >
          {STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp}>
              <SpotlightCard
                className="flex h-full flex-col rounded-none border-border/25 bg-card/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
                spotlightColor="color-mix(in oklch, var(--primary) 10%, transparent)"
              >
                {/* Step number — architectural watermark */}
                <div
                  className="pointer-events-none absolute top-0 right-4 font-heading text-[7rem] leading-none font-black text-foreground/4 select-none"
                  aria-hidden
                >
                  {step.num}
                </div>

                <div className="relative z-10 flex h-full flex-col">
                  <step.icon className="mb-6 h-5 w-5 text-primary" />
                  <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-primary/60 uppercase">
                    Step {step.num}
                  </div>
                  <h3 className="mb-1 font-heading text-2xl font-bold tracking-tight text-foreground uppercase">
                    {step.title}
                  </h3>
                  <p className="mb-4 font-mono text-xs tracking-widest text-primary/80 uppercase">
                    &gt; {step.subtitle}
                  </p>
                  <p className="flex-1 border-l border-primary/20 pl-4 font-body text-sm leading-relaxed text-muted-foreground">
                    {step.body}
                  </p>
                  <Link
                    href={step.cta.href}
                    className="mt-8 self-start border border-border/30 px-4 py-2 font-mono text-[10px] tracking-[0.25em] text-foreground/60 uppercase transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    {step.cta.label}
                  </Link>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 5 — THE ALTERNATIVE (Split Terminal)
// ---------------------------------------------------------------------------

const THEM_ITEMS = [
  'Corporate filters on every mix',
  '16-bar hook loops on repeat',
  'Zero artist connection',
  'Music as wallpaper',
  'Endless filler albums',
  'Pay-to-win playlist placement',
]

const US_ITEMS = [
  'Zero label interference',
  'Massive hooks built to last',
  'Direct artist access & replies',
  'Music you can&apos;t un-hear',
  'Every release is intentional',
  'Transparent and independent',
]

function AlternativeSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div className="container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-16"
        >
          <motion.div variants={fadeUp}>
            <HudLabel
              icon={ShieldAlert}
              text="// THREAT ASSESSMENT — CHOOSE YOUR SIDE"
              color="muted-foreground"
            />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-6xl"
          >
            The Alternative
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-24 md:grid-cols-2"
        >
          {/* The Bad: The Algorithm */}
          <motion.div variants={fadeLeft}>
            <div className="group relative h-full overflow-hidden border border-red-900/20 bg-red-950/10 p-8">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_50%,hsl(0_60%_20%/0.1),transparent)]" />
              <div className="relative z-10">
                <div className="mb-4 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-red-500/60 uppercase">
                  <span className="size-1.5 rounded-full bg-red-500/60" />
                  SYSTEM: THE_ALGORITHM
                </div>
                <h3 className="mb-8 font-heading text-2xl font-bold tracking-tight text-red-400/80 uppercase">
                  <span className="">The Mainstream</span>
                </h3>
                <ul className="space-y-4">
                  {THEM_ITEMS.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 font-mono text-xs text-red-300/60"
                    >
                      <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500/70" />
                      <span dangerouslySetInnerHTML={{ __html: item }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* The Good: The Second Messenger */}
          <motion.div variants={fadeRight}>
            <SpotlightCard
              className="h-full rounded-none border-primary/20 bg-card/5 p-8 transition-all duration-300 hover:border-primary/40"
              spotlightColor="color-mix(in oklch, var(--primary) 12%, transparent)"
            >
              <div className="mb-4 flex items-center gap-2 font-mono text-[9px] tracking-[0.3em] text-primary/60 uppercase">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                SYSTEM: THE_SECOND_MESSENGER
              </div>
              <h3 className="mb-8 font-heading text-2xl font-bold tracking-tight text-primary uppercase">
                The Mission
              </h3>
              <ul className="space-y-4">
                {US_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-mono text-xs text-foreground/80"
                  >
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Section 6 — THE DEBRIEF (FAQ + Final CTA)
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    q: 'Do I have to pay to listen?',
    a: 'No. Every track is free to play on this site and on YouTube. No paywalls, no subscription tiers for basic listening. The archive is open.',
  },
  {
    q: 'What is "Foreground Music"?',
    a: "Foreground music is designed to demand your attention — not fill space. It has real dynamics, complex arrangements, and actual hooks that evolve. You can't put it on shuffle and forget about it. It's the opposite of algorithmic background noise.",
  },
  {
    q: 'Is this a one-man project?',
    a: 'Largely yes. Songwriting, production, recording, mixing, and performance are all handled in-house. Occasional collaborators are credited when they contribute. No session musicians hired to fake a sound.',
  },
  {
    q: 'Where can I get the stems or demo files?',
    a: 'The inner-circle archive with stems, demos, and behind-the-scenes material is currently in development. Subscribe on YouTube and check back here — it will be announced to subscribers first.',
  },
  {
    q: 'How can I actually help?',
    a: "Watch the full video. Leave a real comment. Share one song with someone who would genuinely love it. That's it. The algorithm rewards engagement — so the most powerful thing you can do costs nothing.",
  },
]

function DebriefSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in oklch, var(--primary) 9%, transparent), transparent)',
        }}
      />

      {/* FAQ */}
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={stagger}
        className="container mb-24"
      >
        <motion.div variants={fadeUp}>
          <HudLabel icon={Database} text="// SYSTEM QUERY — FAQ'S" />
        </motion.div>
        <motion.h2
          variants={fadeUp}
          className="mb-12 font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-5xl"
        >
          The Debrief
        </motion.h2>

        <motion.div variants={fadeUp}>
          <Accordion type="single" collapsible className="space-y-px">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border/25 bg-card/5 backdrop-blur-sm transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5"
              >
                <AccordionTrigger className="px-6 py-5 font-mono text-xs tracking-[0.15em] text-foreground/80 uppercase hover:text-foreground hover:no-underline data-[state=open]:text-primary [&>svg]:text-primary/50">
                  <span className="mr-3 text-primary/40">
                    QUERY_{String(i + 1).padStart(2, '0')}
                  </span>
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="border-l border-primary/30 pt-1 pl-4">
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={stagger}
        className="relative py-12 text-center"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in oklch, var(--primary) 14%, transparent), transparent)',
          }}
        />

        <motion.div variants={fadeUp} className="container">
          <HudLabel
            icon={Zap}
            text="// FINAL TRANSMISSION — AWAITING YOUR RESPONSE"
          />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-heading text-4xl leading-tight font-black tracking-tight text-foreground uppercase md:text-6xl lg:text-7xl"
        >
          Ready to hear something you{' '}
          <span className="text-primary">can&apos;t shake?</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="mt-6 font-mono text-xs tracking-[0.25em] text-muted-foreground uppercase"
        >
          No algorithm. No filter. Just music with something to say.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-10 flex flex-col items-center justify-center sm:flex-row"
        >
          <MagneticCta href="/music" variant="primary">
            <Play className="h-3 w-3" />
            Play Now
          </MagneticCta>
          <MagneticCta
            href="https://youtube.com/@thesecondmessenger"
            variant="ghost"
          >
            <Radio className="h-3 w-3" />
            Join the Crew
          </MagneticCta>
        </motion.div>
      </motion.div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Root export
// ---------------------------------------------------------------------------

export function HomeSections({ songs }: HomeProps) {
  return (
    <article className="relative bg-background">
      <HeroSection featuredSong={songs[0]} />
      <div className="border-t border-border/20" />
      <ArchiveSection songs={songs} />
      <div className="border-t border-border/20" />
      <SignalInterceptSection />
      <div className="border-t border-border/20" />
      <BackstageSection />
      <div className="border-t border-border/20" />
      <AlternativeSection />
      <div className="border-t border-border/20" />
      <DebriefSection />
    </article>
  )
}
