'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Check, Cpu, Music, Radio, Users } from 'lucide-react'
import SpotlightCard from '@/components/SpotlightCard'
import { FEATURES } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import { fadeUp, sectionInView, stagger } from '../homeSectionVariants'

/**
 * Logic backup for analytical buyers. Neutral voice, full terminal/HUD
 * treatment. Lists what EXISTS — deliberately no tier gating (that question
 * gets answered on /memberships, which drives clicks there).
 */

const GROUP_ICONS = [Music, Radio, Users] as const

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 45% at 80% 20%, color-mix(in oklch, var(--primary) 7%, transparent), transparent)',
        }}
      />
      {/* Horizontal spec-sheet ruling */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 96px, color-mix(in oklch, var(--border) 12%, transparent) 96px, color-mix(in oklch, var(--border) 12%, transparent) 97px)',
        }}
      />

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Cpu}
            eyebrow={FEATURES.eyebrow}
            heading={FEATURES.heading}
            subheading={FEATURES.subheading}
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-px bg-border/20 md:grid-cols-3"
        >
          {FEATURES.groups.map((group, groupIndex) => {
            const Icon = GROUP_ICONS[groupIndex] ?? Music
            return (
              <motion.div key={group.title} variants={fadeUp}>
                <SpotlightCard
                  className="h-full rounded-none border-border/25 bg-card/5 p-7 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
                  spotlightColor="color-mix(in oklch, var(--primary) 8%, transparent)"
                >
                  <div className="mb-6 flex items-center gap-3 border-b border-border/25 pb-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-mono text-xs font-bold tracking-[0.3em] text-foreground uppercase">
                      {group.title}
                    </h3>
                    <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-primary/40 uppercase">
                      {String(groupIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <ul className="space-y-3.5">
                    {group.items.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="font-body text-sm leading-relaxed text-foreground/80">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
