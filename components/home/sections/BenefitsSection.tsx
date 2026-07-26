'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import {
  Headphones,
  Heart,
  MessageCircle,
  SlidersHorizontal,
} from 'lucide-react'
import SpotlightCard from '@/components/SpotlightCard'
import { BENEFITS } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import { fadeUp, stagger } from '../homeSectionVariants'

/**
 * The emotional differentiator section — deliberately softer than the HUD
 * sections per spec: literal, warm icons (headphones / speech bubble / fader)
 * and a warm accent tint instead of terminal styling. First-person voice.
 */

const ICONS: Record<string, React.ElementType> = {
  headphones: Headphones,
  speech: MessageCircle,
  fader: SlidersHorizontal,
}

export function BenefitsSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      {/* Warm ambient glow — accent, not primary */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 30%, color-mix(in oklch, var(--accent) 9%, transparent), transparent)',
        }}
      />

      <div className="container relative">
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
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {BENEFITS.items.map((benefit) => {
            const Icon = ICONS[benefit.icon] ?? Headphones
            return (
              <motion.div key={benefit.title} variants={fadeUp}>
                <SpotlightCard
                  className="h-full rounded-none border-accent/20 bg-card/10 p-8 backdrop-blur-sm transition-all duration-300 hover:border-accent/50"
                  spotlightColor="color-mix(in oklch, var(--accent) 12%, transparent)"
                >
                  <div
                    className="mb-6 flex h-14 w-14 items-center justify-center border border-accent/40 bg-accent/10"
                    style={{
                      boxShadow:
                        '0 0 25px color-mix(in oklch, var(--accent) 18%, transparent)',
                    }}
                  >
                    <Icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="mb-4 font-heading text-xl leading-snug font-bold tracking-tight text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
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
