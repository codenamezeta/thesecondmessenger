'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { notifyAuthChanged } from '@/components/Nav/AdminBar'
import { getClientSideURL } from '@/utilities/getURL'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    async function signOut() {
      try {
        await fetch(`${getClientSideURL()}/api/users/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
      } finally {
        if (!cancelled) {
          notifyAuthChanged()
          router.refresh()
          router.replace('/')
        }
      }
    }

    void signOut()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-20">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="font-mono text-xs tracking-widest uppercase">
          Signing out…
        </span>
      </div>
    </div>
  )
}
