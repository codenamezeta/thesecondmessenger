import type { Variants } from 'motion/react'

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

export const fadeUp: Variants = {
  hidden: { opacity: 1, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeLeft: Variants = {
  hidden: { opacity: 1, x: -32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

export const fadeRight: Variants = {
  hidden: { opacity: 1, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
}

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
}
