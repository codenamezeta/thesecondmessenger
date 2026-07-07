import type { CSSProperties, ReactNode } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PlatformConfig } from '@/lib/platforms'
import { PlatformIcon } from '@/components/music/PlatformIcon'
import { Badge } from '@/components/ui/badge'

type PlatformLinkTileProps = {
  href: string
  config: PlatformConfig | null
  displayName: string
  description?: string | null
  features?: string[]
  compact?: boolean
}

export function PlatformLinkTile({
  href,
  config,
  displayName,
  description,
  features,
  compact = false,
}: PlatformLinkTileProps) {
  const brandColor = config?.brandColor ?? 'hsl(var(--primary))'
  const isDirectSupport = config?.payoutRank === 1
  const featureList = features ?? config?.features ?? []

  const brandStyle = {
    '--platform-brand': brandColor,
  } as CSSProperties

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={brandStyle}
      title={description ?? undefined}
      className={cn(
        'group relative flex min-h-12 items-center gap-3 rounded-none border bg-card/10 px-3 py-2.5 backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300',
        'border-border/50 hover:border-(--platform-brand) hover:bg-card/20',
        isDirectSupport &&
          'border-primary/25 shadow-[0_0_24px_-8px_var(--platform-brand)] hover:shadow-[0_0_28px_-6px_var(--platform-brand)]',
        compact
          ? 'flex-col items-start gap-2 xl:flex-row xl:items-center'
          : 'flex-row',
      )}
    >
      <span
        className={cn(
          'flex shrink-0 items-center justify-center rounded-none bg-background/60 transition-colors duration-300',
          'group-hover:bg-background/80',
          compact ? 'size-8' : 'size-12',
        )}
      >
        <PlatformIcon
          platformId={config?.id ?? 'unknown'}
          className="text-muted-foreground transition-colors duration-300 group-hover:text-(--platform-brand) border-none"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-body text-sm font-medium tracking-wide text-foreground group-hover:text-(--platform-brand)">
            {displayName}
          </span>
          <ExternalLink
            size={16}
            className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden
          />
        </span>
        {featureList.length > 0 && (
          <span className="mt-1.5 flex flex-wrap gap-1">
            {featureList.map((feature) => (
              <Badge
                key={feature}
                variant="outline"
                className="h-5 rounded-none border-border/40 px-1.5 font-mono text-[9px] tracking-widest uppercase"
              >
                {feature}
              </Badge>
            ))}
          </span>
        )}
      </span>
    </a>
  )
}

export function PlatformDirectoryRow({
  config,
  trailing,
}: {
  config: PlatformConfig
  trailing?: ReactNode
}) {
  const isDirectSupport = config.payoutRank === 1 || config.payoutRank === 2
  const brandStyle = {
    '--platform-brand': config.brandColor,
  } as CSSProperties

  return (
    <a
      href={config.baseUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={brandStyle}
      className={cn(
        'group flex flex-col gap-4 rounded-none border bg-card/10 px-4 py-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-300 sm:px-5',
        'border-border/50 hover:border-(--platform-brand) hover:bg-card/15',
        isDirectSupport &&
          'border-primary/30 shadow-[0_0_32px_-12px_var(--platform-brand)]',
      )}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center border border-border/40 bg-background/50 transition-colors group-hover:border-(--platform-brand)">
          <PlatformIcon
            platformId={config.id}
            className="size-6 text-muted-foreground transition-colors group-hover:text-(--platform-brand)"
          />
        </span>

        <span className="min-w-0 flex-1 space-y-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-heading text-base font-bold tracking-wide text-foreground uppercase group-hover:text-(--platform-brand) sm:text-lg">
              {config.name}
            </span>
            {isDirectSupport && (
              <Badge className="rounded-none bg-primary/15 font-mono text-[9px] tracking-widest text-primary uppercase">
                Direct Support
              </Badge>
            )}
          </span>
          {config.features.length > 0 && (
            <span className="flex flex-wrap gap-1.5">
              {config.features.map((feature) => (
                <Badge
                  key={feature}
                  variant="outline"
                  className="h-5 rounded-none border-primary/20 px-2 font-mono text-[9px] tracking-widest text-muted-foreground uppercase"
                >
                  {feature}
                </Badge>
              ))}
            </span>
          )}
        </span>

        <span className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-(--platform-brand)">
          {trailing}
          <ExternalLink size={16} aria-hidden />
        </span>
      </div>

      {config.description && (
        <p className="font-mono text-xs leading-relaxed text-muted-foreground/80 group-hover:text-muted-foreground">
          {config.description}
        </p>
      )}
    </a>
  )
}
