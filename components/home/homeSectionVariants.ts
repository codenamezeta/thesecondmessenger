import type { CSSProperties } from 'react'
import type { Transition, Variants } from 'motion/react'

/**
 * Shared scroll-trigger for homepage sections.
 * Negative vertical margin shrinks the intersection root so animations
 * fire when content reaches ~mid-viewport — not as soon as it peeks in
 * from the bottom edge.
 */
export const sectionInView = {
  once: true,
  margin: '-30% 0px' as const,
} as const

const easeOut: Transition['ease'] = [0.22, 1, 0.36, 1]

const enterTransition: Transition = {
  duration: 0.9,
  ease: easeOut,
}

/** Instant / no-op transition when the visitor prefers reduced motion. */
export const reducedMotionTransition: Transition = {
  duration: 0.01,
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: enterTransition,
  },
}

export const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: enterTransition,
  },
}

export const fadeRight: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: enterTransition,
  },
}

export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: enterTransition,
  },
}

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.04 },
  },
}

/** Faster stagger for dense grids (music cards, fandom tiles). */
export const staggerFast: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.02 },
  },
}

/**
 * Section vertical rhythm — peaks get air, supporting sections compress.
 * Use with `cn('relative overflow-hidden px-4', SECTION_PAD.peak)`.
 */
export const SECTION_PAD = {
  peak: 'py-24 md:py-36 lg:py-40',
  default: 'py-20 md:py-28',
  compact: 'py-14 md:py-20',
  close: 'py-28 md:py-40 lg:py-48',
} as const

/**
 * Ambient primary glow — consistent upper-right light source so consecutive
 * sections don't feel randomly lit. Intensity steps toward the Final CTA.
 */
export function sectionGlow(
  intensity: 'whisper' | 'soft' | 'medium' | 'strong' = 'soft',
  position = '78% 28%',
): CSSProperties {
  const amount = {
    whisper: 5,
    soft: 8,
    medium: 12,
    strong: 16,
  }[intensity]

  return {
    background: `radial-gradient(ellipse 65% 50% at ${position}, color-mix(in oklch, var(--primary) ${amount}%, transparent), transparent 70%)`,
  }
}
