'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import { motion, useSpring } from 'motion/react'
import { cn } from '@/utilities/ui'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const springX = useSpring(0, { stiffness: 300, damping: 25 })
  const springY = useSpring(0, { stiffness: 300, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      springX.set((e.clientX - cx) * 0.35)
      springY.set((e.clientY - cy) * 0.35)
    },
    [springX, springY],
  )

  const handleMouseLeave = useCallback(() => {
    springX.set(0)
    springY.set(0)
  }, [springX, springY])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block p-6"
    >
      <motion.div style={{ x: springX, y: springY }}>
        {href ? (
          <Link
            href={href ?? ''}
            onClick={onClick}
            className={cn(
              'group relative inline-flex items-center gap-3 border p-4 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300',
              variant === 'primary'
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background'
                : 'border-border/50 bg-card/10 text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary',
              className,
            )}
            style={
              variant === 'primary'
                ? {
                    boxShadow:
                      '0 0 40px color-mix(in oklch, var(--primary) 22%, transparent)',
                    transition:
                      'background-color 0.3s, color 0.3s, box-shadow 0.3s',
                  }
                : undefined
            }
          >
            {children}
          </Link>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className={cn(
              'group relative inline-flex items-center gap-3 border px-8 py-4 font-mono text-xs tracking-[0.3em] uppercase transition-all duration-300',
              variant === 'primary'
                ? 'border-primary bg-primary/10 text-primary hover:bg-primary hover:text-background'
                : 'border-border/50 bg-card/10 text-foreground backdrop-blur-sm hover:border-primary/50 hover:text-primary',
              className,
            )}
          >
            {children}
          </button>
        )}
      </motion.div>
    </div>
  )
}
