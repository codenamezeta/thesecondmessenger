'use client'

import { useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Radio } from 'lucide-react'
import { cn } from '@/utilities/ui'
import {
  formatPremiereDate,
  resolveSongReleaseMs,
} from '@/lib/music/songRelease'

interface ReleaseCountdownProps {
  releaseDate?: string | null
  premiereAt?: string | null
  className?: string
  /** `featured` = large digits; use with `embedded` inside ReleasePresavePanel */
  variant?: 'default' | 'featured'
  /** Drops the outer card shell — parent provides the panel chrome */
  embedded?: boolean
}

type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
}

const EMPTY_COUNTDOWN: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isPast: false,
}

function getCountdown(targetMs: number): CountdownParts {
  const diff = targetMs - Date.now()

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true }
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return { days, hours, minutes, seconds, isPast: false }
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function ReleaseCountdown({
  releaseDate,
  premiereAt,
  className,
  variant = 'default',
  embedded = false,
}: ReleaseCountdownProps) {
  const targetMs = useMemo(
    () => resolveSongReleaseMs(releaseDate, premiereAt),
    [releaseDate, premiereAt],
  )

  const [mounted, setMounted] = useState(false)
  const [parts, setParts] = useState<CountdownParts>(EMPTY_COUNTDOWN)
  const [premiereLabel, setPremiereLabel] = useState<string | null>(null)

  const isFeatured = variant === 'featured'

  useLayoutEffect(() => {
    if (targetMs === null) return

    setMounted(true)
    setPremiereLabel(formatPremiereDate(releaseDate, premiereAt))
    setParts(getCountdown(targetMs))
  }, [targetMs, releaseDate, premiereAt])

  useEffect(() => {
    if (targetMs === null || !mounted) return

    const id = window.setInterval(
      () => setParts(getCountdown(targetMs)),
      1000,
    )
    return () => window.clearInterval(id)
  }, [targetMs, mounted])

  if (targetMs === null) {
    return null
  }

  const segments = [
    { label: 'Days', value: parts.days },
    { label: 'Hrs', value: parts.hours },
    { label: 'Min', value: parts.minutes },
    { label: 'Sec', value: parts.seconds },
  ]

  const inner = (
    <div className={cn('relative', isFeatured && 'space-y-4 md:space-y-5')}>
      <div
        className={cn(
          isFeatured ? 'space-y-2 text-center md:text-left' : 'mb-3 text-center',
        )}
      >
        {isFeatured && (
          <div className="flex items-center justify-center gap-2 font-mono text-[10px] tracking-widest text-primary uppercase md:justify-start">
            <Radio size={12} />
            {'// Incoming Transmission'}
          </div>
        )}
        <p
          className={cn(
            'font-mono tracking-widest uppercase',
            isFeatured
              ? 'font-heading text-lg font-bold text-foreground md:text-2xl'
              : 'text-[10px] text-muted-foreground',
          )}
        >
          {mounted && parts.isPast
            ? 'Transmission Live'
            : isFeatured && mounted && premiereLabel
              ? `Premieres ${premiereLabel}`
              : 'Release Countdown'}
        </p>
      </div>

      {(!mounted || !parts.isPast) && (
        <div
          className={cn(
            'grid grid-cols-4 gap-2 sm:gap-3',
            isFeatured && 'md:gap-4 lg:max-w-none',
          )}
        >
          {segments.map((seg) => (
            <div
              key={seg.label}
              className={cn(
                'flex flex-col items-center justify-center rounded border border-border/60 bg-background/80 px-2 py-2',
                isFeatured &&
                  'min-h-[5.5rem] border-primary/30 bg-background/90 px-3 py-4 shadow-[inset_0_0_20px_hsl(var(--primary)/0.06)] sm:min-h-[6.5rem] md:min-h-[7.5rem]',
              )}
            >
              <span
                className={cn(
                  'font-heading font-bold tabular-nums text-foreground',
                  isFeatured
                    ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                    : 'text-xl',
                )}
              >
                {mounted
                  ? seg.label === 'Days'
                    ? seg.value
                    : pad(seg.value)
                  : '--'}
              </span>
              <span
                className={cn(
                  'mt-1 font-mono tracking-widest text-muted-foreground uppercase',
                  isFeatured ? 'text-[10px] sm:text-xs' : 'text-[9px]',
                )}
              >
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (embedded) {
    return <div className={className}>{inner}</div>
  }

  if (mounted && parts.isPast) {
    return (
      <div
        className={cn(
          'rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-center',
          isFeatured &&
            'border-primary/50 bg-primary/15 py-4 shadow-[0_0_40px_hsl(var(--primary)/0.25)]',
          className,
        )}
      >
        <p
          className={cn(
            'font-mono text-[10px] tracking-widest text-primary uppercase',
            isFeatured && 'text-xs',
          )}
        >
          Transmission Live
        </p>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-primary/20 bg-muted/10 px-4 py-4',
        isFeatured &&
          'relative overflow-hidden border-primary/40 bg-linear-to-br from-primary/15 via-background/90 to-background px-6 py-6 shadow-[0_0_50px_hsl(var(--primary)/0.2)]',
        className,
      )}
    >
      {isFeatured && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.12),transparent_70%)]"
        />
      )}
      {inner}
    </div>
  )
}
