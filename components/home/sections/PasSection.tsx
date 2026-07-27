'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Play, Radio, ShieldAlert } from 'lucide-react'
import { PAS } from '@/lib/home/copy'
import { MagneticCta } from '../HomeSectionMagneticCta'
import { SectionHeading } from '../SectionHeading'
import {
  fadeLeft,
  fadeRight,
  fadeUp,
  sectionInView,
  stagger,
} from '../homeSectionVariants'

/** Render a copy string with one italic phrase (spec emphasis). */
function withEmphasis(text: string, phrase: string) {
  const idx = text.indexOf(phrase)
  if (idx === -1) return text
  return (
    <>
      {text.slice(0, idx)}
      <em>{phrase}</em>
      {text.slice(idx + phrase.length)}
    </>
  )
}

function TrailerSlot() {
  // TODO: asset — channel-trailer video (edgier spoken adaptation of the PAS copy). Swap this placeholder for the YouTube embed when footage lands.
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-border/40 bg-card/5">
      {/* Corner brackets */}
      <div className="absolute top-3 left-3 h-5 w-5 border-t border-l border-primary/40" />
      <div className="absolute top-3 right-3 h-5 w-5 border-t border-r border-primary/40" />
      <div className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-primary/40" />
      <div className="absolute right-3 bottom-3 h-5 w-5 border-r border-b border-primary/40" />

      {/* Static/noise texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 70% at 50% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center border border-primary/50 bg-background/60 backdrop-blur-sm">
          <Play className="ml-0.5 h-6 w-6 text-primary/70" />
        </div>
        <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground/60 uppercase">
          [ Transmission corrupted — try again later]
        </span>
      </div>
    </div>
  )
}

export function PasSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 45% at 15% 30%, color-mix(in oklch, var(--destructive) 6%, transparent), transparent)',
        }}
      />

      <div className="relative container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={ShieldAlert}
            eyebrow={PAS.eyebrow}
            heading={PAS.heading}
            subheading={withEmphasis(PAS.subheading, 'stuck')}
          />
        </motion.div>

        {/* Two columns: trailer video left, Problem + Agitation right */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <motion.div variants={fadeLeft} className="lg:sticky lg:top-28">
            <TrailerSlot />
          </motion.div>

          <motion.div variants={fadeRight} className="space-y-6">
            {/* Problem — bold, slightly larger */}
            <p className="font-body text-base leading-relaxed font-semibold text-foreground md:text-lg">
              {PAS.problem}
            </p>
            {/* Agitation — regular weight */}
            <p className="border-l border-border/40 pl-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              {PAS.agitation}
            </p>
          </motion.div>
        </motion.div>

        {/* Solution reveal — full-width, the one intentionally sparkly block */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
          className="relative mt-20"
        >
          {/* Gradient border frame */}
          <div
            className="p-px"
            style={{
              background:
                'linear-gradient(120deg, color-mix(in oklch, var(--primary) 70%, transparent), color-mix(in oklch, var(--accent) 45%, transparent) 50%, color-mix(in oklch, var(--primary) 70%, transparent))',
            }}
          >
            <div className="relative overflow-hidden bg-background">
              {/* Ambient bloom */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 90% at 20% 10%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%), radial-gradient(ellipse 50% 80% at 95% 90%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 60%)',
                }}
              />

              <div className="relative grid grid-cols-1 gap-8 p-8 md:grid-cols-[1fr_minmax(240px,320px)] md:p-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <Radio className="size-3 text-primary" />
                    <span className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase">
                      {PAS.solution.eyebrow}
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl leading-tight font-bold tracking-tight text-foreground uppercase md:text-4xl">
                    {PAS.solution.heading}
                  </h3>
                  <p className="max-w-3xl font-body text-sm leading-relaxed text-foreground/85 md:text-base">
                    {withEmphasis(PAS.solution.body, 'listened to')}
                  </p>
                  <div className="-m-6">
                    <MagneticCta href={PAS.solution.cta.href} variant="ghost">
                      {PAS.solution.cta.label}
                      <ArrowRight className="size-5" />
                    </MagneticCta>
                  </div>
                </div>

                {/* Artist — the real person behind the signal */}
                <div className="relative hidden min-h-[320px] md:block">
                  <div className="absolute inset-0 overflow-hidden border border-border/30">
                    <Image
                      src="/imgs/michael-today.jpg" // TODO: asset — dedicated solution-reveal artist photo
                      alt="Michael Zeta — the artist behind The Second Messenger"
                      fill
                      sizes="320px"
                      className="object-cover object-top contrast-110 grayscale-25 transition-all duration-700 hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 border border-primary/40 bg-background/90 px-3 py-1.5 font-mono text-[9px] tracking-[0.25em] text-primary uppercase backdrop-blur-sm">
                    Michael Zeta
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
