'use client'

import { useRef } from 'react'
import Image from 'next/image'
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
import {
  fadeUp,
  SECTION_PAD,
  sectionGlow,
  sectionInView,
  stagger,
  staggerFast,
} from '../homeSectionVariants'

/**
 * Social proof before the ask. Hybrid: 3 detailed anchors + hairline grid
 * of short punches. Floating anchors / console grid below — intentional mix.
 */

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
        size === 'large' ? 'h-9 w-9 text-sm' : 'h-7 w-7 text-[11px]',
      )}
    >
      {initial}
    </span>
  )
}

function CommentAvatar({
  comment,
  size = 'default',
}: {
  comment: FandomComment
  size?: 'default' | 'large'
}) {
  if (!comment.avatar) {
    return <InitialAvatar author={comment.author} size={size} />
  }

  return (
    <Image
      src={comment.avatar}
      alt=""
      aria-hidden
      className={cn(
        'shrink-0 border border-primary/30 object-cover',
        size === 'large' ? 'h-9 w-9' : 'h-7 w-7',
      )}
      width={size === 'large' ? 36 : 28}
      height={size === 'large' ? 36 : 28}
    />
  )
}

function SourceLink({ comment }: { comment: FandomComment }) {
  return (
    <a
      href={comment.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex min-h-8 items-center gap-1 font-mono text-[11px] tracking-[0.12em] text-muted-foreground/70 uppercase transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
    >
      via {comment.source}
      <ExternalLink className="h-3 w-3" />
    </a>
  )
}

function StarBrackets() {
  return (
    <span className="font-mono text-[11px] tracking-[0.18em] text-primary">
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
      elevated
      className={cn(
        'flex h-full flex-col rounded-none',
        crownJewel
          ? 'border-primary/40 p-7 hover:border-primary/55 md:p-9'
          : 'border-border/30 p-6 hover:border-primary/30',
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
          crownJewel ? 'text-base md:text-lg' : 'text-sm md:text-[15px]',
        )}
      >
        &ldquo;{comment.quote}&rdquo;
      </blockquote>
      <footer className="mt-5 flex items-center gap-3 border-t border-border/20 pt-4">
        <CommentAvatar comment={comment} size="large" />
        <div className="min-w-0">
          <div className="truncate font-mono text-[11px] tracking-[0.12em] text-primary uppercase">
            {comment.author}
          </div>
          <div className="truncate font-mono text-[11px] tracking-[0.1em] text-muted-foreground/60 uppercase">
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
      className="flex h-full flex-col rounded-none border-border/20 bg-card/5 p-5 hover:border-primary/25"
      spotlightColor="color-mix(in oklch, var(--primary) 8%, transparent)"
    >
      <blockquote className="flex-1 font-body text-sm leading-relaxed text-foreground/80 italic">
        &ldquo;{comment.quote}&rdquo;
      </blockquote>
      <footer className="mt-4 flex items-center gap-2.5">
        <CommentAvatar comment={comment} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-mono text-[11px] tracking-[0.12em] text-primary/90 uppercase">
            {comment.author}
          </div>
          <div className="truncate font-mono text-[11px] tracking-[0.08em] text-muted-foreground/55 uppercase">
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
  const inView = useInView(ref, sectionInView)

  const [crownJewel, ...otherAnchors] = ANCHOR_REVIEWS

  return (
    <section
      ref={ref}
      className={cn('relative overflow-hidden px-4', SECTION_PAD.default)}
    >
      <div className="absolute inset-0" style={sectionGlow('soft')} />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent, transparent 80px, color-mix(in oklch, var(--border) 12%, transparent) 80px, color-mix(in oklch, var(--border) 12%, transparent) 81px)',
        }}
      />

      <div className="home-shell relative container">
        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
        >
          <SectionHeading
            icon={Signal}
            eyebrow={FANDOM.eyebrow}
            heading={FANDOM.heading}
            subheading={FANDOM.subtitle}
            size="md"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={stagger}
          className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-5"
        >
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <AnchorCard comment={crownJewel} crownJewel />
          </motion.div>
          <div className="grid grid-cols-1 gap-5 lg:col-span-2">
            {otherAnchors.map((comment) => (
              <motion.div key={comment.author} variants={fadeUp}>
                <AnchorCard comment={comment} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          variants={staggerFast}
          className="grid grid-cols-1 gap-px bg-border/20 sm:grid-cols-2 lg:grid-cols-4"
        >
          {GRID_REVIEWS.map((comment, i) => (
            <motion.div
              key={comment.author}
              variants={fadeUp}
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
