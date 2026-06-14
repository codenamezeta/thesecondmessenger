'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
          router.replace('/')
          router.refresh()
        }
      }
    }

    void signOut()

    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <section className="container flex min-h-[50vh] flex-col items-center justify-center p-12 text-center">
      <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        Signing out…
      </p>
    </section>
  )
}
