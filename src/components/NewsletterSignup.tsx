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
      alert('Transmission failed.')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg flex items-center gap-3">
        <Check size={16} className="text-green-500" />
        <p className="text-green-500 font-mono text-xs uppercase tracking-widest">Signal Locked.</p>
      </div>
    )
  }

  return (
    <div className="bg-muted/5 border border-white/10 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-2 text-primary">
        <Mail size={18} />
        <h4 className="font-heading uppercase tracking-widest text-sm">Join the Network</h4>
      </div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          placeholder="ENTER_EMAIL"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-black/50 border border-white/20 rounded px-3 py-2 text-sm text-white focus:border-primary outline-none font-mono placeholder:text-gray-600"
        />
        <button
          disabled={status === 'loading'}
          className="bg-white/10 hover:bg-white/20 border border-white/10 text-white p-2 rounded"
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
