import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Shield, UserRound } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Badge } from '@/components/ui/badge'
import type { Media, User } from '@/payload-types'
import { getMeUser } from '@/utilities/getMeUser'

type Args = {
  params: Promise<{ userSlug: string }>
}

type SafeViewer = User | null

const RANK_LABELS: Record<User['crewRank'], string> = {
  ensign: 'Ensign',
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  captain: 'Captain',
  admiral: 'Admiral',
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function readAvatar(avatar: User['avatar']): { src: string; alt: string } {
  if (avatar && typeof avatar === 'object') {
    const media = avatar as Media
    if (media.url) {
      return {
        src: media.url,
        alt: media.alt || 'Crew profile avatar',
      }
    }
  }

  return {
    src: '/imgs/placeholder-avatar.png',
    alt: 'Crew profile placeholder avatar',
  }
}

function InfoRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[130px_1fr] items-start gap-3 border-b border-border/40 py-3 last:border-b-0">
      <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
      <div className="min-w-0 text-sm text-foreground">{value}</div>
    </div>
  )
}

async function getViewer(): Promise<SafeViewer> {
  try {
    const { user } = await getMeUser()
    return user ?? null
  } catch {
    return null
  }
}

export default async function CrewProfilePage({ params }: Args) {
  const { userSlug } = await params
  const decodedSlug = decodeURIComponent(userSlug)
  const viewer = await getViewer()

  const payload = await getPayload({ config: configPromise })

  const profileQuery = await payload.find({
    collection: 'users',
    depth: 1,
    limit: 1,
    overrideAccess: false,
    user: viewer ?? undefined,
    where: {
      username: {
        equals: decodedSlug,
      },
    },
  })

  const profile = profileQuery.docs[0]
  if (!profile) notFound()

  const { src: avatarSrc, alt: avatarAlt } = readAvatar(profile.avatar)
  const bioLabel = profile.bio?.trim() ? profile.bio : 'No bio added yet.'
  const displayName = profile.displayName?.trim() || profile.username
  const isOwner = Boolean(viewer && viewer.id === profile.id)

  return (
    <article className="min-h-screen">
      <div className="container py-6 md:py-8">
        <div className="my-6">
          <Link
            href="/crew"
            className="group inline-flex min-h-12 items-center gap-2 px-4 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Dashboard
          </Link>
        </div>
        <section className="relative overflow-hidden border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-8">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-border) 2px, var(--color-border) 3px)',
            }}
            aria-hidden
          />

          <div className="relative z-10 grid gap-6 lg:grid-cols-[240px_1fr]">
            <div className="border border-border/50 bg-background/60 p-2">
              <div className="relative aspect-square overflow-hidden border border-border/40 bg-card/30">
                <Image
                  src={avatarSrc}
                  alt={avatarAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 240px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <div className="space-y-4">
              <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
                {'// Crew Manifest Profile'}
              </p>

              <h1 className="font-heading text-3xl tracking-tight text-foreground uppercase md:text-5xl">
                {displayName}
              </h1>

              <p className="font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                @{profile.username}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default" className="rounded-none">
                  {RANK_LABELS[profile.crewRank].toUpperCase()}
                </Badge>
                {profile.role !== 'user' && (
                  <Badge variant="secondary" className="rounded-none">
                    {profile.role.toUpperCase()}
                  </Badge>
                )}
              </div>

              <div className="border-l border-primary/40 pl-4">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {bioLabel}
                </p>
              </div>
            </div>
          </div>
          {isOwner && (
            <div>
              <Link
                href="/account"
                className="my-6 inline-flex min-h-12 items-center border border-border/50 bg-card/50 px-4 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
              >
                Edit Profile
              </Link>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-3">
              <UserRound size={14} className="text-primary" aria-hidden />
              <h2 className="font-mono text-[11px] text-primary uppercase">
                Identity Data
              </h2>
            </div>
            {/* <InfoRow label="First Name" value={profile.firstName} /> */}
            {/* <InfoRow label="Last Name" value={profile.lastName} /> */}
            <InfoRow label="Username" value={`@${profile.username}`} />
            <InfoRow label="Display Name" value={displayName} />
            {/* <InfoRow
              label="Name Format"
              value={formatDisplayNameFormat(profile.displayNameFormat)}
            /> */}
          </div>

          <div className="border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center gap-2">
              <Shield size={14} className="text-primary" aria-hidden />
              <h2 className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
                Account + Crew Status
              </h2>
            </div>
            <InfoRow label="Crew Rank" value={RANK_LABELS[profile.crewRank]} />
            <InfoRow label="Role" value={profile.role} />
            {/* <InfoRow label="Email" value={emailLabel} /> */}
            {/* <InfoRow label="ZIP Code" value={zipLabel} /> */}
            <InfoRow
              label="YouTube Linked"
              value={profile.youtubeConnected ? 'Connected' : 'Not connected'}
            />
          </div>
        </section>

        <section className="mt-6 border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
          <div className="mb-3 flex items-center gap-2">
            <Calendar size={14} className="text-primary" aria-hidden />
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-primary uppercase">
              Record Timeline
            </h2>
          </div>
          <InfoRow label="Created" value={formatDate(profile.createdAt)} />
          <InfoRow label="Last Updated" value={formatDate(profile.updatedAt)} />
        </section>
      </div>
    </article>
  )
}
