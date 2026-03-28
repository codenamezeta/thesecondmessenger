'use client'
import React, { useState } from 'react'
import { Send, Check, Loader2, Mail } from 'lucide-react'

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch (err) {
      setStatus('idle')
      alert(err instanceof Error ? err.message : 'Transmission failed.')
      console.error(err)
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
        <Check size={16} className="text-green-500" />
        <p className="font-mono text-xs tracking-widest text-green-500 uppercase">
          Signal Locked.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-primary/20 bg-muted p-6">
      <div className="mb-2 flex items-center gap-3 text-primary">
        <Mail size={18} />
        <h4 className="font-heading text-sm tracking-widest uppercase">
          Join the Network
        </h4>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="ENTER_EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border border-border/50 bg-input px-3 py-2 font-mono text-sm text-foreground outline-none placeholder:text-gray-600 focus:border-primary"
        />
        <button
          disabled={status === 'loading'}
          className="rounded border border-border/50 bg-white/10 p-2 text-foreground hover:bg-border/50"
        >
          {status === 'loading' ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}
