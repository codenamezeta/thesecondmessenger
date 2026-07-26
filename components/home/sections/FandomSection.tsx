'use client'

import { useRef } from 'react'
import { motion, useInView } from 'motion/react'
import { ExternalLink, Signal } from 'lucide-react'
import { cn } from '@/utilities/ui'
import SpotlightCard from '@/components/SpotlightCard'
import { FANDOM } from '@/lib/home/copy'
import {
  ANCHOR_REVIEWS,
  GRID_REVIEWS,
  type FandomComment,
} from '@/lib/home/fandom'
import { SectionHeading } from '../SectionHeading'
import { fadeUp, stagger } from '../homeSectionVariants'

/**
 * Social proof, right before the ask. Hybrid layout per spec: 3 detailed
 * anchor reviews (Ste gets the crown-jewel box) + a grid of short punchy
 * ones. Every comment carries a small avatar + verifiable source link.
 */

/** Initial-letter avatar tile — no hotlinked user images. */
function InitialAvatar({
  author,
  size = 'default',
}: {
  author: string
  size?: 'default' | 'large'
}) {
  const initial = author.replace(/^@/, '').charAt(0).toUpperCase()
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center border border-primary/30 bg-primary/10 font-mono font-bold text-primary',
        size === 'large' ? 'h-9 w-9 text-sm' : 'h-6 w-6 text-[10px]',
      )}
    >
      {initial}
    </span>
  )
}

function SourceLink({ comment }: { comment: FandomComment }) {
  return (
    <a
      href={comment.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 font-mono text-[9px] tracking-[0.15em] text-muted-foreground/60 uppercase transition-colors hover:text-primary"
    >
      via {comment.source}
      <ExternalLink className="h-2.5 w-2.5" />
    </a>
  )
}

function StarBrackets() {
  return (
    <span className="font-mono text-[10px] tracking-[0.2em] text-primary">
      [ ★★★★★ ]
    </span>
  )
}

function AnchorCard({
  comment,
  crownJewel = false,
}: {
  comment: FandomComment
  crownJewel?: boolean
}) {
  return (
    <SpotlightCard
      className={cn(
        'flex h-full flex-col rounded-none bg-card/5 backdrop-blur-sm transition-all duration-300',
        crownJewel
          ? 'border-primary/40 p-8 hover:border-primary/60 md:p-10'
          : 'border-border/25 p-6 hover:border-primary/30',
      )}
      spotlightColor={`color-mix(in oklch, var(--primary) ${crownJewel ? 12 : 8}%, transparent)`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <StarBrackets />
        <SourceLink comment={comment} />
      </div>
      <blockquote
        className={cn(
          'flex-1 font-body leading-relaxed text-foreground/85 italic',
          crownJewel ? 'text-base md:text-lg' : 'text-sm',
        )}
      >
        &ldquo;{comment.quote}&rdquo;
      </blockquote>
      <footer className="mt-5 flex items-center gap-3 border-t border-border/20 pt-4">
        <InitialAvatar author={comment.author} size="large" />
        <div className="min-w-0">
          <div className="truncate font-mono text-[11px] tracking-[0.15em] text-primary uppercase">
            {comment.author}
          </div>
          <div className="truncate font-mono text-[9px] tracking-[0.15em] text-muted-foreground/60 uppercase">
            re: {comment.videoTitle}
          </div>
        </div>
      </footer>
    </SpotlightCard>
  )
}

function GridCard({ comment }: { comment: FandomComment }) {
  return (
    <SpotlightCard
      className="flex h-full flex-col rounded-none border-border/25 bg-card/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-primary/30"
      spotlightColor="color-mix(in oklch, var(--primary) 8%, transparent)"
    >
      <blockquote className="flex-1 font-body text-sm leading-relaxed text-foreground/80 italic">
        &ldquo;{comment.quote}&rdquo;
      </blockquote>
      <footer className="mt-4 flex items-center gap-2.5">
        <InitialAvatar author={comment.author} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[10px] tracking-[0.15em] text-primary/90 uppercase">
            {comment.author}
          </div>
          <div className="truncate font-mono text-[8px] tracking-[0.1em] text-muted-foreground/50 uppercase">
            {comment.videoTitle}
          </div>
        </div>
        <SourceLink comment={comment} />
      </footer>
    </SpotlightCard>
  )
}

export function FandomSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  const [crownJewel, ...otherAnchors] = ANCHOR_REVIEWS

  return (
    <section ref={ref} className="relative overflow-hidden px-4 py-28">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 20% 50%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)',
        }}
      />
      {/* Vertical signal-grid texture */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 80px, color-mix(in oklch, var(--border) 15%, transparent) 80px, color-mix(in oklch, var(--border) 15%, transparent) 81px)',
        }}
      />

      <div className="container relative">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Signal}
            eyebrow={FANDOM.eyebrow}
            heading={FANDOM.heading}
          />
        </motion.div>

        {/* Anchor reviews — crown jewel biggest */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-5"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <AnchorCard comment={crownJewel} crownJewel />
          </motion.div>
          <div className="grid grid-cols-1 gap-6 lg:col-span-2">
            {otherAnchors.map((comment) => (
              <motion.div key={comment.author} variants={fadeUp}>
                <AnchorCard comment={comment} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Short grid — volume + energy */}
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="grid grid-cols-1 gap-px bg-border/15 sm:grid-cols-2 lg:grid-cols-4"
        >
          {GRID_REVIEWS.map((comment, i) => (
            <motion.div
              key={comment.author}
              variants={fadeUp}
              // Longest quote spans 2 cols so the last row stays full
              className={cn(i === 1 && 'lg:col-span-2')}
            >
              <GridCard comment={comment} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
