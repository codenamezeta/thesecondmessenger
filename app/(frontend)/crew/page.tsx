// app/(frontend)/crew/page.tsx
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'
import { RankBadge } from '@/components/RankBadges'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

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

export default async function CrewDashboard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const stripeStatus = getFirstParam(params.stripe)
  const selectedTier = normalizeTier(getFirstParam(params.tier))
  const { user } = await getMeUser()

  const now = new Date().toISOString()

  const payload = await getPayload({ config: configPromise })

  const wipSongs = await payload.find({
    collection: 'songs',
    where: {
      or: [
        { releaseDate: { exists: false } },
        { releaseDate: { equals: null } },
        { releaseDate: { greater_than: now } },
      ],
    },
    // Sort by updated date so the song you most recently worked on is at the top
    sort: '-updatedAt',
  })

  if (!user) {
    redirect('/login') // Force login
  }

  return (
    <div className="container mx-auto py-10">
      {stripeStatus === 'success' && (
        <section className="mb-6 border border-primary/50 bg-primary/10 p-4">
          <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            {'// Subscription Activated'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Stripe confirmed your {formatTier(selectedTier)} checkout. Rank
            updates usually appear immediately after webhook processing.
          </p>
        </section>
      )}

      <h1 className="font-mono text-4xl font-bold text-primary">
        Welcome to the Fleet, {user.username}
      </h1>
      <Button asChild>
        <Link href={`/crew/${user.username}`}>View Your Profile</Link>
      </Button>
      <div className="mt-6 flex items-center gap-4">
        <span className="text-xl">Current Rank:</span>
        <RankBadge rank={user.crewRank} />
      </div>

      {/* Conditionally Render Perks */}
      <div className="mt-10 space-y-8">
        <section>
          <h2 className="text-2xl font-bold">Public Comms (Ensign+)</h2>
          <p>Access to the basic mailing list and community forums.</p>
        </section>

        {/* Use a simple weight check on the frontend too, or just check the string */}
        {['lieutenant', 'commander', 'captain'].includes(user.crewRank) && (
          <section className="rounded-lg border border-accent/50 bg-accent/10 p-6">
            <h2 className="text-2xl font-bold text-accent">
              The Vault (Lieutenant+)
            </h2>
            <p>Listen to this week&apos;s unreleased acoustic demo...</p>
            {/* Render Vault audio player here */}
          </section>
        )}

        {['commander', 'captain'].includes(user.crewRank) && (
          <section className="rounded-lg border border-primary/50 bg-primary/10 p-6">
            <h2 className="text-2xl font-bold text-primary">
              Active Directives (Commander+)
            </h2>
            <p>
              Vote on the mix for the upcoming single &quot;Interstellar Love
              Song&quot;.
            </p>
            {/* Render voting component here */}
          </section>
        )}
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold">Active Directives</h2>
        <p>
          Vote on the mix for the upcoming single &quot;Interstellar Love
          Song&quot;.
        </p>
        <ul className="space-y-4">
          {wipSongs.docs.map((song) => (
            <li key={song.id}>
              <h3 className="text-xl font-bold">{song.title}</h3>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
