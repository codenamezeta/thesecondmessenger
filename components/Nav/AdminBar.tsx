'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import type { Media, User } from '@/payload-types'
import { memberNavItems } from '.'
import { getClientSideURL } from '@/utilities/getURL'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

/**
 * Event name dispatched on `window` whenever the auth state changes outside
 * of a route transition (e.g. programmatic sign-out). `AdminBar` listens for
 * this event in addition to re-checking on pathname changes, so the session
 * UI never gets out of sync with the actual cookie state.
 */
const AUTH_CHANGED_EVENT = 'tsm:auth-changed'

/** Dispatches the auth-changed event; safe to call from any client code. */
export const notifyAuthChanged = (): void => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}

function memberAvatarSrc(user: User): string {
  const avatar = user.avatar
  if (avatar && typeof avatar === 'object') {
    const url = (avatar as Media).url
    if (url) return getMediaUrl(url) || '/imgs/placeholder-avatar.png'
  }
  return '/imgs/placeholder-avatar.png'
}

function memberDisplayName(user: User): string {
  return user.displayName?.trim() || user.username || user.email || 'Messenger'
}

const SessionProfileColumn: React.FC<{ user: User }> = ({ user }) => {
  const label = memberDisplayName(user)
  const src = memberAvatarSrc(user)

  return (
    <Link
      href="/account"
      className="flex max-w-[55%] min-w-0 items-center gap-2 text-foreground transition-colors hover:text-primary sm:max-w-none"
    >
      <Image
        src={src}
        alt="Profile Avatar"
        width={24}
        height={24}
        unoptimized
        className="size-6 shrink-0 border border-border/50 object-cover"
      />
      <span className="truncate text-sm font-medium tracking-tight">
        {label}
      </span>
    </Link>
  )
}

const MemberSessionBar: React.FC<{
  user: User
  onSignOut: () => void
}> = ({ user, onSignOut }) => (
  <div className="container flex h-(--admin-bar-height) min-h-6 items-center justify-between gap-4 py-1">
    <SessionProfileColumn user={user} />
    <nav
      className="flex shrink-0 items-center gap-2 pr-1 text-xs font-medium sm:gap-3"
      aria-label="Member shortcuts"
    >
      {memberNavItems.map((item) =>
        item.type === 'link' ? (
          <Link
            key={item.label}
            href={item.href}
            className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
          >
            {item.label}
          </Link>
        ) : (
          <div key={item.label}>{item.label}</div>
        ),
      )}
    </nav>
  </div>
)

const AdminSessionBar: React.FC<{
  user: User
  onSignOut: () => void
}> = ({ user, onSignOut }) => (
  <div className="container flex h-8 min-h-8 items-center justify-between gap-4 py-1">
    <SessionProfileColumn user={user} />
    <nav
      className="flex shrink-0 items-center gap-3 text-sm font-medium sm:gap-5"
      aria-label="Admin shortcuts"
    >
      <Link
        href="/admin"
        className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
      >
        Dashboard
      </Link>
      <Link
        href="/admin/collections/posts/create"
        className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
      >
        New Post
      </Link>
      <button
        type="button"
        onClick={onSignOut}
        className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
      >
        Sign out
      </button>
    </nav>
  </div>
)

export const AdminBar: React.FC = () => {
  const router = useRouter()
  // `pathname` is used as an effect dependency so that the auth check re-runs
  // on every route transition. Without this the bar gets stuck in whatever
  // state it had when the nav first mounted — since the nav is persistent
  // across App Router navigations, the component never remounts on its own,
  // so logging in from `/login` would otherwise never update `me`.
  const pathname = usePathname()
  const [me, setMe] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    const fetchMe = async () => {
      try {
        const res = await fetch(`${getClientSideURL()}/api/users/me?depth=1`, {
          credentials: 'include',
          method: 'GET',
        })
        const data: { user?: User | null } = await res.json()
        if (cancelled) return
        setMe(data.user ?? null)
      } catch {
        if (!cancelled) setMe(null)
      }
    }

    void fetchMe()

    // Pick up explicit auth changes that don't involve a route transition
    // (e.g. the sign-out button, or a future refresh-token flow).
    const handleAuthChanged = () => {
      void fetchMe()
    }
    window.addEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)

    return () => {
      cancelled = true
      window.removeEventListener(AUTH_CHANGED_EVENT, handleAuthChanged)
    }
  }, [pathname])

  useEffect(() => {
    if (me) {
      document.documentElement.style.setProperty('--admin-bar-height', '36px')
    } else {
      document.documentElement.style.setProperty('--admin-bar-height', '0px')
    }
  }, [me])

  const onSignOut = useCallback(async () => {
    try {
      await fetch(`${getClientSideURL()}/api/users/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })
    } finally {
      setMe(null)
      notifyAuthChanged()
      router.refresh()
      router.push('/')
    }
  }, [router])

  const visible = Boolean(me)
  const isAdmin = me?.role === 'admin'

  return (
    <div
      className={cn(
        'min-h-(--admin-bar-height,36px) min-w-full items-center border-b border-white/10 bg-transparent backdrop-blur-3xl',
        {
          flex: visible,
          hidden: !visible,
        },
      )}
    >
      {me &&
        (isAdmin ? (
          <AdminSessionBar user={me} onSignOut={onSignOut} />
        ) : (
          <MemberSessionBar user={me} onSignOut={onSignOut} />
        ))}
    </div>
  )
}
