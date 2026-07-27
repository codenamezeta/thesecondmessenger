'use client'

import { motion } from 'motion/react'
import { cn } from '@/utilities/ui'
import { HERO_COMMENTS } from '@/lib/home/heroComments'

/**
 * 2–3 ambient "peeking" fan comments floated in the hero halo's negative
 * space behind the artist PNG. Atmosphere, not foreground text: low opacity,
 * slight blur, slow drift. Desktop only (too cluttered on small screens).
 */

const POSITIONS = [
  'top-[40%] left-24 max-w-[240px]',
  'top-[42%] -right-2 max-w-[190px]',
  'top-[67%] left-[2%] max-w-[210px]',
]

export function AmbientComments({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 hidden lg:block',
        className,
      )}
    >
      {HERO_COMMENTS.map((comment, i) => (
        <motion.div
          key={comment.author}
          className={cn('absolute', POSITIONS[i % POSITIONS.length])}
          animate={{ y: [0, i % 2 === 0 ? -10 : 10, 0] }}
          transition={{
            duration: 9 + i * 2.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="border border-accent/50 bg-accent/20 p-3 opacity-40 blur-[0.67px] backdrop-blur-sm">
            <div className="mb-1 font-mono text-[9px] tracking-[0.2em] text-primary/80 uppercase">
              {comment.author}
            </div>
            <p className="font-body text-[11px] leading-snug text-foreground/80 italic">
              &ldquo;{comment.quote}&rdquo;
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
