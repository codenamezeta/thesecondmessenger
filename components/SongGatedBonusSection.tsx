import Link from 'next/link'
import type { GatedContent, User } from '@/payload-types'
import {
  gatedAssetTier,
  userMeetsGatedFileAccess,
  userMeetsVaultFloor,
  type GatedTierRequired,
} from '@/access/crewRanks'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { UnlockableGatedAsset } from '@/components/UnlockableGatedAsset'

export type SongGatedBonusRow = {
  rowId: string
  description?: string | null
  asset: GatedContent
}

const TIER_LABEL: Record<GatedTierRequired, string> = {
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  captain: 'Captain',
}

function tierLabel(tier: GatedTierRequired): string {
  return TIER_LABEL[tier]
}

function LockedBonusRow({
  title,
  requiredTier,
  user,
}: {
  title: string
  requiredTier: GatedTierRequired
  user: User | null | undefined
}) {
  return (
    <div className="rounded-sm border border-dashed border-border/60 bg-background/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Lock className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className="font-heading text-sm text-foreground">{title}</span>
        <Badge
          variant="outline"
          className="rounded-none font-mono text-[10px] uppercase"
        >
          {tierLabel(requiredTier)}
        </Badge>
      </div>
      <p className="mt-2 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
        {user
          ? 'Upgrade your crew rank to access this file.'
          : 'Sign in and upgrade to access this file.'}
      </p>
    </div>
  )
}

function VaultMarketingTeaser({
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
          clearance or higher to access them.
        </p>

        {rows.length > 0 && (
          <ul className="mx-auto mb-8 max-w-md list-none space-y-2 border border-border/40 p-4 text-left">
            <li className="font-mono text-[10px] tracking-widest text-primary uppercase">
              {'// '}Included assets (locked)
            </li>
            {rows.map(({ rowId, asset }) => (
              <li
                key={rowId}
                className="space-y-1 border-b border-border/20 py-2 font-mono text-xs text-muted-foreground last:border-b-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-foreground">{asset.title}</span>
                </div>
                <div className="text-[10px] uppercase">
                  <span>
                    Clearance required:{' '}
                    <span className="text-primary">
                      {tierLabel(gatedAssetTier(asset.tierRequired))}
                    </span>
                  </span>
                </div>
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

  const vaultFloor = userMeetsVaultFloor(user)

  if (!vaultFloor) {
    return (
      <section className="space-y-3 rounded-sm border border-border/60 bg-secondary/80 p-6 shadow-xs backdrop-blur-sm md:p-8">
        <p className="font-mono text-xs tracking-widest text-primary uppercase">
          {'// Clearance Accepted. Access Granted'}
        </p>
        <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
          Vault Content
        </h2>
        <Separator />
        <VaultMarketingTeaser
          user={user}
          rows={items}
          returnPath={returnPath}
        />
      </section>
    )
  }

  const unlocked = items.filter((row) =>
    userMeetsGatedFileAccess(user, row.asset.tierRequired),
  )
  const locked = items.filter(
    (row) => !userMeetsGatedFileAccess(user, row.asset.tierRequired),
  )

  return (
    <section className="space-y-3 rounded-sm border border-border/60 bg-secondary/80 p-6 shadow-xs backdrop-blur-sm md:p-8">
      <p className="font-mono text-xs tracking-widest text-primary uppercase">
        {'// Clearance Accepted. Access Granted'}
      </p>
      <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
        Vault Content
      </h2>
      {unlocked.length === 0 ? (
        locked.length > 0 ? (
          <div className="space-y-4">
            <Separator />
            <p className="font-body text-sm text-muted-foreground">
              Your clearance does not yet include these files.
            </p>
            <div className="space-y-4">
              {locked.map(({ rowId, asset }) => (
                <LockedBonusRow
                  key={rowId}
                  title={asset.title}
                  requiredTier={gatedAssetTier(asset.tierRequired)}
                  user={user}
                />
              ))}
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-none font-mono text-[10px] tracking-widest uppercase"
            >
              <Link href="/memberships">Upgrade for more</Link>
            </Button>
          </div>
        ) : null
      ) : (
        <div className="space-y-8">
          {unlocked.map(({ rowId, asset }) => (
            <div key={rowId} className="space-y-4">
              <Separator />
              <div className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                <span>
                  Clearance required:{' '}
                  <span className="text-primary">
                    {tierLabel(gatedAssetTier(asset.tierRequired))}
                  </span>
                </span>
              </div>
              <UnlockableGatedAsset gated={asset} />
            </div>
          ))}

          {locked.length > 0 && (
            <>
              <Separator />
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {'// '}Higher clearance required
              </p>
              <div className="space-y-4">
                {locked.map(({ rowId, asset }) => (
                  <LockedBonusRow
                    key={rowId}
                    title={asset.title}
                    requiredTier={gatedAssetTier(asset.tierRequired)}
                    user={user}
                  />
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
