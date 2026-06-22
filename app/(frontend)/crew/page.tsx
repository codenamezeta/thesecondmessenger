// app/(frontend)/crew/page.tsx
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Disc3,
  Lock,
  Music,
  Radio,
  Settings,
  ShieldCheck,
  UserRound,
  Vote,
} from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getMeUser } from '@/utilities/getMeUser'
import { RankBadge } from '@/components/RankBadges'
import { userHasLieutenantOrHigher } from '@/access/crewRanks'

type SearchParams = Record<string, string | string[] | undefined>

function getFirstParam(value: string | string[] | undefined): string | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] || null : value
}

function normalizeTier(
  value: string | null,
): 'lieutenant' | 'commander' | 'captain' | null {
  if (!value) return null
  if (value === 'lieutenant' || value === 'commander' || value === 'captain') {
    return value
  }
  return null
}

function formatTier(
  value: 'lieutenant' | 'commander' | 'captain' | null,
): string {
  if (!value) return 'membership'
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function DirectoryCard({
  href,
  icon,
  title,
  description,
  locked,
}: {
  href: string
  icon: ReactNode
  title: string
  description: string
  locked?: boolean
}) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-3 border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-colors hover:border-primary/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-primary">{icon}</span>
        {locked ? (
          <Lock size={14} className="text-muted-foreground" aria-hidden />
        ) : (
          <ArrowRight
            size={16}
            className="text-muted-foreground transition-transform group-hover:translate-x-1"
            aria-hidden
          />
        )}
      </div>
      <div>
        <h3 className="font-heading text-lg tracking-tight text-foreground uppercase">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </Link>
  )
}

export default async function CrewDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const stripeStatus = getFirstParam(params.stripe)
  const selectedTier = normalizeTier(getFirstParam(params.tier))
  const { user } = await getMeUser()

  if (!user) {
    redirect('/login?redirect=/crew')
  }

  const payload = await getPayload({ config: configPromise })
  const now = new Date().toISOString()
  const hasVault = userHasLieutenantOrHigher(user)

  const [latestReleases, wipSongs] = await Promise.all([
    payload.find({
      collection: 'songs',
      where: {
        and: [
          { releaseDate: { exists: true } },
          { releaseDate: { less_than_equal: now } },
        ],
      },
      sort: '-releaseDate',
      limit: 4,
      depth: 1,
    }),
    payload.find({
      collection: 'songs',
      where: {
        or: [
          { releaseDate: { exists: false } },
          { releaseDate: { equals: null } },
          { releaseDate: { greater_than: now } },
        ],
      },
      sort: '-updatedAt',
      limit: 6,
    }),
  ])

  return (
    <div className="container mx-auto py-10">
      {stripeStatus === 'success' && (
        <section className="mb-6 border border-primary/50 bg-primary/10 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            {'// Subscription Activated'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Stripe confirmed your {formatTier(selectedTier)} checkout. Your rank
            below updates as soon as the webhook is processed — if it still looks
            off, open{' '}
            <Link
              href="/account"
              className="text-primary underline-offset-4 hover:underline"
            >
              Account
            </Link>{' '}
            and use &ldquo;Sync from Stripe&rdquo;.
          </p>
        </section>
      )}

      {/* --- HEADER --- */}
      <header className="flex flex-col gap-5 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:flex-row md:items-center md:justify-between md:p-8">
        <div className="space-y-3">
          <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
            {'// Crew Dashboard'}
          </p>
          <h1 className="font-heading text-3xl tracking-tight text-foreground uppercase md:text-4xl">
            Welcome to the Fleet, {user.username}
          </h1>
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Current Rank
            </span>
            <RankBadge rank={user.crewRank} />
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href={`/crew/${user.username}`}
            className="inline-flex min-h-11 items-center gap-2 border border-border/50 bg-background/40 px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
          >
            <UserRound size={14} aria-hidden />
            Profile
          </Link>
          <Link
            href="/account"
            className="inline-flex min-h-11 items-center gap-2 border border-border/50 bg-background/40 px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Settings size={14} aria-hidden />
            Account
          </Link>
        </div>
      </header>

      {/* --- DIRECTORY --- */}
      <section className="mt-8">
        <h2 className="mb-4 font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
          {'// Navigation'}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DirectoryCard
            href="/music"
            icon={<Music size={20} />}
            title="Releases"
            description="Browse every public transmission in the catalog."
          />
          <DirectoryCard
            href="/music/unreleased"
            icon={<Disc3 size={20} />}
            title="Unreleased"
            description="Works in progress and upcoming drops."
          />
          <DirectoryCard
            href="/memberships"
            icon={<ShieldCheck size={20} />}
            title="Memberships"
            description="Compare tiers, upgrade, or manage your clearance."
          />
          <DirectoryCard
            href={hasVault ? '/music/unreleased' : '/memberships'}
            icon={<Lock size={20} />}
            title="The Vault"
            description={
              hasVault
                ? 'Demos, alt mixes, stems, and exclusive files.'
                : 'Lieutenant+ unlocks demos, stems, and exclusives.'
            }
            locked={!hasVault}
          />
          <DirectoryCard
            href="/videos"
            icon={<Radio size={20} />}
            title="Video Channel"
            description="Latest videos and production breakdowns."
          />
          <DirectoryCard
            href={`/crew/${user.username}`}
            icon={<UserRound size={20} />}
            title="Your Profile"
            description="Your public Crew manifest and favorite track."
          />
        </div>
      </section>

      {/* --- LATEST RELEASES --- */}
      {latestReleases.docs.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
              {'// Latest Releases'}
            </h2>
            <Link
              href="/music"
              className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
            >
              View all
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {latestReleases.docs.map((song) => (
              <li key={song.id}>
                <Link
                  href={`/music/${song.slug}`}
                  className="group flex h-full flex-col gap-2 border border-border/50 bg-card/20 p-4 transition-colors hover:border-primary/50"
                >
                  <Music
                    size={16}
                    className="text-primary"
                    aria-hidden
                  />
                  <h3 className="font-heading text-base leading-tight tracking-tight text-foreground uppercase">
                    {song.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* --- ACTIVE DIRECTIVES (Vault tiers) --- */}
      {hasVault && (
        <section className="mt-10 border border-accent/40 bg-accent/5 p-6">
          <div className="mb-3 flex items-center gap-2">
            <Vote size={16} className="text-accent" aria-hidden />
            <h2 className="font-heading text-xl tracking-tight text-foreground uppercase">
              Active Directives
            </h2>
          </div>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Works in progress you can follow and weigh in on as voting opens.
          </p>
          {wipSongs.docs.length > 0 ? (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {wipSongs.docs.map((song) => (
                <li
                  key={song.id}
                  className="border border-border/40 bg-background/30 px-4 py-3 text-sm text-foreground"
                >
                  {song.title}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active directives right now. Check back soon.
            </p>
          )}
        </section>
      )}

      {/* --- UPGRADE NUDGE (Ensign) --- */}
      {!hasVault && (
        <section className="mt-10 border border-primary/40 bg-primary/5 p-6">
          <h2 className="font-heading text-xl tracking-tight text-foreground uppercase">
            Unlock the Vault
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Lieutenant clearance and above opens demos, alt mixes, stems, voting
            rights, and more. Upgrade anytime.
          </p>
          <Link
            href="/memberships"
            className="mt-4 inline-flex min-h-11 items-center gap-2 border border-primary/50 bg-background/40 px-5 py-2 font-mono text-xs tracking-widest text-primary uppercase transition-colors hover:bg-primary/10"
          >
            View Membership Plans
            <ArrowRight size={14} aria-hidden />
          </Link>
        </section>
      )}
    </div>
  )
}
