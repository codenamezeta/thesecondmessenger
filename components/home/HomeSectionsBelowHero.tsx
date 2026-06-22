'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import {
  Play,
  ArrowRight,
  Database,
  Radio,
  Unlock,
  Check,
  X,
  Zap,
  Signal,
  ShieldAlert,
  ExternalLink,
  Music,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import { normalizeMediaUrlForImage } from '@/utilities/getMediaUrl'
import SpotlightCard from '@/components/SpotlightCard'
import DecryptedText from '@/components/DecryptedText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { usePlayer } from '@/context/PlayerContext'
import type { Media } from '@/payload-types'
import { Button } from '@/components/ui/button'
import type { YoutubeChannelVideo } from '@/actions/youtube'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { MagneticCta } from './HomeSectionMagneticCta'
import { fadeUp, fadeLeft, fadeRight, stagger } from './homeSectionVariants'
import type { HomeProps, SongPreview } from './homeSectionTypes'

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
  const coverUrl = normalizeMediaUrlForImage(coverArt?.url) || null
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
                  <h3 className="mb-1 font-body text-2xl font-bold tracking-wider text-foreground uppercase">
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

function VisualFeedSection({ videos }: { videos: YoutubeChannelVideo[] }) {
  return (
    //  --- VISUAL FEED & NEWSLETTER ---
    <section className="relative overflow-hidden border-y border-border/50 bg-card/10 py-24">
      {/* Background Texture (Inline Style) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/imgs/backgrounds/scanlines.png')",
          backgroundSize: '4px 4px',
        }}
      />

      <motion.div variants={fadeUp} className="relative z-10">
        <div className="container grid grid-cols-1 gap-16 lg:grid-cols-2">
          {/* Visual Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="flex items-center gap-3 font-heading text-2xl tracking-widest text-foreground uppercase">
                <ShieldAlert className="text-primary" /> Visual Feed
              </h2>
              <Button
                variant="ghost"
                asChild
                className="text-xs tracking-widest text-muted-foreground uppercase hover:text-primary"
              >
                <Link href="/videos">
                  All Visuals <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {videos.slice(0, 3).map((video: YoutubeChannelVideo) => (
                <Dialog key={video.id}>
                  <DialogTrigger asChild>
                    <Card className="group cursor-pointer border-border/50 bg-card/40 transition-colors hover:border-primary/30 hover:bg-card/80">
                      <div className="flex items-center gap-4 p-4">
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-sm border border-border/50 bg-background transition-colors group-hover:border-primary/50">
                          <Image
                            src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                            alt={video.title}
                            fill
                            sizes="128px"
                            className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                            <div className="flex h-8 w-8 scale-0 transform items-center justify-center rounded-full bg-primary/90 shadow-lg transition-transform group-hover:scale-100">
                              <ExternalLink
                                size={14}
                                className="text-primary-foreground"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 space-y-1 text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-foreground/75">
                              {new Date(
                                video.publishedDate,
                              ).toLocaleDateString()}
                            </span>
                            {video.linkedSong && (
                              <span className="flex items-center gap-1 rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 font-mono text-[9px] tracking-wider text-primary uppercase">
                                <Music size={8} /> Linked
                              </span>
                            )}
                          </div>

                          <h3 className="truncate text-sm font-bold tracking-wide text-foreground uppercase transition-colors group-hover:text-primary">
                            {video.title}
                          </h3>
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-auto opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Play size={16} />
                        </Button>
                      </div>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="overflow-hidden border-primary/20 bg-black/95 p-0 sm:max-w-4xl">
                    <DialogHeader className="sr-only">
                      <DialogTitle>{video.title}</DialogTitle>
                      <DialogDescription>
                        Inline video playback
                      </DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-video w-full">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          </div>

          {/* Newsletter Terminal */}
          <div className="flex flex-col justify-center">
            <Card className="relative overflow-hidden border-border bg-card shadow-2xl">
              <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-transparent via-primary to-transparent opacity-50" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="font-heading text-xl tracking-widest text-primary uppercase">
                    Establish Secure Link
                  </CardTitle>
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full bg-accent/20" />
                    <div className="h-2 w-2 rounded-full bg-secondary/50" />
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                </div>
                <CardDescription className="border-l-2 border-primary/20 pl-3 font-mono text-xs text-card-foreground">
                  Join the encrypted network to receive early transmission logs,
                  tour data, and classified audio drops.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterSignup />
              </CardContent>
            </Card>

            {/* Decorative Terminal Text below */}
            <div className="mt-4 text-right font-mono text-[10px] tracking-widest text-muted-foreground/50 uppercase">
              {'// End of Transmission'}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}

export function HomeSectionsBelowHero({ songs, videos }: HomeProps) {
  return (
    <>
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
      <div className="border-t border-border/20" />
      <VisualFeedSection videos={videos} />
    </>
  )
}
