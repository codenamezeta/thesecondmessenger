'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Database } from 'lucide-react'
import { cn } from '@/utilities/ui'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { JoinCrewLink } from '@/components/analytics/JoinCrewLink'
import { FAQ } from '@/lib/home/copy'
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
 * The Debrief. Narrower column + smaller heading — utility, not a peak.
 * CTAs only on questions where a next step naturally follows.
 */

export function FaqSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.compact)}
    >
      <div className="absolute inset-0" style={sectionGlow('whisper', '50% 50%')} />

      <div className="container relative max-w-3xl">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Database}
            eyebrow={FAQ.eyebrow}
            heading={FAQ.heading}
            size="sm"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={fadeUp}
        >
          <Accordion type="single" collapsible className="space-y-px">
            {FAQ.items.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`item-${i}`}
                className="border border-border/25 bg-card/5 backdrop-blur-sm transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:bg-primary/5"
              >
                <AccordionTrigger className="min-h-12 px-5 py-4 text-left font-heading text-sm font-semibold tracking-wide text-foreground/85 uppercase hover:text-foreground hover:no-underline data-[state=open]:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 [&>svg]:text-primary/50 md:px-6 md:text-[15px]">
                  <span className="flex items-baseline gap-3">
                    <span className="shrink-0 font-mono text-[11px] tracking-[0.15em] text-primary/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-5 pb-5 md:px-6 md:pb-6">
                  <div className="space-y-5 border-l-2 border-primary/25 pt-1 pl-4">
                    <p className="font-body text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                      {item.a}
                    </p>
                    {'cta' in item && item.cta && (
                      <div>
                        {item.cta.href === '/memberships' ? (
                          <JoinCrewLink
                            href={item.cta.href}
                            location="home_faq"
                            className="group inline-flex min-h-11 items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2.5 font-heading text-[11px] font-semibold tracking-[0.2em] text-primary uppercase transition-colors hover:bg-primary hover:text-background focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
                          >
                            {item.cta.label}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </JoinCrewLink>
                        ) : (
                          <HomeCta
                            href={item.cta.href}
                            variant="primary"
                            size="compact"
                          >
                            {item.cta.label}
                            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                          </HomeCta>
                        )}
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
