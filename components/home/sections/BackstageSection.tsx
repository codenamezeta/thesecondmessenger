'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Crown, Play, Unlock, UserPlus } from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import { JoinCrewLink } from '@/components/analytics/JoinCrewLink'
import { BACKSTAGE } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import { fadeUp, stagger } from '../homeSectionVariants'

/**
 * The escalation ladder: free listen → free account → paid membership.
 * Visual accent escalates with the ask (step 3 gets the strongest glow).
 */

const STEP_ICONS = [Play, UserPlus, Crown] as const

export function BackstageSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, color-mix(in oklch, var(--primary) 9%, transparent), transparent)',
        }}
      />

      <div className="container relative">
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
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {BACKSTAGE.steps.map((step, i) => {
            const Icon = STEP_ICONS[i] ?? Play
            const isPaidAsk = i === 2

            const ctaClassName = cn(
              'mt-8 inline-flex items-center gap-2 self-start border px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] uppercase transition-colors',
              isPaidAsk
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background'
                : 'border-border/30 text-foreground/60 hover:border-primary/40 hover:text-primary',
            )

            return (
              <motion.div key={step.num} variants={fadeUp}>
                <SpotlightCard
                  className={cn(
                    'flex h-full flex-col rounded-none bg-card/5 p-8 backdrop-blur-sm transition-all duration-300',
                    isPaidAsk
                      ? 'border-primary/40 hover:border-primary/70'
                      : 'border-border/25 hover:border-primary/30',
                  )}
                  spotlightColor={`color-mix(in oklch, var(--primary) ${isPaidAsk ? 14 : 10}%, transparent)`}
                >
                  {/* Massive faint step number — layered typography */}
                  <div
                    className="pointer-events-none absolute -top-4 right-2 font-heading text-[9rem] leading-none font-black text-foreground/5 select-none"
                    aria-hidden
                  >
                    {step.num}
                  </div>

                  <div className="relative z-10 flex h-full flex-col">
                    <Icon
                      className={cn(
                        'mb-6 h-5 w-5',
                        isPaidAsk ? 'text-primary' : 'text-primary/70',
                      )}
                    />
                    <div className="mb-2 font-mono text-[10px] tracking-[0.3em] text-primary/60 uppercase">
                      Step {step.num}
                    </div>
                    <h3 className="mb-4 font-heading text-2xl font-bold tracking-tight text-foreground uppercase">
                      {step.title}
                    </h3>
                    <p className="flex-1 border-l border-primary/20 pl-4 font-body text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                    {step.cta.href === '/memberships' ? (
                      <JoinCrewLink
                        href={step.cta.href}
                        location="home_backstage"
                        className={ctaClassName}
                      >
                        {step.cta.label}
                        <ArrowRight className="h-3 w-3" />
                      </JoinCrewLink>
                    ) : (
                      <Link href={step.cta.href} className={ctaClassName}>
                        {step.cta.label}
                        <ArrowRight className="h-3 w-3" />
                      </Link>
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
