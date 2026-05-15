import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

export type ArchivePageStat = {
  value: number | string
  label: string
}

export type ArchivePageHeaderProps = {
  eyebrow?: string | null
  title: string
  description?: string | null
  /** Inline metadata row (e.g. total entries, categories). */
  stats?: ArchivePageStat[] | null
  /** Large right-aligned stat on md+ (e.g. file count). */
  highlightStat?: ArchivePageStat | null
  children?: ReactNode
  className?: string
}

function isPresent(value: string | null | undefined): value is string {
  return value != null && value.trim() !== ''
}

function hasStatValue(value: number | string | null | undefined): boolean {
  return value !== null && value !== undefined && value !== ''
}

function hasHighlightStat(
  stat: ArchivePageStat | null | undefined,
): stat is ArchivePageStat {
  return stat != null && hasStatValue(stat.value) && isPresent(stat.label)
}

function hasInlineStats(
  stats: ArchivePageStat[] | null | undefined,
): stats is ArchivePageStat[] {
  return (
    stats != null &&
    stats.length > 0 &&
    stats.some((s) => hasStatValue(s.value) && isPresent(s.label))
  )
}

export function Header({
  eyebrow,
  title,
  description,
  stats,
  highlightStat,
  children,
  className,
}: ArchivePageHeaderProps) {
  const showEyebrow = isPresent(eyebrow)
  const showDescription = isPresent(description)
  const showInlineStats = hasInlineStats(stats)
  const showHighlight = hasHighlightStat(highlightStat)
  const visibleStats = showInlineStats
    ? stats.filter((s) => hasStatValue(s.value) && isPresent(s.label))
    : []

  return (
    <header
      className={cn('relative overflow-hidden bg-background/50', className)}
    >
      <div
        className="pointer-events-none absolute top-3 left-3 h-8 w-8 border-t-2 border-l-2 border-primary/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-3 right-3 h-8 w-8 border-t-2 border-r-2 border-primary/30"
        aria-hidden
      />

      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.2) 20%, transparent 0%)',
        }}
        aria-hidden
      />

      <div className="relative z-10 container flex flex-col gap-8 pt-12 md:flex-row md:items-end md:justify-between md:gap-6 md:pt-24">
        <div className="flex flex-col items-center space-y-3 md:items-start">
          {showEyebrow && (
            <div className="flex items-center gap-2">
              <div className="h-px w-8 bg-primary/60" />
              <span className="font-mono text-[11px] tracking-[0.25em] text-primary uppercase">
                {eyebrow}
              </span>
            </div>
          )}

          <h1 className="max-w-full overflow-hidden text-center text-4xl font-bold tracking-tight text-foreground uppercase sm:text-5xl md:text-left md:text-7xl">
            {title}
          </h1>

          <div className="h-px w-2/3 bg-linear-to-r from-transparent via-primary/30 to-transparent md:w-full md:max-w-md" />

          {showDescription && (
            <p className="max-w-[45ch] text-center font-mono text-sm text-pretty text-muted-foreground md:max-w-[75ch] md:text-left">
              {description}
            </p>
          )}

          {showInlineStats && (
            <div className="flex flex-wrap items-center justify-center gap-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase md:justify-start">
              {visibleStats.map((stat, index) => (
                <div key={stat.label} className="contents">
                  {index > 0 && (
                    <div className="h-4 w-px bg-border/50" aria-hidden />
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-primary">{stat.value}</span>
                    <span>{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {children}
        </div>

        {showHighlight && (
          <div className="hidden shrink-0 px-2 text-center md:block md:text-right">
            <div className="font-heading text-3xl text-foreground">
              {highlightStat.value}
            </div>
            <div className="font-mono text-[10px] tracking-widest text-primary uppercase">
              {highlightStat.label}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
