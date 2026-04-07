// app/(frontend)/crew/page.tsx
import { getMeUser } from '@/utilities/getMeUser'
import { redirect } from 'next/navigation'
// Import your custom rank badge components (e.g., Star Trek style insignia)
import { Badge } from '@/components/ui/badge'

const EnsignBadge = () => <Badge variant="default">Ensign</Badge>
const LieutenantBadge = () => <Badge variant="outline">Lieutenant</Badge>
const CommanderBadge = () => <Badge variant="outline">Commander</Badge>
const CaptainBadge = () => <Badge variant="outline">Captain</Badge>

export default async function CrewDashboard() {
  const { user } = await getMeUser()

  if (!user) {
    redirect('/login') // Force login
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="font-mono text-4xl font-bold text-primary">
        Welcome to the Fleet, {user.name}
      </h1>

      <div className="mt-6 flex items-center gap-4">
        <span className="text-xl">Current Rank:</span>
        {user.crewRank === 'ensign' && <EnsignBadge />}
        {user.crewRank === 'lieutenant' && <LieutenantBadge />}
        {user.crewRank === 'commander' && <CommanderBadge />}
        {user.crewRank === 'captain' && <CaptainBadge />}
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
    </div>
  )
}
