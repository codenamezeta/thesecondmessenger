'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

import type { Media, User } from '@/payload-types'
import { getClientSideURL } from '@/utilities/getURL'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

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
        alt=""
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
  <div className="container flex h-9 min-h-9 items-center justify-between gap-4 py-1">
    <SessionProfileColumn user={user} />
    <nav
      className="flex shrink-0 items-center gap-3 text-sm font-medium sm:gap-5"
      aria-label="Member shortcuts"
    >
      <Link
        href="/music/unreleased"
        className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
      >
        The Vault
      </Link>
      <Link
        href="/crew"
        className="whitespace-nowrap text-foreground/75 transition-colors hover:text-primary"
      >
        Crew
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

const AdminSessionBar: React.FC<{
  user: User
  onSignOut: () => void
}> = ({ user, onSignOut }) => (
  <div className="container flex h-9 min-h-9 items-center justify-between gap-4 py-1">
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
  const [me, setMe] = useState<User | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    void (async () => {
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
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (me) {
      document.documentElement.style.setProperty('--admin-bar-height', '36px')
    } else {
      document.documentElement.style.removeProperty('--admin-bar-height')
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
      router.refresh()
      router.push('/')
    }
  }, [router])

  const visible = Boolean(me)
  const isAdmin = me?.role === 'admin'

  return (
    <div
      className={cn(
        'min-h-(--admin-bar-height,36px) min-w-full items-center border-b border-white/10 bg-background/85 text-foreground backdrop-blur-3xl',
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
