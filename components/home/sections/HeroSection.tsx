'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight, Check, ChevronDown, Zap } from 'lucide-react'
import SplitText from '@/components/SplitText'
import DecryptedText from '@/components/DecryptedText'
import DotField from '@/components/DotField'
import { cn } from '@/utilities/ui'
import { trackJoinCrewClick } from '@/lib/analytics/ga'
import { HERO } from '@/lib/home/copy'
import type { PlayCategory } from '@/lib/home/playCategories'
import { MagneticCta } from '../HomeSectionMagneticCta'
import { PlaySomethingButton } from '../PlaySomethingButton'
import { AmbientComments } from '../AmbientComments'
import { fadeUp, stagger } from '../homeSectionVariants'
import type { SongPreview } from '../homeSectionTypes'

export function HeroSection({
  songs,
  categoryQueues,
}: {
  songs: SongPreview[]
  categoryQueues: Record<PlayCategory, Array<string | number>>
}) {
  return (
    <section className="relative overflow-hidden lg:min-h-[calc(100vh-var(--main-nav-bar-height))]">
      {/* Background void */}
      <div className="absolute inset-0 bg-background">
        <DotField
          dotRadius={0.67}
          dotSpacing={20}
          bulgeStrength={20}
          glowRadius={200}
          sparkle
          waveAmplitude={0}
          cursorRadius={100}
          cursorForce={0.18}
          gradientFrom="#55f7e6"
          gradientTo="#cd5d1a"
          glowColor="#181e1e"
        />
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
      <div className="absolute top-[8%] left-6 h-8 w-8 border-t border-l border-primary/30" />
      <div className="absolute top-[8%] right-6 h-8 w-8 border-t border-r border-primary/30" />
      <div className="absolute bottom-[10%] left-6 h-8 w-8 border-b border-l border-primary/30" />
      <div className="absolute right-6 bottom-[10%] h-8 w-8 border-r border-b border-primary/30" />

      {/* Content */}
      <div className="container relative flex flex-col items-center gap-4 pt-14 pb-20 lg:min-h-[calc(100vh-var(--main-nav-bar-height))] lg:flex-row lg:items-center lg:gap-0 lg:pt-0 lg:pb-0">
        {/* Left column — the pitch */}
        <motion.div
          className="relative z-10 flex max-w-2xl flex-col justify-center space-y-6 lg:flex-1"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          {/* HUD status line */}
          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            <DecryptedText
              text="// SIGNAL ACQUIRED — INITIATING SEQUENCE"
              animateOn="view"
              sequential
              revealDirection="start"
              speed={75}
              characters="XYZ01234!@#$%^&*()"
              className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase"
              encryptedClassName="font-mono text-[10px] tracking-[0.25em] text-primary/30 uppercase"
            />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-body leading-[0.85] font-black tracking-tighter text-foreground uppercase"
            style={{ fontSize: 'clamp(2.75rem, 6.5vw, 7.5rem)' }}
          >
            <SplitText
              text="Songs You"
              tag="span"
              className=""
              textAlign="left"
              immediate
            />{' '}
            <SplitText
              text="Can't Shake."
              tag="span"
              delay={200}
              className="glitch-text"
              textAlign="left"
              immediate
            />
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={fadeUp}
            className="max-w-xl border-l-2 border-primary/40 pl-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base"
          >
            {HERO.subheadline}
          </motion.p>

          {/* CTA pair */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col items-start gap-2 sm:flex-row sm:items-center"
          >
            <PlaySomethingButton songs={songs} queues={categoryQueues} />
            <MagneticCta
              href="/memberships"
              variant="ghost"
              onClick={() => trackJoinCrewClick({ location: 'home_hero' })}
            >
              {HERO.secondaryCta}
              <ArrowRight className="size-5" />
            </MagneticCta>
          </motion.div>

          {/* Value checks — top 3 on mobile, all 5 on md+ */}
          <motion.ul
            variants={fadeUp}
            className="grid max-w-xl grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"
          >
            {HERO.valueChecks.map((check, i) => (
              <li
                key={check.lead}
                className={cn(
                  'items-start gap-2.5',
                  i >= 3 ? 'hidden md:flex' : 'flex',
                )}
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center border border-primary/40 bg-primary/10">
                  <Check className="size-3 text-primary" />
                </span>
                <p className="font-body text-xs leading-relaxed text-muted-foreground">
                  <strong className="font-semibold text-foreground">
                    {check.lead}
                  </strong>{' '}
                  {check.rest}
                </p>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Right column — the artist IS the product */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="pointer-events-none relative flex flex-col lg:mx-[-60px] lg:self-end xl:mx-[-36px]"
        >
          {/* Halo rings behind head */}
          <div className="absolute inset-x-0 top-36 size-[800px] animate-pulse rounded-full border border-foreground/20 lg:right-10" />
          <div className="absolute inset-x-0 top-48 size-[750px] rounded-full border border-dashed border-foreground/20 lg:right-10" />
          {/* Halo glow — single dramatic light source */}
          <div
            className="absolute inset-x-0 top-32 size-[820px] rounded-full lg:right-10"
            style={{
              background:
                'radial-gradient(circle at 30% 20%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%)',
            }}
          />

          <div className="relative min-h-[360px] min-w-[300px] lg:min-h-[860px] lg:min-w-[720px]">
            {/* Ambient peeking comments — behind the PNG, in the halo space */}
            <AmbientComments />

            {/* Artist cutout — dramatic single-source light, deep shadow */}
            <div className="pointer-events-auto absolute inset-0 z-10 contrast-125 drop-shadow-[0_0_60px_rgba(0,0,0,0.85)] grayscale-30 filter transition-all duration-700 hover:grayscale-0 lg:-right-10">
              <Image
                src="/imgs/michael-01.png" // TODO: asset — refined hero cutout w/ dramatic single-source lighting
                alt="Michael Zeta"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-top"
                priority
              />
            </div>

            {/* Foreground HUD overlay */}
            <div className="absolute bottom-20 -left-8 z-20 hidden border-l-4 border-primary bg-background/80 p-4 backdrop-blur-md md:block">
              <div className="mb-1 flex items-center gap-3">
                <Zap size={16} className="text-primary" />
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                  Operator Online
                </span>
              </div>
              <div className="text-xl font-bold text-foreground uppercase">
                Michael Zeta
              </div>
              <div className="font-mono text-xs text-muted-foreground">
                Signal Origin: SOL
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 opacity-40">
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
    </section>
  )
}
