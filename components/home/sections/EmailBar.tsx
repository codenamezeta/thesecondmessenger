'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { EMAIL_BAR } from '@/lib/home/copy'
import { HomeCta } from '../HomeCta'

/**
 * Slim, low-commitment catch — deliberately quiet relative to Final CTA.
 */
export function EmailBar() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          // TODO: persist name — MailingList has no name field yet
          name: name.trim() || undefined,
          source: 'newsletter_signup',
          tags: 'homepage_email_bar',
        }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="relative border-y border-border/25 bg-card/5 px-4 py-10 backdrop-blur-sm">
      <div className="home-shell container flex flex-col items-center justify-between gap-6 lg:flex-row">
        <h2 className="max-w-md text-center font-body text-base font-semibold text-foreground/90 lg:text-left md:text-lg">
          {EMAIL_BAR.heading}
        </h2>

        {status === 'success' ? (
          <div className="flex items-center gap-3 border border-primary/30 bg-primary/10 px-5 py-3">
            <Check className="size-4 text-primary" />
            <p className="font-mono text-xs tracking-widest text-primary uppercase">
              Signal acquired. You&apos;re on the list.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-3xl flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 flex-1 border border-border/40 bg-input px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <input
              type="text"
              autoComplete="name"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-12 flex-1 border border-border/40 bg-input px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <HomeCta
              type="submit"
              variant="quiet"
              size="compact"
              disabled={status === 'loading'}
              className="min-w-[10rem]"
            >
              {status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                EMAIL_BAR.button
              )}
            </HomeCta>
          </form>
        )}
      </div>
      {status === 'error' && (
        <p
          role="alert"
          className="container mt-2 text-right font-mono text-[11px] tracking-widest text-destructive uppercase"
        >
          Transmission failed — try again.
        </p>
      )}
    </section>
  )
}
