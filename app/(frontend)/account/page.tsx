import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, UserRound } from 'lucide-react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { Media, User } from '@/payload-types'
import { getBillingSummaryForCustomer } from '@/utilities/billing'
import { getMeUser } from '@/utilities/getMeUser'

import { ThemeSelect } from '@/components/ThemeSelect'

import { AccountBillingSection } from './account-billing-section'
import { AccountDataAndPrivacy } from './data-and-privacy'
import { AccountProfileForm } from './profile-form'
// import { Button } from '@/components/ui/button'

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
  favoriteSongId: number | null
  birthdate: string
  gender: string
  notifications: {
    newsletter: boolean
    productUpdates: boolean
    accountActivity: boolean
  }
}

type SongOption = { id: number; title: string }

function readFavoriteSongId(favoriteSong: User['favoriteSong']): number | null {
  if (typeof favoriteSong === 'number') return favoriteSong
  if (favoriteSong && typeof favoriteSong === 'object') return favoriteSong.id
  return null
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
  const { user } = await getMeUser({
    nullUserRedirect: '/login?redirect=/account',
  })

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

  // `stripeCustomerId` is admin-only at the field level, so the access-checked
  // read above strips it for normal users. Re-read it with access overridden so
  // the owner can see their own subscription + invoices on the billing tab.
  const billingIdentity = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
    overrideAccess: true,
  })

  const billing = await getBillingSummaryForCustomer(
    billingIdentity.stripeCustomerId,
  )

  const songsResult = await payload.find({
    collection: 'songs',
    depth: 0,
    limit: 300,
    sort: 'title',
    pagination: false,
  })
  const songOptions: SongOption[] = songsResult.docs
    .map((song) => ({ id: song.id, title: song.title }))
    .filter((song): song is SongOption => Boolean(song.title))

  const notificationSettings = userWithAvatar.notificationSettings

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
    favoriteSongId: readFavoriteSongId(userWithAvatar.favoriteSong),
    birthdate:
      typeof userWithAvatar.birthdate === 'string'
        ? userWithAvatar.birthdate.slice(0, 10)
        : '',
    gender: userWithAvatar.gender ?? '',
    notifications: {
      newsletter: notificationSettings?.newsletter ?? true,
      productUpdates: notificationSettings?.productUpdates ?? true,
      accountActivity: notificationSettings?.accountActivity ?? true,
    },
  }

  return (
    <article className="min-h-screen">
      <div className="container py-3 md:py-4">
        <div className="my-2 flex w-full items-center justify-between">
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

          <Link
            href={`/crew/${userWithAvatar.username}`}
            className="my-6 inline-flex min-h-12 items-center border border-border/50 bg-card/50 px-4 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
          >
            <UserRound className="mr-2" aria-hidden />
            View Profile
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
            Public profile fields are visible to other Crew members. Account
            details are private and used by The Second Messenger team to
            personalize updates and experiences.
          </p>
        </header>

        <AccountProfileForm initialData={initialData} songs={songOptions} />

        <section className="mt-8 space-y-4 border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
              {'// Appearance'}
            </p>
            <h2 className="mt-1 font-heading text-2xl tracking-tight text-foreground uppercase">
              Theme
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Choose your color theme. Your selection saves to your account and
              follows you across devices. Pick &ldquo;Featured&rdquo; to always
              track the site&rsquo;s current featured theme.
            </p>
          </div>
          <ThemeSelect />
        </section>

        <AccountBillingSection
          crewRank={userWithAvatar.crewRank}
          billing={billing}
        />

        <AccountDataAndPrivacy
          youtubeConnected={Boolean(userWithAvatar.youtubeConnected)}
          hasActiveSubscription={Boolean(billing.subscription)}
        />
      </div>
    </article>
  )
}
