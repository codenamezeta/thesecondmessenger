import { cn } from '@/utilities/ui'

/**
 * Chrome for every homepage section: vertical rhythm, ambient light, texture.
 *
 * Previously each section hardcoded `py-28` and its own radial gradient at an
 * arbitrary position, so the page read as a stack of equal-weight slabs lit
 * from eight different directions. Here the density is chosen per section to
 * build an arc, and the glow sweeps left/right down the page while ramping in
 * intensity toward the final ask.
 */

type SectionDensity = 'slim' | 'tight' | 'default' | 'spacious'

/** Mobile values stay well below desktop — 112px of dead space each side of
 *  eight sections is a lot of thumb travel on a phone. */
const DENSITY_CLASSES: Record<SectionDensity, string> = {
  slim: 'py-12 md:py-16',
  tight: 'py-16 md:py-24',
  default: 'py-20 md:py-32',
  spacious: 'py-24 md:py-40',
}

/** Where the ambient light comes from, and how hot it burns. */
export type GlowSpec = {
  /** CSS position inside the section, e.g. `'78% 30%'`. */
  at: string
  /** Percentage of the token colour mixed into the glow. */
  strength: number
  /** Which token lights the section. */
  color?: 'primary' | 'accent' | 'destructive'
  size?: string
}

type TextureKind = 'none' | 'vertical' | 'horizontal' | 'grid'

const TEXTURE_STYLES: Record<TextureKind, React.CSSProperties | undefined> = {
  none: undefined,
  vertical: {
    backgroundImage:
      'repeating-linear-gradient(90deg, transparent, transparent 80px, color-mix(in oklch, var(--border) 15%, transparent) 80px, color-mix(in oklch, var(--border) 15%, transparent) 81px)',
  },
  horizontal: {
    backgroundImage:
      'repeating-linear-gradient(0deg, transparent, transparent 96px, color-mix(in oklch, var(--border) 12%, transparent) 96px, color-mix(in oklch, var(--border) 12%, transparent) 97px)',
  },
  grid: {
    backgroundImage:
      'linear-gradient(color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklch, var(--primary) 35%, transparent) 1px, transparent 1px)',
    backgroundSize: '64px 64px',
    opacity: 0.1,
  },
}

export function HomeSectionShell({
  children,
  density = 'default',
  glow,
  texture = 'none',
  className,
  containerClassName,
}: {
  children: React.ReactNode
  density?: SectionDensity
  glow?: GlowSpec
  texture?: TextureKind
  className?: string
  containerClassName?: string
}) {
  return (
    <section
      className={cn(
        'tsm-grain relative overflow-hidden px-4',
        DENSITY_CLASSES[density],
        className,
      )}
    >
      {glow && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse ${glow.size ?? '60% 45%'} at ${glow.at}, color-mix(in oklch, var(--${glow.color ?? 'primary'}) ${glow.strength}%, transparent), transparent 70%)`,
          }}
        />
      )}
      {texture !== 'none' && (
        <div
          className="pointer-events-none absolute inset-0"
          style={TEXTURE_STYLES[texture]}
        />
      )}
      {/* Ultrawide cap: the global container runs to 2400px, which lets three
          column grids sprawl while the capped subheadings stay narrow. */}
      <div
        className={cn(
          'relative container max-w-[1600px]',
          containerClassName,
        )}
      >
        {children}
      </div>
    </section>
  )
}
