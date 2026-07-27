'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { cn } from '@/utilities/ui'

type HomeCtaVariant = 'primary' | 'secondary' | 'quiet'
type HomeCtaSize = 'default' | 'compact'

const variantClasses: Record<HomeCtaVariant, string> = {
  primary:
    'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background focus-visible:ring-primary/60',
  secondary:
    'border-border/50 bg-card/10 text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary focus-visible:ring-primary/40',
  quiet:
    'border-border/30 text-foreground/70 hover:border-primary/40 hover:text-primary focus-visible:ring-primary/30',
}

const sizeClasses: Record<HomeCtaSize, string> = {
  default: 'min-h-12 gap-3 px-6 py-3.5 text-xs tracking-[0.2em]',
  compact: 'min-h-11 gap-2 px-4 py-2.5 text-[11px] tracking-[0.2em]',
}

const baseClassName =
  'group relative inline-flex items-center justify-center border font-heading font-semibold uppercase transition-all duration-300 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none'

/**
 * Single CTA primitive for the homepage. Replaces the previous mix of
 * MagneticCta / ad-hoc Links / accent fills. Magnetic pull is opt-in for
 * hero / final moments only.
 */
export function HomeCta({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'default',
  magnetic = false,
  className,
  type = 'button',
  disabled,
}: {
  href?: string
  onClick?: VoidFunction
  children: React.ReactNode
  variant?: HomeCtaVariant
  size?: HomeCtaSize
  magnetic?: boolean
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const reducedMotion = useReducedMotion()
  const containerRef = useRef<HTMLDivElement>(null)
  const springX = useSpring(0, { stiffness: 300, damping: 25 })
  const springY = useSpring(0, { stiffness: 300, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!magnetic || reducedMotion || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      springX.set((e.clientX - cx) * 0.3)
      springY.set((e.clientY - cy) * 0.3)
    },
    [magnetic, reducedMotion, springX, springY],
  )

  const handleMouseLeave = useCallback(() => {
    springX.set(0)
    springY.set(0)
  }, [springX, springY])

  const classes = cn(
    baseClassName,
    variantClasses[variant],
    sizeClasses[size],
    className,
  )

  const glowStyle =
    variant === 'primary'
      ? {
          boxShadow:
            '0 0 32px color-mix(in oklch, var(--primary) 20%, transparent)',
        }
      : undefined

  const control = href ? (
    <Link href={href} onClick={onClick} className={classes} style={glowStyle}>
      {children}
    </Link>
  ) : (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(classes, disabled && 'opacity-60')}
      style={glowStyle}
    >
      {children}
    </button>
  )

  if (!magnetic || reducedMotion) {
    return control
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <motion.div style={{ x: springX, y: springY }}>{control}</motion.div>
    </div>
  )
}

/** @deprecated Prefer HomeCta — kept as a thin alias during migration. */
export function MagneticCta({
  href,
  onClick,
  children,
  variant = 'primary',
  className,
}: {
  href?: string
  onClick?: VoidFunction
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  return (
    <HomeCta
      href={href}
      onClick={onClick}
      variant={variant === 'ghost' ? 'secondary' : 'primary'}
      magnetic
      className={className}
    >
      {children}
    </HomeCta>
  )
}
