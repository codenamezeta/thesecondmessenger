'use client'

import SpotlightCard from '@/components/SpotlightCard'
import { cn } from '@/utilities/ui'

/**
 * The single card surface for the homepage.
 *
 * Consolidates the six ad-hoc paddings and nine border opacities the sections
 * had drifted into, and adds the depth the flat outlined panels were missing:
 * a 1px top highlight (reads as light from above) plus an ambient shadow that
 * lifts on hover. Corners stay square per the art direction.
 */

type PanelPadding = 'none' | 'compact' | 'default' | 'feature'
type PanelTone = 'default' | 'primary' | 'accent'

const PADDING_CLASSES: Record<PanelPadding, string> = {
  none: 'p-0',
  compact: 'p-5',
  default: 'p-6 md:p-8',
  feature: 'p-8 md:p-10',
}

const TONE_CLASSES: Record<PanelTone, string> = {
  default: 'border-border/25 hover:border-primary/40',
  primary: 'border-primary/40 hover:border-primary/70',
  accent: 'border-accent/25 hover:border-accent/55',
}

const TONE_SPOTLIGHT: Record<PanelTone, string> = {
  default: 'color-mix(in oklch, var(--primary) 9%, transparent)',
  primary: 'color-mix(in oklch, var(--primary) 14%, transparent)',
  accent: 'color-mix(in oklch, var(--accent) 12%, transparent)',
}

/**
 * `inset 0 1px 0` is the cheap physical trick: a single lighter pixel along
 * the top edge implies an overhead light source and stops the panel reading
 * as a flat outline drawn onto the page.
 */
const ELEVATION = {
  boxShadow: [
    'inset 0 1px 0 0 color-mix(in oklch, var(--foreground) 7%, transparent)',
    '0 2px 10px -6px rgba(0,0,0,0.85)',
    '0 12px 32px -24px rgba(0,0,0,0.9)',
  ].join(', '),
} as const

export function HomePanel({
  children,
  padding = 'default',
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  padding?: PanelPadding
  tone?: PanelTone
  className?: string
}) {
  return (
    <SpotlightCard
      className={cn(
        'h-full rounded-none bg-card/[0.06] backdrop-blur-sm transition-[border-color,background-color,box-shadow,transform] duration-300 hover:bg-card/10',
        PADDING_CLASSES[padding],
        TONE_CLASSES[tone],
        className,
      )}
      spotlightColor={TONE_SPOTLIGHT[tone]}
      style={ELEVATION}
    >
      {children}
    </SpotlightCard>
  )
}
