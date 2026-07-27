'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'motion/react'
import { ArrowRight, Database } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { JoinCrewLink } from '@/components/analytics/JoinCrewLink'
import { FAQ } from '@/lib/home/copy'
import { SectionHeading } from '../SectionHeading'
import { fadeUp, sectionInView, stagger } from '../homeSectionVariants'

/**
 * The Debrief: expandable data-panel accordions. CTAs live ONLY on the
 * questions where a next step naturally follows (free → register, paid →
 * memberships, streaming → listen) so the buttoned ones feel intentional.
 */

export function FaqSection() {
  const ref = useRef(null)
  const inView = useInView(ref, sectionInView)

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />

      <div className="container relative max-w-4xl">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Database}
            eyebrow={FAQ.eyebrow}
            heading={FAQ.heading}
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
                <AccordionTrigger className="px-6 py-5 text-left font-mono text-xs tracking-[0.1em] text-foreground/80 uppercase hover:text-foreground hover:no-underline data-[state=open]:text-primary [&>svg]:text-primary/50">
                  <span className="flex items-baseline gap-3">
                    <span className="shrink-0 text-primary/40">
                      QUERY_{String(i + 1).padStart(2, '0')}
                    </span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-5 border-l border-primary/30 pt-1 pl-4">
                    <p className="font-body text-sm leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                    {'cta' in item && item.cta && (
                      <div>
                        {item.cta.href === '/memberships' ? (
                          <JoinCrewLink
                            href={item.cta.href}
                            location="home_faq"
                            className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-primary uppercase transition-colors hover:bg-primary hover:text-background"
                          >
                            {item.cta.label}
                            <ArrowRight className="h-3 w-3" />
                          </JoinCrewLink>
                        ) : (
                          <Link
                            href={item.cta.href}
                            className="inline-flex items-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.25em] text-primary uppercase transition-colors hover:bg-primary hover:text-background"
                          >
                            {item.cta.label}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
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
