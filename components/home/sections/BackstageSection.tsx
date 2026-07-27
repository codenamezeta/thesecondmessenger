'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Crown, Play, Unlock, UserPlus } from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import { JoinCrewLink } from '@/components/analytics/JoinCrewLink'
import { BACKSTAGE } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import { HomeCta } from '../HomeCta'
import {
  fadeUp,
  SECTION_PAD,
  sectionGlow,
  sectionInView,
  stagger,
} from '../homeSectionVariants'

/**
 * Escalation ladder: free listen → free account → paid membership.
 * Visual weight increases left → right (height, border, glow) so the
 * layout itself communicates the ask — not just the watermark numbers.
 */

const STEP_ICONS = [Play, UserPlus, Crown] as const

export function BackstageSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.default)}
    >
      <div className="absolute inset-0" style={sectionGlow('medium', '50% 90%')} />

      <div className="home-shell container relative">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Unlock}
            eyebrow={BACKSTAGE.eyebrow}
            heading={BACKSTAGE.heading}
            subheading={BACKSTAGE.subheading}
            size="md"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="relative grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end md:gap-0"
        >
          {/* Connecting rail — desktop only */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-[42%] right-[8%] left-[8%] hidden h-px bg-linear-to-r from-border/20 via-primary/40 to-primary/70 md:block"
          />

          {BACKSTAGE.steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Play
            const isPaidAsk = i === 2
            const isMid = i === 1

            return (
              <motion.div
                key={step.num}
                variants={fadeUp}
                className={cn(
                  'relative z-10',
                  isMid && 'md:px-3',
                  isPaidAsk && 'md:pl-3',
                  i === 0 && 'md:pr-3',
                )}
              >
                <SpotlightCard
                  elevated
                  className={cn(
                    'flex flex-col rounded-none p-7 md:p-8',
                    isPaidAsk
                      ? 'min-h-[320px] border-primary/50 bg-primary/5 md:min-h-[360px]'
                      : isMid
                        ? 'min-h-[280px] border-border/35 md:min-h-[300px]'
                        : 'min-h-[240px] border-border/25 md:min-h-[260px]',
                  )}
                  spotlightColor={`color-mix(in oklch, var(--primary) ${isPaidAsk ? 16 : 10}%, transparent)`}
                >
                  <div
                    className="pointer-events-none absolute top-2 right-3 font-heading text-[6.5rem] leading-none font-black text-foreground/[0.04] select-none md:text-[7.5rem]"
                    aria-hidden
                  >
                    {step.num}
                  </div>

                  <div className="relative z-10 flex h-full flex-col">
                    <div className="mb-5 flex items-center gap-3">
                      <span
                        className={cn(
                          'flex size-9 items-center justify-center border',
                          isPaidAsk
                            ? 'border-primary/60 bg-primary/15 text-primary'
                            : 'border-border/40 bg-card/20 text-primary/70',
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="font-mono text-[11px] tracking-[0.28em] text-primary/60 uppercase">
                        Step {step.num}
                      </span>
                    </div>
                    <h3 className="mb-3 font-heading text-xl font-bold tracking-tight text-foreground uppercase md:text-2xl">
                      {step.title}
                    </h3>
                    <p className="mb-8 flex-1 font-body text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {step.body}
                    </p>
                    {step.cta.href === '/memberships' ? (
                      <JoinCrewLink
                        href={step.cta.href}
                        location="home_backstage"
                        className={cn(
                          'group relative inline-flex min-h-11 items-center justify-center gap-2 self-start border px-4 py-2.5 font-heading text-[11px] font-semibold tracking-[0.2em] uppercase transition-all duration-300 focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
                          'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background',
                        )}
                        style={{
                          boxShadow:
                            '0 0 32px color-mix(in oklch, var(--primary) 20%, transparent)',
                        }}
                      >
                        {step.cta.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </JoinCrewLink>
                    ) : (
                      <HomeCta
                        href={step.cta.href}
                        variant="quiet"
                        size="compact"
                        className="self-start"
                      >
                        {step.cta.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </HomeCta>
                    )}
                  </div>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
