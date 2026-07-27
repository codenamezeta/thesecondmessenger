'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import {
  Headphones,
  Heart,
  MessageCircle,
  SlidersHorizontal,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import { BENEFITS } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import {
  fadeUp,
  SECTION_PAD,
  sectionInView,
  stagger,
} from '../homeSectionVariants'

/**
 * Emotional differentiator — intentionally softer than the HUD sections:
 * warm accent glow, literal icons, floating elevated cards. Compact vertical
 * rhythm so it reads as connective tissue between PAS and Backstage.
 */

const ICONS: Record<string, React.ElementType> = {
  headphones: Headphones,
  speech: MessageCircle,
  fader: SlidersHorizontal,
}

export function BenefitsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.compact)}
    >
      {/* Warm accent — the one place accent owns the atmosphere */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 55% at 50% 40%, color-mix(in oklch, var(--accent) 10%, transparent), transparent 70%)',
        }}
      />

      <div className="home-shell container relative">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Heart}
            eyebrow={BENEFITS.eyebrow}
            heading={BENEFITS.heading}
            align="center"
            size="sm"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6"
        >
          {BENEFITS.items.map((benefit) => {
            const Icon = ICONS[benefit.icon] ?? Headphones
            return (
              <motion.div key={benefit.title} variants={fadeUp}>
                <SpotlightCard
                  elevated
                  className="h-full rounded-none border-accent/25 bg-card/10 p-7 md:p-8 hover:border-accent/45"
                  spotlightColor="color-mix(in oklch, var(--accent) 14%, transparent)"
                >
                  <div
                    className="mb-5 flex size-12 items-center justify-center border border-accent/40 bg-accent/10"
                    style={{
                      boxShadow:
                        '0 0 28px color-mix(in oklch, var(--accent) 20%, transparent)',
                    }}
                  >
                    <Icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mb-3 font-heading text-lg leading-snug font-bold tracking-tight text-foreground md:text-xl">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                    {benefit.body}
                  </p>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
