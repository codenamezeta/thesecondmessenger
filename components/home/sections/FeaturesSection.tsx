'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { Check, Cpu, Music, Radio, Users } from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import { FEATURES } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import {
  fadeUp,
  SECTION_PAD,
  sectionGlow,
  sectionInView,
  stagger,
} from '../homeSectionVariants'

/**
 * Spec-sheet backup for analytical buyers. Compact + hairline console grid
 * (not floating cards) so it feels like data, not another benefit trio.
 */

const GROUP_ICONS = [Music, Radio, Users] as const

export function FeaturesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.compact)}
    >
      <div className="absolute inset-0" style={sectionGlow('whisper')} />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 96px, color-mix(in oklch, var(--border) 14%, transparent) 96px, color-mix(in oklch, var(--border) 14%, transparent) 97px)',
        }}
      />

      <div className="home-shell container relative">
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
            size="sm"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-px bg-border/25 md:grid-cols-3"
        >
          {FEATURES.groups.map((group, groupIndex) => {
            const Icon = GROUP_ICONS[groupIndex] ?? Music
            return (
              <motion.div key={group.title} variants={fadeUp}>
                <SpotlightCard
                  className="h-full rounded-none border-border/20 bg-card/5 p-6 md:p-7 hover:border-primary/25"
                  spotlightColor="color-mix(in oklch, var(--primary) 8%, transparent)"
                >
                  <div className="mb-5 flex items-center gap-3 border-b border-border/20 pb-4">
                    <Icon className="h-4 w-4 text-primary" />
                    <h3 className="font-heading text-sm font-bold tracking-[0.12em] text-foreground uppercase">
                      {group.title}
                    </h3>
                    <span className="ml-auto font-mono text-[10px] tracking-[0.2em] text-primary/40 uppercase">
                      {String(groupIndex + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <ul className="space-y-3">
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
