import type { User } from '@/payload-types'
import { cn } from '@/lib/utils'

export type CrewRank = User['crewRank']

export const RANK_BADGE_LABELS: Record<CrewRank, string> = {
  ensign: 'Ensign',
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  captain: 'Captain',
  admiral: 'Admiral',
}

const SIZE_TOKENS = {
  sm: {
    /** No min-height: height follows pips + label + stripe column (see ServiceStripes). */
    root: 'gap-1 px-1.5 py-px',
    pip: 'size-1 gap-px flex-row',
    pipDot: 'size-1',
    label: 'text-[9px] leading-none tracking-[0.2em]',
    stripeW: 'w-4',
  },
  md: {
    root: 'gap-1.5 px-2 py-0.5',
    pip: 'gap-1',
    pipDot: 'size-2',
    label: 'text-[10px] leading-none tracking-[0.22em]',
    stripeW: 'w-5',
  },
  lg: {
    root: 'gap-2 px-2.5 py-1',
    pip: 'gap-1.5 flex-col',
    pipDot: 'size-2.5',
    label: 'text-xs leading-none tracking-[0.24em]',
    stripeW: 'w-6',
  },
} as const

type Size = keyof typeof SIZE_TOKENS

type RankVisual = {
  /** Filled pips (Star Trek–style progression). Ensign uses hollow only. */
  filledPips: 0 | 1 | 2 | 3 | 4
  /** Diagonal service stripes (Navy sleeve–inspired). */
  stripes: 0 | 1 | 2 | 3 | 4
  /** Hollow “recruit” ring for free tier. */
  hollowPip: boolean
  showAdmiralStar: boolean
  root: string
  shell: string
  pipClass: string
  hollowClass: string
  labelClass: string
  stripeClass: string
  shadowClass: string
}

function rankVisual(rank: CrewRank): RankVisual {
  switch (rank) {
    case 'ensign':
      return {
        filledPips: 0,
        stripes: 0,
        hollowPip: true,
        showAdmiralStar: false,
        root: 'text-muted-foreground',
        shell: 'border-muted-foreground/35 bg-muted/25 backdrop-blur-sm',
        pipClass: '',
        hollowClass: 'border-muted-foreground/55 bg-background/20',
        labelClass: 'text-muted-foreground',
        stripeClass: 'text-muted-foreground/25',
        shadowClass: '',
      }
    case 'lieutenant':
      return {
        filledPips: 1,
        stripes: 1,
        hollowPip: false,
        showAdmiralStar: false,
        root: 'text-chart-3',
        shell: 'border-border/80 bg-card/40 backdrop-blur-sm',
        pipClass: 'bg-chart-3 shadow-[inset_0_1px_0_oklch(1_0_0/25%)]',
        hollowClass: '',
        labelClass: 'text-foreground/90',
        stripeClass: 'text-chart-3',
        shadowClass: '',
      }
    case 'commander':
      return {
        filledPips: 2,
        stripes: 2,
        hollowPip: false,
        showAdmiralStar: false,
        root: 'text-accent',
        shell: 'border-accent/40 bg-card/60 backdrop-blur-sm',
        pipClass: 'bg-accent/85 shadow-[inset_0_1px_0_oklch(1_0_0/30%)]',
        hollowClass: '',
        labelClass: 'text-foreground',
        stripeClass: 'text-accent/70',
        shadowClass: 'shadow-sm shadow-accent/10',
      }
    case 'captain':
      return {
        filledPips: 3,
        stripes: 3,
        hollowPip: false,
        showAdmiralStar: false,
        root: 'text-primary',
        shell: 'border-primary/70 bg-card/70 backdrop-blur-md',
        pipClass:
          'bg-primary shadow-[inset_0_1px_0_oklch(1_0_0/35%),0_0_12px_-2px] shadow-primary/50',
        hollowClass: '',
        labelClass: 'text-foreground',
        stripeClass: 'text-primary',
        shadowClass:
          'shadow-[0_0_28px_-4px,inset_0_1px_0_oklch(1_0_0/8%)] shadow-primary/35',
      }
    case 'admiral':
      return {
        filledPips: 4,
        stripes: 4,
        hollowPip: false,
        showAdmiralStar: true,
        root: 'text-primary',
        shell:
          'border-special bg-gradient-to-br from-card/95 via-card/80 to-special/20 backdrop-blur-md',
        pipClass:
          'bg-gradient-to-b from-special via-special to-special shadow-[inset_0_1px_0_oklch(1_0_0/40%),0_0_14px_-2px] shadow-special/55',
        hollowClass: '',
        labelClass: 'text-foreground',
        stripeClass: 'text-special',
        shadowClass:
          'shadow-[0_0_36px_-4px,inset_0_1px_0_oklch(1_0_0/12%)] shadow-special/45',
      }
  }
}

function PipStack({ rank, size }: { rank: CrewRank; size: Size }) {
  const v = rankVisual(rank)
  const tk = SIZE_TOKENS[size]
  const solids = Array.from({ length: v.filledPips }, (_, i) => i)

  return (
    <div
      className={cn('flex shrink-0 items-center', tk.pip, v.root)}
      aria-hidden
    >
      {solids.map((i) => (
        <span
          key={i}
          className={cn(
            tk.pipDot,
            'rounded-full border border-transparent',
            v.pipClass,
          )}
        />
      ))}
      {v.hollowPip ? (
        <span
          className={cn(
            tk.pipDot,
            'rounded-full border-2 bg-transparent',
            v.hollowClass,
          )}
        />
      ) : null}
    </div>
  )
}

function ServiceStripes({
  count,
  stripeClass,
  widthClass,
}: {
  count: number
  stripeClass: string
  widthClass: string
}) {
  if (count <= 0) return null

  return (
    <div
      className={cn(
        'relative shrink-0 self-stretch overflow-hidden border-l border-border/40',
        widthClass,
      )}
      aria-hidden
    >
      <div className={cn('pointer-events-none absolute inset-0', stripeClass)}>
        {Array.from({ length: count }).map((_, i) => (
          <span
            key={i}
            className={cn(
              'absolute bottom-0 left-1/2 block w-px bg-current opacity-[0.85]',
            )}
            style={{
              height: '130%',
              transformOrigin: '50% 100%',
              transform: `translateX(${(i - (count - 1) / 2) * 5}px) rotate(36deg)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function AdmiralStar({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={cn('size-2 shrink-0 text-special', className)}
    >
      <path
        fill="currentColor"
        d="M6 0 7.2 4.3 12 4.3 8.1 6.9 9.4 11.2 6 8.4 2.6 11.2 3.9 6.9 0 4.3l4.8 0z"
      />
    </svg>
  )
}

export type RankBadgeProps = {
  rank: CrewRank
  size?: Size
  /** Show the rank name in HUD caps. */
  showLabel?: boolean
  className?: string
}

/**
 * Crew rank insignia: pip column (à la collar devices) + optional service stripes,
 * tuned so higher tiers read more precious (material, glow, gradient).
 */
export function RankBadge({
  rank,
  size = 'md',
  showLabel = true,
  className,
}: RankBadgeProps) {
  const v = rankVisual(rank)
  const tk = SIZE_TOKENS[size]
  const label = RANK_BADGE_LABELS[rank]

  return (
    <div
      role="img"
      aria-label={`Crew rank: ${label}`}
      className={cn(
        'inline-flex max-w-full items-stretch rounded-none border',
        v.shell,
        v.shadowClass,
        tk.root,
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <PipStack rank={rank} size={size} />
        {showLabel ? (
          <div className="flex min-w-0 flex-row items-center justify-center gap-0.5">
            <span
              className={cn(
                'font-mono font-semibold uppercase',
                tk.label,
                v.labelClass,
              )}
            >
              {label}
            </span>
            {v.showAdmiralStar ? <AdmiralStar /> : null}
          </div>
        ) : null}
      </div>
      <ServiceStripes
        count={v.stripes}
        stripeClass={v.stripeClass}
        widthClass={tk.stripeW}
      />
    </div>
  )
}

export function EnsignBadge(props: Omit<RankBadgeProps, 'rank'>) {
  return <RankBadge rank="ensign" {...props} />
}

export function LieutenantBadge(props: Omit<RankBadgeProps, 'rank'>) {
  return <RankBadge rank="lieutenant" {...props} />
}

export function CommanderBadge(props: Omit<RankBadgeProps, 'rank'>) {
  return <RankBadge rank="commander" {...props} />
}

export function CaptainBadge(props: Omit<RankBadgeProps, 'rank'>) {
  return <RankBadge rank="captain" {...props} />
}

export function AdmiralBadge(props: Omit<RankBadgeProps, 'rank'>) {
  return <RankBadge rank="admiral" {...props} />
}

/** Pass Payload `crewRank` without repeating conditionals on pages. */
export function RankBadgeForUser({
  crewRank,
  ...rest
}: Omit<RankBadgeProps, 'rank'> & { crewRank: CrewRank }) {
  return <RankBadge rank={crewRank} {...rest} />
}
