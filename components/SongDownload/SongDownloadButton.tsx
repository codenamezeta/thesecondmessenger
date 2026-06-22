'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, Loader2, Check, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'

type Props = {
  audioUrl: string | null
  filename: string | null
  title: string
  slug: string | null
  /** When true, the visitor already has an account, so skip the email gate. */
  isLoggedIn: boolean
  className?: string
}

function triggerBrowserDownload(
  audioUrl: string,
  filename: string | null,
  title: string,
): void {
  const link = document.createElement('a')
  link.href = audioUrl
  link.download = filename || `${title}.mp3`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Pay-what-you-want download CTA.
 *
 * Logged-in fans download immediately (we already have their email). Anonymous
 * visitors hit a lightweight email gate that captures them into the mailing
 * list before the free MP3 download, and nudges an optional tip via the
 * membership tiers.
 */
export function SongDownloadButton({
  audioUrl,
  filename,
  title,
  slug,
  isLoggedIn,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)

  if (!audioUrl) return null

  const handleDirectDownload = () => {
    triggerBrowserDownload(audioUrl, filename, title)
  }

  const handleGatedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'newsletter_signup',
          tags: slug ? `song_download:${slug}` : 'song_download',
        }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(data?.error ?? 'Could not start your download.')
      }
      triggerBrowserDownload(audioUrl, filename, title)
      setStatus('done')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('idle')
    }
  }

  if (isLoggedIn) {
    return (
      <Button
        type="button"
        onClick={handleDirectDownload}
        className={cn(
          'flex w-full items-center justify-center gap-2',
          className,
        )}
      >
        <Download size={20} />
        Download MP3 (free)
      </Button>
    )
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'flex w-full items-center justify-center gap-2',
          className,
        )}
      >
        <Download size={20} />
        Download MP3 — pay what you want
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {status === 'done' ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Check className="text-primary" size={20} />
                  Your download is on the way
                </DialogTitle>
                <DialogDescription>
                  Thanks for supporting The Second Messenger. If the download
                  didn&rsquo;t start automatically, use the button below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full rounded-none"
                  onClick={handleDirectDownload}
                >
                  <Download size={18} className="mr-2" />
                  Download again
                </Button>
                <Button
                  asChild
                  variant="default"
                  className="w-full rounded-none"
                >
                  <Link href="/memberships">
                    <Heart size={18} className="mr-2" />
                    Tip the artist / join the Crew
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <form onSubmit={handleGatedSubmit}>
              <DialogHeader>
                <DialogTitle>Download &ldquo;{title}&rdquo;</DialogTitle>
                <DialogDescription>
                  This MP3 is yours for free. Drop your email so we can send you
                  new releases first — and tip the artist if you&rsquo;d like to
                  support the work.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {error && (
                  <p className="text-sm font-semibold text-destructive">
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="download-email">Email</Label>
                  <Input
                    id="download-email"
                    type="email"
                    required
                    value={email}
                    placeholder="your@email.com"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Prefer an account? Free Crew members get instant downloads.{' '}
                  <Link
                    href="/login?tab=register"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    Create a free account
                  </Link>
                  .
                </p>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full rounded-none"
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Preparing…
                    </>
                  ) : (
                    'Email me & download'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
