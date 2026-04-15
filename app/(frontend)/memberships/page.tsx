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
import { Shield, Sparkles, Star, UserPlus } from 'lucide-react'

type SearchParams = Record<string, string | string[] | undefined>

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
      'Everything in Ensign',
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
      'Everything in Lieutenant',
      'Fly on the Wall monthly screen-share production breakdowns',
      'Commander-level Vault access (stems, DI tracks, synth patches, sheet music)',
      'Merch discount: 5%',
      'Forum thread and poll creation',
      'Voting rights with 2x vote weight',
    ],
  },
  {
    rank: 'captain',
    monthlyPrice: '$25',
    oneLinePitch:
      'Join the inner circle with direct artist access and top-tier influence.',
    vaultClearance: 'Captain Vault + Private Channels',
    perks: [
      'Everything in Commander',
      'Bridge Crew courtesy credit on YouTube and liner notes',
      'Inner Circle monthly virtual hangout',
      'Annual care package with signed and exclusive merch',
      'Merch discount: 10%',
      'Voting rights with 3x vote weight',
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

function tierCtaHref(rank: CrewTier['rank']): string {
  if (rank === 'ensign') return '/login?redirect=/crew'
  return `${STRIPE_CHECKOUT_PATH}?tier=${rank}`
}

function tierCtaLabel(rank: CrewTier['rank']): string {
  if (rank === 'ensign') return 'Create Free Crew Account'
  return `Start ${rank} Subscription`
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

  return (
    <main className="relative overflow-hidden bg-transparent py-20 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="container relative z-10 flex flex-col gap-10">
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
              Admiral is invite-only
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
          {crewTiers.map((tier) => (
            <Card
              key={tier.rank}
              className="rounded-none border border-border/60 bg-card/20 py-0 shadow-none ring-0 backdrop-blur-md"
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

                  {tier.featured ? (
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
                <Button
                  asChild
                  variant={tier.rank === 'ensign' ? 'outline' : 'default'}
                  size="lg"
                  className="w-full rounded-none border-primary/50 font-mono text-[11px] tracking-[0.2em] uppercase"
                >
                  <a href={tierCtaHref(tier.rank)}>
                    {tier.rank === 'ensign' ? (
                      <UserPlus data-icon="inline-start" />
                    ) : (
                      <Star data-icon="inline-start" />
                    )}
                    {tierCtaLabel(tier.rank)}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>

        <section className="border border-border/50 bg-card/15 p-5 backdrop-blur-sm md:p-6">
          <p className="mb-2 font-mono text-[10px] tracking-[0.22em] text-primary uppercase">
            {'// Stripe Checkout Ready'}
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Paid tier CTAs route directly to{' '}
            <code className="bg-background/70 px-1.5 py-0.5 font-mono text-xs">
              {STRIPE_CHECKOUT_PATH}
            </code>{' '}
            with the selected tier query parameter.
          </p>
        </section>
      </div>
    </main>
  )
}
