'use client'

import { motion } from 'motion/react'
import { cn } from '@/utilities/ui'
import DecryptedText from '@/components/DecryptedText'
import { fadeUp } from './homeSectionVariants'

/**
 * Shared eyebrow / heading / subheading block. Composes into a parent
 * `motion` stagger container (each row is a `fadeUp` variant child).
 */
export function SectionHeading({
  icon: Icon,
  eyebrow,
  heading,
  subheading,
  align = 'left',
  className,
  headingClassName,
}: {
  icon: React.ElementType
  eyebrow: string
  heading: React.ReactNode
  subheading?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  headingClassName?: string
}) {
  const centered = align === 'center'

  return (
    <div className={cn('mb-12', centered && 'text-center', className)}>
      <motion.div
        variants={fadeUp}
        className={cn(
          'mb-6 flex items-center gap-2',
          centered && 'justify-center',
        )}
      >
        <Icon className="size-3 text-primary" />
        <DecryptedText
          text={eyebrow}
          animateOn="view"
          sequential
          revealDirection="start"
          speed={30}
          characters="XYZ1234!@#$%^&*()"
          className="font-mono text-[10px] tracking-[0.3em] text-primary uppercase"
          encryptedClassName="font-mono text-[10px] tracking-[0.3em] text-primary/40 uppercase"
        />
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className={cn(
          'font-heading text-4xl font-bold tracking-tight text-foreground uppercase md:text-6xl',
          headingClassName,
        )}
      >
        {heading}
      </motion.h2>
      {subheading && (
        <motion.p
          variants={fadeUp}
          className={cn(
            'mt-4 max-w-2xl font-body text-base leading-relaxed text-muted-foreground',
            centered
              ? 'mx-auto'
              : 'border-l border-primary/30 pl-4',
          )}
        >
          {subheading}
        </motion.p>
      )}
    </div>
  )
}
