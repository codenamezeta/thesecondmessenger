'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Play, ArrowRight, ChevronDown, Zap } from 'lucide-react'
import SplitText from '@/components/SplitText'
import DecryptedText from '@/components/DecryptedText'
import { usePlayer } from '@/context/PlayerContext'
import { MagneticCta } from './HomeSectionMagneticCta'
import { fadeUp, stagger } from './homeSectionVariants'
import type { HomeProps, SongPreview } from './homeSectionTypes'

export type { SongPreview, HomeProps } from './homeSectionTypes'

const HomeSectionsBelowHeroDynamic = dynamic(
  () =>
    import('./HomeSectionsBelowHero').then((mod) => mod.HomeSectionsBelowHero),
  {
    ssr: true,
    loading: () => (
      <div
        className="min-h-96 border-t border-border/20 bg-background"
        aria-hidden
      />
    ),
  },
)

function HeroSection({ featuredSong }: { featuredSong?: SongPreview }) {
  const { playMedia } = usePlayer()

  return (
    <main className="relative h-[calc(100vh-var(--main-nav-bar-height))] overflow-hidden">
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
      <div className="container grid h-full grid-cols-12 items-center">
        <motion.div
          className="relative z-10 col-span-7 mb-24 flex flex-col justify-center"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* HUD status line */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center gap-3"
          >
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
            className="font-body leading-[0.75] font-black tracking-tighter text-foreground uppercase"
            style={{ fontSize: 'clamp(3rem, 4vw, 12rem)' }}
          >
            <SplitText
              text="Cosmic Scales"
              tag="span"
              className=""
              textAlign="left"
            />
            <SplitText
              text="Pop-Punk"
              tag="span"
              delay={0.75}
              className="glitch-text"
              textAlign="left"
            />
            <SplitText text=" Heart" tag="span" className="" textAlign="left" />
          </motion.h1>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            className="mt-10 border-l-2 border-primary/40 pl-4 text-left font-mono text-[11px] tracking-[0.35em] text-muted-foreground uppercase"
          >
            Cinematic narratives of stellar evolution, vast distances, and
            grounded human emotion, driven by massive choruses and relentless
            guitars.
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
            {[
              'INDEPENDENT',
              'UNFILTERED',
              'FOREGROUND MUSIC',
              'OPEN ACCESS',
            ].map((tag) => (
              <span key={tag} className="border border-border/20 px-3 py-1">
                {tag}
              </span>
            ))}
          </motion.div>
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="pointer-events-none relative col-span-5 flex size-full flex-col items-end"
        >
          {/* Tech Circle behind head */}
          <div className="absolute top-2 right-0 size-96 animate-pulse rounded-full border border-white/10 lg:right-10" />

          {/* The Image (Assumed Transparent PNG) */}
          <div className="relative h-full w-full max-w-[1200px]">
            <div className="absolute right-0 bottom-0 z-10 h-[67%] w-full contrast-125 drop-shadow-[0_0_50px_rgba(0,0,0,0.8)] grayscale-30 filter transition-all duration-700 hover:grayscale-0 lg:-right-10">
              <Image
                src="/imgs/michael-01.png" // CHANGE THIS TO YOUR TRANSPARENT PNG
                alt="Michael Zeta"
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="glitch-text-2 object-cover object-top"
                priority
              />
            </div>

            {/* Foreground HUD Overlay */}
            <div className="absolute bottom-20 -left-8 z-20 hidden border-l-4 border-primary bg-black/80 p-4 backdrop-blur-md md:block">
              <div className="mb-1 flex items-center gap-3">
                <Zap size={16} className="text-primary" />
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                  Operator Online
                </span>
              </div>
              <div className="text-xl font-bold text-white uppercase">
                Michael Zeta
              </div>
              <div className="font-mono text-xs text-gray-500">
                Signal Origin: SOL
              </div>
            </div>
          </div>
        </motion.div>
      </div>

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

export function HomeSections({ songs, videos }: HomeProps) {
  return (
    <article className="relative bg-background">
      <HeroSection featuredSong={songs[0]} />
      <HomeSectionsBelowHeroDynamic songs={songs} videos={videos} />
    </article>
  )
}
