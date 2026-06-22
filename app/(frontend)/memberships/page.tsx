import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Check, Shield, Sparkles, Star, UserPlus } from 'lucide-react'

import { getMeUser } from '@/utilities/getMeUser'
import type { User } from '@/payload-types'

type SearchParams = Record<string, string | string[] | undefined>

const RANK_WEIGHT: Record<User['crewRank'], number> = {
  ensign: 0,
  lieutenant: 1,
  commander: 2,
  captain: 3,
  admiral: 4,
}

type CrewTier = {
  rank: 'ensign' | 'lieutenant' | 'commander' | 'captain'
  monthlyPrice: string
  oneLinePitch: string
  vaultClearance: string
  featured?: boolean
  perks: string[]
}

const STRIPE_CHECKOUT_PATH = '/api/stripe/checkout'

const crewTiers: CrewTier[] = [
  {
    rank: 'ensign',
    monthlyPrice: '$0',
    oneLinePitch: 'Observe transmissions, follow releases, and enter the Crew.',
    vaultClearance: 'Public channels only',
    perks: [
      'Ensign profile badge and rank insignia',
      'Mailing list alerts for upcoming releases',
      'Forum read access and restricted replies on official updates',
    ],
  },
  {
    rank: 'lieutenant',
    monthlyPrice: '$2',
    oneLinePitch:
      'Unlock early demos, dailys, and first-level Vault clearance.',
    vaultClearance: 'Lieutenant Vault',
    perks: [
      'Lieutenant profile badge and rank insignia',
      'Mailing list alerts for upcoming releases',
      'Forum post access and restricted replies on official updates',
      'Sonic Time-Lapse checkpoint mixdowns',
      'Lieutenant-level Vault access to demos, alt mixes, and artwork',
      'Voting rights with 1x vote weight',
      'Special Thanks credit in digital liner notes',
      '1% of proceeds support environmental carbon removal',
    ],
  },
  {
    rank: 'commander',
    monthlyPrice: '$10',
    oneLinePitch:
      'Lead from the front with production content, deeper Vault files, and stronger voting power.',
    vaultClearance: 'Commander Vault',
    featured: true,
    perks: [
      'Commander profile badge and rank insignia',
      'Mailing list alerts for upcoming releases',
      'Forum post access and restricted replies on official updates',
      'Sonic Time-Lapse checkpoint mixdowns',
      'Commander-level Vault access to demos, alt mixes, artwork, stems, DI tracks, synth patches, and sheet music',
      'Fly on the Wall monthly screen-share production breakdowns',
      'Merch discount: 5%',
      'Forum thread and poll creation',
      'Voting rights with 2x vote weight',
      '1% of proceeds support environmental carbon removal',
    ],
  },
  {
    rank: 'captain',
    monthlyPrice: '$25',
    oneLinePitch:
      'Join the inner circle with direct artist access and top-tier influence.',
    vaultClearance: 'Captain Vault + Private Channels',
    perks: [
      'Captain profile badge and rank insignia',
      'Mailing list alerts for upcoming releases',
      'Forum post access and restricted replies on official updates',
      'Sonic Time-Lapse checkpoint mixdowns',
      'Captain-level Vault access to demos, alt mixes, artwork, stems, DI tracks, synth patches, and sheet music',
      'Fly on the Wall monthly screen-share production breakdowns',
      'Merch discount: 10%',
      'Forum thread and poll creation',
      'Voting rights with 3x vote weight',
      'Bridge Crew courtesy credit on YouTube and liner notes',
      'Inner Circle monthly virtual hangout',
      'Annual care package with signed and exclusive merch',
      '1% of proceeds support environmental carbon removal',
    ],
  },
]

export const metadata: Metadata = {
  title: 'Crew Memberships | The Second Messenger',
  description:
    'Compare Ensign, Lieutenant, Commander, and Captain plans and choose your Crew access level.',
}

function getFirstParam(value: string | string[] | undefined): string | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] || null : value
}

function normalizeRank(value: string | null): CrewTier['rank'] | null {
  if (!value) return null
  if (
    value === 'ensign' ||
    value === 'lieutenant' ||
    value === 'commander' ||
    value === 'captain'
  ) {
    return value
  }
  return null
}

function formatRank(value: CrewTier['rank'] | null): string {
  if (!value) return 'selected tier'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

type TierCta = {
  href: string
  label: string
  disabled: boolean
  variant: 'default' | 'outline'
}

/**
 * Computes the CTA for a tier card based on the viewer's current rank:
 * - Signed out: register (free) or start a subscription.
 * - Signed in: "Current Plan", "Upgrade to X", or "Downgrade to X". Tier moves
 *   for an existing subscriber are routed to /account, where the billing
 *   actions perform a prorated change; first-time upgrades from Ensign go
 *   straight to Stripe checkout.
 */
function getTierCta(
  rank: CrewTier['rank'],
  currentRank: User['crewRank'] | null,
): TierCta {
  const isPaid = rank !== 'ensign'

  if (!currentRank) {
    return {
      href: isPaid
        ? `${STRIPE_CHECKOUT_PATH}?tier=${rank}`
        : '/login?redirect=/crew&tab=register',
      label: isPaid ? `Start ${formatRank(rank)} Subscription` : 'Create Free Crew Account',
      disabled: false,
      variant: isPaid ? 'default' : 'outline',
    }
  }

  if (currentRank === 'admiral') {
    return {
      href: '/account',
      label: 'Manage in account',
      disabled: false,
      variant: 'outline',
    }
  }

  if (rank === currentRank) {
    return { href: '#', label: 'Current Plan', disabled: true, variant: 'outline' }
  }

  const currentWeight = RANK_WEIGHT[currentRank]
  const tierWeight = RANK_WEIGHT[rank]
  const isUpgrade = tierWeight > currentWeight

  if (isUpgrade) {
    // First paid subscription comes straight from checkout; tier-to-tier
    // upgrades for existing subscribers go through the account billing actions.
    const href =
      currentRank === 'ensign'
        ? `${STRIPE_CHECKOUT_PATH}?tier=${rank}`
        : '/account'
    return {
      href,
      label: `Upgrade to ${formatRank(rank)}`,
      disabled: false,
      variant: 'default',
    }
  }

  return {
    href: '/account',
    label:
      rank === 'ensign'
        ? 'Downgrade to Ensign'
        : `Downgrade to ${formatRank(rank)}`,
    disabled: false,
    variant: 'outline',
  }
}

export default async function MembershipsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const error = getFirstParam(params.error)
  const canceled = getFirstParam(params.canceled)
  const tier = normalizeRank(getFirstParam(params.tier))

  const { user } = await getMeUser()
  const currentRank = user?.crewRank ?? null

  return (
    <main className="relative overflow-hidden bg-transparent py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="relative z-10 container flex flex-col gap-10">
        {error === 'invalid_tier' && (
          <section className="border border-destructive/50 bg-destructive/10 p-4 backdrop-blur-sm md:p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-destructive uppercase">
              {'// Invalid Tier Selection'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The selected tier is not available. Please choose a membership
              plan and try again.
            </p>
          </section>
        )}

        {error === 'invalid_price_config' && (
          <section className="border border-destructive/50 bg-destructive/10 p-4 backdrop-blur-sm md:p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-destructive uppercase">
              {'// Stripe Price Configuration Required'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Checkout for {formatRank(tier)} is not configured yet in this
              Stripe environment. Verify the corresponding{' '}
              <code className="bg-background/70 px-1.5 py-0.5 font-mono text-xs">
                STRIPE_PRICE_*
              </code>{' '}
              value and try again.
            </p>
          </section>
        )}

        {error === 'checkout_unavailable' && (
          <section className="border border-destructive/50 bg-destructive/10 p-4 backdrop-blur-sm md:p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-destructive uppercase">
              {'// Checkout Temporarily Unavailable'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              We could not open Stripe checkout for {formatRank(tier)}. Please
              try again in a moment.
            </p>
          </section>
        )}

        {canceled === '1' && (
          <section className="border border-primary/50 bg-primary/10 p-4 backdrop-blur-sm md:p-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              {'// Checkout Canceled'}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              No charge was made. You can resume {formatRank(tier)} checkout at
              any time.
            </p>
          </section>
        )}

        <section className="flex flex-col gap-5 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-10">
          <p className="font-mono text-[11px] tracking-[0.24em] text-primary uppercase">
            {'// Crew Access Protocol'}
          </p>
          <h1 className="max-w-3xl font-heading text-4xl leading-[0.95] font-semibold tracking-wide text-foreground uppercase md:text-6xl">
            Join The Crew
          </h1>
          <p className="max-w-3xl border-l border-primary/40 pl-4 text-base leading-relaxed text-muted-foreground">
            Choose a membership tier that matches your level of involvement.
            Every rank unlocks more music, more influence, and deeper access to
            The Second Messenger process.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="outline"
              className="rounded-none border-primary/40 bg-background/40 px-3 font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              Show your support
            </Badge>
            <Badge
              variant="outline"
              className="rounded-none border-border/60 bg-background/40 px-3 font-mono text-[10px] tracking-[0.2em] uppercase"
            >
              Upgrade or downgrade anytime
            </Badge>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {crewTiers.map((tier) => {
            const cta = getTierCta(tier.rank, currentRank)
            const isCurrent = currentRank === tier.rank
            return (
            <Card
              key={tier.rank}
              className={`rounded-none border bg-card/20 py-0 shadow-none ring-0 backdrop-blur-md ${
                isCurrent ? 'border-primary/70' : 'border-border/60'
              }`}
            >
              <CardHeader className="rounded-none border-b border-border/50 px-5 py-5 md:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <p className="font-mono text-[11px] tracking-[0.22em] text-primary uppercase">
                      {tier.rank} clearance
                    </p>
                    <CardTitle className="font-heading text-3xl leading-none tracking-wide uppercase">
                      {tier.rank}
                    </CardTitle>
                  </div>

                  {isCurrent ? (
                    <Badge
                      variant="secondary"
                      className="rounded-none border border-primary/50 bg-primary/20 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-primary uppercase"
                    >
                      Your Plan
                    </Badge>
                  ) : tier.featured ? (
                    <Badge
                      variant="secondary"
                      className="rounded-none border border-primary/30 bg-primary/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-primary uppercase"
                    >
                      Most Popular
                    </Badge>
                  ) : null}
                </div>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {tier.oneLinePitch}
                </CardDescription>
              </CardHeader>

              <CardContent className="flex flex-col gap-5 px-5 py-5 md:px-6">
                <div className="flex items-end gap-2">
                  <p className="font-heading text-4xl leading-none text-foreground">
                    {tier.monthlyPrice}
                  </p>
                  <p className="pb-1 font-mono text-xs tracking-[0.18em] text-muted-foreground uppercase">
                    / month
                  </p>
                </div>

                <div className="flex items-center gap-2 border border-primary/35 bg-background/50 px-3 py-2">
                  <Shield className="text-primary" />
                  <span className="font-mono text-xs tracking-[0.15em] text-foreground uppercase">
                    {tier.vaultClearance}
                  </span>
                </div>

                <Separator className="bg-border/60" />

                <ul className="flex flex-col gap-3">
                  {tier.perks.map((perk) => (
                    <li
                      key={perk}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <Sparkles className="mt-0.5 text-primary" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="rounded-none border-t border-border/50 px-5 py-5 md:px-6">
                {cta.disabled ? (
                  <Button
                    variant={cta.variant}
                    size="lg"
                    disabled
                    className="w-full rounded-none border-primary/50 font-mono text-[11px] tracking-[0.2em] uppercase"
                  >
                    <Check data-icon="inline-start" />
                    {cta.label}
                  </Button>
                ) : (
                  <Button
                    asChild
                    variant={cta.variant}
                    size="lg"
                    className="w-full rounded-none border-primary/50 font-mono text-[11px] tracking-[0.2em] uppercase"
                  >
                    <a href={cta.href}>
                      {tier.rank === 'ensign' ? (
                        <UserPlus data-icon="inline-start" />
                      ) : (
                        <Star data-icon="inline-start" />
                      )}
                      {cta.label}
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
            )
          })}
        </section>
      </div>
    </main>
  )
}
