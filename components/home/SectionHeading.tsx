'use client'

import { motion, useReducedMotion } from 'motion/react'
import { cn } from '@/utilities/ui'
import DecryptedText from '@/components/DecryptedText'
import { fadeUp, reducedMotionTransition } from './homeSectionVariants'

type HeadingSize = 'lg' | 'md' | 'sm'

const headingSizeClass: Record<HeadingSize, string> = {
  lg: 'text-4xl md:text-6xl lg:text-7xl',
  md: 'text-3xl md:text-5xl lg:text-6xl',
  sm: 'text-3xl md:text-4xl lg:text-5xl',
}

/**
 * Shared eyebrow / heading / subheading block. Composes into a parent
 * `motion` stagger container (each row is a `fadeUp` variant child).
 * Heading and subheading share a left edge — no orphan indent on the body.
 */
export function SectionHeading({
  icon: Icon,
  eyebrow,
  heading,
  subheading,
  align = 'left',
  size = 'md',
  className,
  headingClassName,
}: {
  icon: React.ElementType
  eyebrow: string
  heading: React.ReactNode
  subheading?: React.ReactNode
  align?: 'left' | 'center'
  size?: HeadingSize
  className?: string
  headingClassName?: string
}) {
  const centered = align === 'center'
  const reducedMotion = useReducedMotion()

  return (
    <div className={cn('mb-10 md:mb-14', centered && 'text-center', className)}>
      <motion.div
        variants={fadeUp}
        transition={reducedMotion ? reducedMotionTransition : undefined}
        className={cn(
          'mb-5 flex items-center gap-2.5',
          centered && 'justify-center',
        )}
      >
        <Icon className="size-3.5 text-primary" />
        <DecryptedText
          text={eyebrow}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={30}
          characters="XYZ1234!@#$%^&*()"
          className="font-mono text-[11px] tracking-[0.28em] text-primary uppercase"
          encryptedClassName="font-mono text-[11px] tracking-[0.28em] text-primary/40 uppercase"
        />
      </motion.div>
      <motion.h2
        variants={fadeUp}
        transition={reducedMotion ? reducedMotionTransition : undefined}
        className={cn(
          'font-heading leading-[1.05] font-bold tracking-tight text-foreground uppercase',
          headingSizeClass[size],
          headingClassName,
        )}
      >
        {heading}
      </motion.h2>
      {subheading && (
        <motion.p
          variants={fadeUp}
          transition={reducedMotion ? reducedMotionTransition : undefined}
          className={cn(
            'mt-5 max-w-2xl font-body text-base leading-relaxed text-muted-foreground md:text-lg',
            centered && 'mx-auto',
          )}
        >
          {subheading}
        </motion.p>
      )}
    </div>
  )
}
