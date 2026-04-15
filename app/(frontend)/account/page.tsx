import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Media, User } from '@/payload-types'
import { getBillingSummaryForCustomer } from '@/utilities/billing'
import { getMeUser } from '@/utilities/getMeUser'

import { AccountBillingSection } from './account-billing-section'
import { AccountProfileForm } from './profile-form'

type AccountProfileInitialData = {
  id: number
  username: string
  firstName: string
  lastName: string
  email: string
  zipCode: string
  bio: string
  displayNameFormat: User['displayNameFormat']
  crewRank: User['crewRank']
  role: User['role']
  youtubeConnected: boolean
  avatarId: number | null
  avatarUrl: string | null
  avatarAlt: string
}

function readAvatar(avatar: User['avatar']): {
  avatarId: number | null
  avatarUrl: string | null
  avatarAlt: string
} {
  if (avatar && typeof avatar === 'object') {
    const media = avatar as Media
    return {
      avatarId: media.id,
      avatarUrl: media.url ?? null,
      avatarAlt: media.alt ?? 'Profile avatar',
    }
  }

  if (typeof avatar === 'number') {
    return {
      avatarId: avatar,
      avatarUrl: null,
      avatarAlt: 'Profile avatar',
    }
  }

  return {
    avatarId: null,
    avatarUrl: null,
    avatarAlt: 'Profile avatar',
  }
}

export default async function AccountPage() {
  const { user } = await getMeUser({ nullUserRedirect: '/login?redirect=/account' })

  if (!user) {
    redirect('/login?redirect=/account')
  }

  const payload = await getPayload({ config: configPromise })
  const userWithAvatar = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 1,
    overrideAccess: false,
    user,
  })
  const avatar = readAvatar(userWithAvatar.avatar)

  const billing = await getBillingSummaryForCustomer(userWithAvatar.stripeCustomerId)

  const initialData: AccountProfileInitialData = {
    id: userWithAvatar.id,
    username: userWithAvatar.username,
    firstName: userWithAvatar.firstName ?? '',
    lastName: userWithAvatar.lastName ?? '',
    email: userWithAvatar.email,
    zipCode:
      typeof userWithAvatar.zipCode === 'number'
        ? String(userWithAvatar.zipCode)
        : '',
    bio: userWithAvatar.bio ?? '',
    displayNameFormat: userWithAvatar.displayNameFormat,
    crewRank: userWithAvatar.crewRank,
    role: userWithAvatar.role,
    youtubeConnected: Boolean(userWithAvatar.youtubeConnected),
    avatarId: avatar.avatarId,
    avatarUrl: avatar.avatarUrl,
    avatarAlt: avatar.avatarAlt,
  }

  return (
    <article className="min-h-screen">
      <div className="container py-8 md:py-12">
        <div className="mb-6">
          <Link
            href="/crew"
            className="group inline-flex min-h-12 items-center gap-2 px-4 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            <ArrowLeft
              size={14}
              className="transition-transform group-hover:-translate-x-1"
              aria-hidden
            />
            Crew Dashboard
          </Link>
        </div>

        <header className="mb-8 space-y-3 border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
            {'// Account Settings'}
          </p>
          <h1 className="font-heading text-3xl tracking-tight text-foreground uppercase md:text-4xl">
            Edit Your Profile
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Public profile fields are visible to other Crew members. Account details are private and
            used by The Second Messenger team to personalize updates and experiences.
          </p>
        </header>

        <AccountProfileForm initialData={initialData} />

        <AccountBillingSection crewRank={userWithAvatar.crewRank} billing={billing} />
      </div>
    </article>
  )
}
