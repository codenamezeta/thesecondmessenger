import Link from 'next/link'
import type { GatedContent, User } from '@/payload-types'
import { userMeetsGatedTier, type GatedTierRequired } from '@/access/crewRanks'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import AudioFilePlayer from '@/components/AudioFilePlayer'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

export type SongGatedBonusRow = {
  rowId: string
  contextNote?: string | null
  gated: GatedContent
}

const TIER_LABEL: Record<GatedTierRequired, string> = {
  lieutenant: 'Lieutenant (Tier 1)',
  commander: 'Commander (Tier 2)',
  captain: 'Captain (Tier 3)',
}

function tierLabel(tier: GatedTierRequired): string {
  return TIER_LABEL[tier]
}

function GatedAssetRenderer({ gated }: { gated: GatedContent }) {
  const src = getMediaUrl(gated.url)
  if (!src) {
    return (
      <p className="font-body text-sm text-muted-foreground">
        This asset is not available to stream yet.
      </p>
    )
  }

  switch (gated.contentType) {
    case 'audio':
      return <AudioFilePlayer title={gated.title} src={src} />
    case 'download':
      return (
        <div className="my-4">
          <Button asChild variant="secondary" className="rounded-none">
            <a href={src} download>
              Download — {gated.title}
            </a>
          </Button>
        </div>
      )
    case 'video':
      return (
        <video
          controls
          className="mt-4 w-full border border-border/50"
          src={src}
          preload="metadata"
        />
      )
    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element -- CMS asset URL
        <img
          src={src}
          alt={gated.title}
          className="mt-4 max-h-[min(70vh,720px)] w-auto border border-border/50 object-contain"
        />
      )
    default: {
      const _exhaustive: never = gated.contentType
      return _exhaustive
    }
  }
}

function LockedBonusRow({
  gated,
  user,
}: {
  gated: GatedContent
  user: User | null | undefined
}) {
  return (
    <div className="rounded-sm border border-dashed border-border/60 bg-background/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-heading text-sm text-foreground">
          {gated.title}
        </span>
        <Badge
          variant="outline"
          className="rounded-none font-mono text-[10px] uppercase"
        >
          {tierLabel(gated.tierRequired)}
        </Badge>
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
        {user
          ? 'Upgrade your crew rank to unlock this asset.'
          : 'Sign in and upgrade to unlock this asset.'}
      </p>
    </div>
  )
}

function VaultTeaser({
  user,
  rows,
  returnPath,
}: {
  user: User | null | undefined
  rows: SongGatedBonusRow[]
  returnPath: string
}) {
  const loginHref = `/login?redirect=${encodeURIComponent(returnPath)}`

  return (
    <div className="relative overflow-hidden rounded-sm border border-dashed border-primary/30 bg-linear-to-b from-primary/5 to-background/80 px-4 py-10 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            'repeating-linear-gradient(-45deg, transparent, transparent 6px, hsl(var(--primary)) 6px, hsl(var(--primary)) 7px)',
        }}
      />
      <div className="relative">
        <Lock className="mx-auto mb-4 h-10 w-10 text-primary" aria-hidden />
        <h3 className="mb-2 font-heading text-xl tracking-wide md:text-2xl">
          Crew exclusives on deck
        </h3>
        <p className="mx-auto mb-6 max-w-lg font-body text-sm text-muted-foreground">
          This transmission includes bonus material in the Vault — demos,
          context, and other files gated by tier. Sign in with Lieutenant
          clearance or higher to stream or download.
        </p>

        {rows.length > 0 && (
          <ul className="mx-auto mb-8 max-w-md list-none space-y-2 border border-border/40 p-4 text-left">
            <li className="font-mono text-[10px] tracking-widest text-primary uppercase">
              {'// '}Included assets (locked)
            </li>
            {rows.map(({ rowId, gated }) => (
              <li
                key={rowId}
                className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-muted-foreground"
              >
                <span className="text-foreground">{gated.title}</span>
                <span className="text-primary">
                  {tierLabel(gated.tierRequired)}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {!user ? (
            <>
              <Button
                asChild
                className="rounded-none font-mono text-xs tracking-widest uppercase"
              >
                <Link href={loginHref}>Sign in</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="rounded-none font-mono text-xs tracking-widest uppercase"
              >
                <Link href="/memberships">View memberships</Link>
              </Button>
            </>
          ) : (
            <Button
              asChild
              className="rounded-none font-mono text-xs tracking-widest uppercase"
            >
              <Link href="/memberships">Upgrade membership</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export function SongGatedBonusSection({
  items,
  user,
  returnPath,
}: {
  items: SongGatedBonusRow[]
  user: User | null | undefined
  returnPath: string
}) {
  if (items.length === 0) return null

  const accessible = items.filter((row) =>
    userMeetsGatedTier(user, row.gated.tierRequired),
  )
  const locked = items.filter(
    (row) => !userMeetsGatedTier(user, row.gated.tierRequired),
  )

  return (
    <section className="space-y-3 rounded-sm border border-border/60 bg-secondary/80 p-6 shadow-xs backdrop-blur-sm md:p-8">
      <p className="font-mono text-xs tracking-widest text-primary uppercase">
        {'// Clearance Accepted. Access Granted'}
      </p>
      <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
        Vault Content
      </h2>
      <Separator />

      {accessible.length === 0 ? (
        <VaultTeaser user={user} rows={items} returnPath={returnPath} />
      ) : (
        <div className="space-y-8">
          {accessible.map(({ rowId, contextNote, gated }, index) => (
            <div key={rowId}>
              {index > 0 ? <Separator className="mb-8" /> : null}
              <h3 className="font-heading text-lg text-foreground">
                {gated.title}
              </h3>
              {contextNote ? (
                <p className="mt-2 font-body text-sm whitespace-pre-wrap text-muted-foreground">
                  {contextNote}
                </p>
              ) : null}
              <GatedAssetRenderer gated={gated} />
            </div>
          ))}

          {locked.length > 0 && (
            <>
              <Separator />
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {'// '}Higher clearance required
              </p>
              <div className="space-y-4">
                {locked.map(({ rowId, gated }) => (
                  <LockedBonusRow key={rowId} gated={gated} user={user} />
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="rounded-none font-mono text-[10px] tracking-widest uppercase"
                >
                  <Link href="/memberships">Upgrade for more</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
