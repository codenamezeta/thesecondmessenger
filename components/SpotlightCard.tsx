'use client'

import React, { useRef, useState } from 'react'
import { cn } from '@/utilities/ui'

interface Position {
  x: number
  y: number
}

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string
  spotlightColor?: string
  /** Soft lift on hover — use for floating (gap) card layouts. */
  elevated?: boolean
  style?: React.CSSProperties
}

/**
 * Pointer-following spotlight panel. Defaults use theme tokens (never
 * hardcoded neutrals). Optional elevation adds a top-edge highlight and
 * a soft ambient shadow so panels sit above the page plane.
 */
const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'color-mix(in oklch, var(--primary) 12%, transparent)',
  elevated = false,
  style,
}) => {
  const divRef = useRef<HTMLDivElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current || isFocused) return
    const rect = divRef.current.getBoundingClientRect()
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={() => {
        setIsFocused(true)
        setOpacity(0.55)
      }}
      onBlur={() => {
        setIsFocused(false)
        setOpacity(0)
      }}
      onMouseEnter={() => setOpacity(0.55)}
      onMouseLeave={() => setOpacity(0)}
      className={cn(
        'group/card relative overflow-hidden border border-border/30 bg-card/5 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300',
        elevated &&
          'shadow-[0_1px_0_0_color-mix(in_oklch,var(--foreground)_8%,transparent)_inset,0_12px_40px_-24px_rgba(0,0,0,0.65)] hover:border-primary/35 hover:bg-card/10 hover:shadow-[0_1px_0_0_color-mix(in_oklch,var(--foreground)_12%,transparent)_inset,0_20px_48px_-20px_rgba(0,0,0,0.75)]',
        className,
      )}
      style={style}
    >
      {/* Top-edge light catch — subtle physicality without heavy shadows */}
      {elevated && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-foreground/15 to-transparent"
        />
      )}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 ease-in-out"
        style={{
          opacity,
          background: `radial-gradient(circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  )
}

export default SpotlightCard
