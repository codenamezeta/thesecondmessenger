import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { userHasLieutenantOrHigher } from '@/access/crewRanks'
import { UnreleasedWipList } from '@/components/UnreleasedWipList'
import { getMeUser } from '@/utilities/getMeUser'

export const metadata: Metadata = {
  title: 'Works in Progress | The Second Messenger',
  description:
    'Lieutenant clearance required. Unreleased and in-progress transmissions.',
  robots: { index: false, follow: false },
}

export default async function UnreleasedMusicPage() {
  const { user } = await getMeUser({ nullUserRedirect: '/login' })
  if (!user) {
    redirect('/login')
  }

  if (!userHasLieutenantOrHigher(user)) {
    redirect('/memberships')
  }

  const now = new Date().toISOString()
  const payload = await getPayload({ config: configPromise })

  const songs = await payload.find({
    collection: 'songs',
    where: {
      and: [
        {
          or: [
            { releaseDate: { exists: false } },
            { releaseDate: { equals: null } },
            { releaseDate: { greater_than: now } },
          ],
        },
        { slug: { exists: true } },
        { slug: { not_equals: null } },
      ],
    },
    sort: '-updatedAt',
    limit: 100,
    depth: 0,
  })

  return (
    <main className="container bg-transparent pt-24">
      <div className="mb-12 border-b border-border/50 pb-8">
        <p className="mb-2 font-mono text-[10px] tracking-widest text-primary uppercase">
          {'// '}Vault clearance — works in progress
        </p>
        <h1 className="mb-4 font-heading text-4xl tracking-widest text-foreground uppercase md:text-6xl">
          Unreleased Archive
        </h1>
        <p className="max-w-2xl font-mono text-muted-foreground">
          In-progress transmissions: no release date yet, or scheduled for a
          future drop. Select a file to open the full song page.
        </p>
      </div>

      <UnreleasedWipList songs={songs.docs} />
    </main>
  )
}
