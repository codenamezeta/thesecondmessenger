'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { EMAIL_BAR } from '@/lib/home/copy'

/**
 * Slim, low-commitment catch for the "not yet" crowd — deliberately quiet
 * relative to the Final CTA below it.
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
          // (schema addition, separate workstream). Sent but ignored for now.
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
      <div className="container flex flex-col items-center justify-between gap-6 lg:flex-row">
        <h2 className="text-center font-body text-base font-semibold text-foreground/90 lg:text-left">
          {EMAIL_BAR.heading}
        </h2>

        {status === 'success' ? (
          <div className="flex items-center gap-3 border border-primary/30 bg-primary/10 px-5 py-3">
            <Check className="size-4 text-primary" />
            <p className="font-mono text-xs tracking-widest text-primary uppercase">
              Signal locked. You&apos;re on the list.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-xl flex-col gap-2 sm:flex-row"
          >
            <input
              type="text"
              autoComplete="name"
              placeholder="Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-12 border border-border/40 bg-input px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary sm:w-40"
            />
            <input
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 flex-1 border border-border/40 bg-input px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground/50 focus:border-primary"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-border/50 bg-card/20 px-5 py-2 font-mono text-[11px] tracking-[0.2em] text-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-60"
            >
              {status === 'loading' ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                EMAIL_BAR.button
              )}
            </button>
          </form>
        )}
      </div>
      {status === 'error' && (
        <p
          role="alert"
          className="container mt-2 text-right font-mono text-[10px] tracking-widest text-destructive uppercase"
        >
          Transmission failed — try again.
        </p>
      )}
    </section>
  )
}
