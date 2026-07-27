'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Zap } from 'lucide-react'
import DecryptedText from '@/components/DecryptedText'
import { trackJoinCrewClick } from '@/lib/analytics/ga'
import { FINAL_CTA } from '@/lib/home/copy'
import type { PlayCategory } from '@/lib/home/playCategories'
import { MagneticCta } from '../HomeSectionMagneticCta'
import { PlaySomethingButton } from '../PlaySomethingButton'
import { fadeUp, sectionInView, stagger } from '../homeSectionVariants'
import type { SongPreview } from '../homeSectionTypes'

/**
 * The close. Bookends the hero headline with the same Play-something button,
 * wrapped in the most intense atmospheric treatment on the page.
 */
export function FinalCtaSection({
  songs,
  categoryQueues,
}: {
  songs: SongPreview[]
  categoryQueues: Record<PlayCategory, Array<string | number>>
}) {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-32 md:py-40">
      {/* Densest atmosphere on the page */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 45%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 70%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 85% 90%, color-mix(in oklch, var(--accent) 8%, transparent), transparent)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          opacity: 0.1,
        }}
      />
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-5"
        style={{
          backgroundImage: "url('/imgs/backgrounds/scanlines.png')",
          backgroundSize: '4px 4px',
        }}
      />
      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 35%, rgba(0,0,0,0.6))',
        }}
      />

      {/* Corner brackets */}
      <div className="absolute top-8 left-6 h-8 w-8 border-t border-l border-primary/30" />
      <div className="absolute top-8 right-6 h-8 w-8 border-t border-r border-primary/30" />
      <div className="absolute bottom-8 left-6 h-8 w-8 border-b border-l border-primary/30" />
      <div className="absolute right-6 bottom-8 h-8 w-8 border-r border-b border-primary/30" />

      <motion.div
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        variants={stagger}
        className="container relative text-center"
      >
        <motion.div
          variants={fadeUp}
          className="mb-8 flex items-center justify-center gap-2"
        >
          <Zap className="size-3 text-primary" />
          <DecryptedText
            text="// FINAL TRANSMISSION — AWAITING YOUR RESPONSE"
            animateOn="view"
            sequential
            revealDirection="start"
            speed={30}
            characters="XYZ1234!@#$%^&*()"
            className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase"
            encryptedClassName="font-mono text-[10px] tracking-[0.3em] text-primary/40 uppercase"
          />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="mx-auto max-w-4xl font-heading text-4xl leading-tight font-black tracking-tight text-foreground uppercase md:text-6xl lg:text-7xl"
        >
          Ready to hear something you{' '}
          <span className="glitch-text text-primary">can&apos;t shake?</span>
        </motion.h2>

        {/* Stacked CTA pair — play keeps them listening, Crew asks for commitment */}
        <motion.div
          variants={fadeUp}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <PlaySomethingButton songs={songs} queues={categoryQueues} />
          <MagneticCta
            href="/memberships"
            variant="ghost"
            onClick={() => trackJoinCrewClick({ location: 'home_final_cta' })}
          >
            {FINAL_CTA.secondaryCta}
            <ArrowRight className="size-5" />
          </MagneticCta>
        </motion.div>
      </motion.div>
    </section>
  )
}
