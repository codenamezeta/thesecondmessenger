'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Play, Radio, ShieldAlert } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { PAS } from '@/lib/home/copy'
import { HomeCta } from '../HomeCta'
import { SectionHeading } from '../SectionHeading'
import {
  fadeLeft,
  fadeRight,
  fadeScale,
  SECTION_PAD,
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
  // TODO: asset — channel-trailer video. Swap this placeholder for the embed when footage lands.
  return (
    <div className="relative aspect-video w-full overflow-hidden border border-border/40 bg-card/5 shadow-[0_1px_0_0_color-mix(in_oklch,var(--foreground)_8%,transparent)_inset]">
      <div className="absolute top-3 left-3 h-5 w-5 border-t border-l border-primary/40" />
      <div className="absolute top-3 right-3 h-5 w-5 border-t border-r border-primary/40" />
      <div className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-primary/40" />
      <div className="absolute right-3 bottom-3 h-5 w-5 border-r border-b border-primary/40" />

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
        <div className="flex size-16 items-center justify-center border border-primary/50 bg-background/60 backdrop-blur-sm">
          <Play className="ml-0.5 h-6 w-6 text-primary/70" />
        </div>
        <span className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground/70 uppercase">
          Transmission pending
        </span>
      </div>
    </div>
  )
}

export function PasSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.default)}
    >
      {/* Problem-side tension — cool destructive wash from the left */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 12% 35%, color-mix(in oklch, var(--destructive) 7%, transparent), transparent 65%)',
        }}
      />

      <div className="home-shell container relative">
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
            size="md"
          />
        </motion.div>

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
            <p className="font-body text-base leading-relaxed font-semibold text-foreground md:text-lg">
              {PAS.problem}
            </p>
            <p className="border-l-2 border-border/40 pl-4 font-body text-sm leading-relaxed text-muted-foreground md:text-base">
              {PAS.agitation}
            </p>
          </motion.div>
        </motion.div>

        {/* Solution reveal */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeScale}
          className="relative mt-16 md:mt-20"
        >
          <div
            className="p-px"
            style={{
              background:
                'linear-gradient(120deg, color-mix(in oklch, var(--primary) 65%, transparent), color-mix(in oklch, var(--accent) 35%, transparent) 55%, color-mix(in oklch, var(--primary) 55%, transparent))',
            }}
          >
            <div className="relative overflow-hidden bg-background">
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'radial-gradient(ellipse 70% 90% at 18% 10%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 60%), radial-gradient(ellipse 45% 70% at 95% 85%, color-mix(in oklch, var(--accent) 9%, transparent), transparent 60%)',
                }}
              />

              <div className="relative grid grid-cols-1 gap-8 p-8 md:grid-cols-[1fr_minmax(240px,300px)] md:gap-10 md:p-12">
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5">
                    <Radio className="size-3.5 text-primary" />
                    <span className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase">
                      {PAS.solution.eyebrow}
                    </span>
                  </div>
                  <h3 className="font-heading text-3xl leading-tight font-bold tracking-tight text-foreground uppercase md:text-4xl">
                    {PAS.solution.heading}
                  </h3>
                  <p className="max-w-3xl font-body text-sm leading-relaxed text-foreground/85 md:text-base">
                    {withEmphasis(PAS.solution.body, 'listened to')}
                  </p>
                  <HomeCta
                    href={PAS.solution.cta.href}
                    variant="secondary"
                    magnetic
                  >
                    {PAS.solution.cta.label}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </HomeCta>
                </div>

                <div className="relative hidden min-h-[300px] md:block">
                  <div className="absolute inset-0 overflow-hidden border border-border/30">
                    <Image
                      src="/imgs/michael-today.jpg" // TODO: asset — dedicated solution-reveal artist photo
                      alt="Michael Zeta — the artist behind The Second Messenger"
                      fill
                      sizes="300px"
                      className="object-cover object-top contrast-110 grayscale-25 transition-all duration-700 hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                  <div className="absolute -bottom-3 -left-3 border border-accent/40 bg-background/90 px-3 py-1.5 font-mono text-[10px] tracking-[0.22em] text-accent uppercase backdrop-blur-sm">
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
