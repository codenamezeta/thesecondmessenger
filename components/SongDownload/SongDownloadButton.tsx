'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { Download, Loader2, Check, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/utilities/ui'
import { getStripeBrowserClient } from '@/lib/stripe/browserClient'
import { STRIPE_MIN_TIP_CENTS } from '@/utilities/stripe'
import { SongDownloadTipPayment } from '@/components/SongDownload/SongDownloadTipPayment'

const TIP_PRESETS_CENTS = [100, 200, 500, 1000] as const

type Props = {
  audioUrl: string | null
  filename: string | null
  title: string
  slug: string | null
  isLoggedIn: boolean
  userEmail?: string | null
  className?: string
}

type TipMode = 'paid' | 'free'

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

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

function parseCustomAmountToCents(value: string): number | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const dollars = Number.parseFloat(trimmed)
  if (!Number.isFinite(dollars) || dollars <= 0) return null
  return Math.round(dollars * 100)
}

async function subscribeEmail(
  email: string,
  slug: string | null,
): Promise<void> {
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
}

/**
 * Pay-what-you-want download CTA. Every visitor sees a tip dialog before
 * downloading — payment details up front for paid amounts, or an explicit
 * $0 confirmation when they choose not to pay.
 */
export function SongDownloadButton({
  audioUrl,
  filename,
  title,
  slug,
  isLoggedIn,
  userEmail = null,
  className,
}: Props) {
  const [open, setOpen] = useState(false)
  const [tipMode, setTipMode] = useState<TipMode>('paid')
  const [presetCents, setPresetCents] = useState<number>(500)
  const [useCustomAmount, setUseCustomAmount] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [email, setEmail] = useState('')
  const [confirmFree, setConfirmFree] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentLoading, setPaymentLoading] = useState(false)

  const resolvedEmail = (isLoggedIn ? userEmail : email)?.trim() ?? ''
  const customCents = parseCustomAmountToCents(customAmount)
  const amountCents =
    tipMode === 'free' ? 0 : useCustomAmount ? (customCents ?? 0) : presetCents

  const canStartPaidPayment =
    tipMode === 'paid' &&
    amountCents >= STRIPE_MIN_TIP_CENTS &&
    Boolean(resolvedEmail)

  const resetDialogState = useCallback(() => {
    setTipMode('paid')
    setPresetCents(200)
    setUseCustomAmount(false)
    setCustomAmount('')
    setEmail('')
    setConfirmFree(false)
    setStatus('idle')
    setError(null)
    setClientSecret(null)
    setPaymentLoading(false)
  }, [])

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) resetDialogState()
  }

  const completeDownload = useCallback(async () => {
    if (!audioUrl) return
    if (!isLoggedIn && resolvedEmail) {
      await subscribeEmail(resolvedEmail, slug)
    }
    triggerBrowserDownload(audioUrl, filename, title)
    setStatus('done')
  }, [audioUrl, filename, isLoggedIn, resolvedEmail, slug, title])

  const handleFreeDownload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!confirmFree) {
      setError('Please confirm you want to download for free.')
      return
    }
    if (!isLoggedIn && !resolvedEmail) {
      setError('Email is required to download.')
      return
    }

    setStatus('loading')
    try {
      await completeDownload()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setStatus('idle')
    }
  }

  useEffect(() => {
    if (!open || !canStartPaidPayment) {
      return
    }

    let cancelled = false
    const timer = window.setTimeout(
      () => {
        setPaymentLoading(true)
        setError(null)

        fetch('/api/stripe/song-tip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amountCents,
            email: resolvedEmail,
            songSlug: slug,
            songTitle: title,
          }),
        })
          .then(async (res) => {
            const data = (await res.json().catch(() => null)) as {
              clientSecret?: string
              error?: string
            } | null
            if (!res.ok) {
              throw new Error(data?.error ?? 'Could not prepare payment.')
            }
            if (!data?.clientSecret) {
              throw new Error('Could not prepare payment.')
            }
            return data.clientSecret
          })
          .then((secret) => {
            if (!cancelled) setClientSecret(secret)
          })
          .catch((err: unknown) => {
            if (!cancelled) {
              setClientSecret(null)
              setError(
                err instanceof Error
                  ? err.message
                  : 'Could not prepare payment.',
              )
            }
          })
          .finally(() => {
            if (!cancelled) setPaymentLoading(false)
          })
      },
      useCustomAmount ? 400 : 0,
    )

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [
    open,
    canStartPaidPayment,
    amountCents,
    resolvedEmail,
    slug,
    title,
    useCustomAmount,
  ])

  const stripePromise = useMemo(() => getStripeBrowserClient(), [])

  const elementsOptions = useMemo(() => {
    if (!clientSecret) return null
    return {
      clientSecret,
      appearance: {
        theme: 'night' as const,
        variables: {
          colorPrimary: 'hsl(var(--primary))',
          colorBackground: 'hsl(var(--card))',
          colorText: 'hsl(var(--foreground))',
          colorDanger: 'hsl(var(--destructive))',
          borderRadius: '0px',
        },
      },
    }
  }, [clientSecret])

  if (!audioUrl) return null

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
        <Download size={24} />
        Download MP3
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border border-special/50 sm:max-w-lg md:max-w-3xl">
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
                  onClick={() =>
                    triggerBrowserDownload(audioUrl, filename, title)
                  }
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
                    Join the Crew for more perks!
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Download {title}</DialogTitle>
                <DialogDescription className="text-lg">
                  This song is yours to keep. Choose a tip amount that feels
                  fair — every dollar helps fund the next release. 💖
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-1">
                {error && (
                  <p className="text-sm font-semibold text-destructive">
                    {error}
                  </p>
                )}

                {!isLoggedIn ? (
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
                    <p className="text-xs text-muted-foreground">
                      Required so we can send you updates.{' '}
                      <Link
                        href="/login?tab=register"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        Create a free account
                      </Link>{' '}
                      for instant downloads next time.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Signed in as{' '}
                    <span className="font-medium text-foreground">
                      {resolvedEmail}
                    </span>
                    . Consider leaving a tip before you download. 💖
                  </p>
                )}

                <div className="space-y-3">
                  <Label>Choose your tip amount</Label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {TIP_PRESETS_CENTS.map((cents) => (
                      <Button
                        key={cents}
                        type="button"
                        variant={
                          tipMode === 'paid' &&
                          !useCustomAmount &&
                          presetCents === cents
                            ? 'default'
                            : 'outline'
                        }
                        className="rounded-none"
                        onClick={() => {
                          setTipMode('paid')
                          setUseCustomAmount(false)
                          setPresetCents(cents)
                          setConfirmFree(false)
                        }}
                      >
                        {formatUsd(cents)}
                      </Button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant={
                        tipMode === 'paid' && useCustomAmount
                          ? 'default'
                          : 'outline'
                      }
                      className="rounded-none sm:w-1/3"
                      onClick={() => {
                        setTipMode('paid')
                        setUseCustomAmount(true)
                        setConfirmFree(false)
                      }}
                    >
                      Other amount
                    </Button>
                    <Button
                      type="button"
                      variant={tipMode === 'free' ? 'default' : 'secondary'}
                      className="rounded-none sm:flex-1"
                      onClick={() => {
                        setTipMode('free')
                        setUseCustomAmount(false)
                        setConfirmFree(false)
                        setClientSecret(null)
                      }}
                    >
                      $0 — No payment required.
                    </Button>
                  </div>
                  {tipMode === 'paid' && useCustomAmount && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-tip">
                        Custom tip amount (USD)
                      </Label>
                      <Input
                        id="custom-tip"
                        type="number"
                        min={STRIPE_MIN_TIP_CENTS / 100}
                        step="0.01"
                        inputMode="decimal"
                        placeholder={`${(STRIPE_MIN_TIP_CENTS / 100).toFixed(2)} minimum`}
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {tipMode === 'paid' ? (
                  <div className="space-y-3 rounded-sm border border-border/60 bg-muted/20 p-4">
                    <p className="font-mono text-base tracking-widest text-primary uppercase">
                      Payment details
                    </p>
                    {!resolvedEmail ? (
                      <p className="text-sm text-muted-foreground">
                        Enter your email above to load secure payment fields.
                      </p>
                    ) : amountCents < STRIPE_MIN_TIP_CENTS ? (
                      <p className="text-sm text-muted-foreground">
                        Enter at least {formatUsd(STRIPE_MIN_TIP_CENTS)} to pay
                        with card.
                      </p>
                    ) : !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? (
                      <p className="text-sm text-destructive">
                        Card payments are currently unavailable. Please choose
                        the &ldquo;$0&rdquo; option or try again later.
                      </p>
                    ) : paymentLoading ||
                      !clientSecret ||
                      !elementsOptions ||
                      !canStartPaidPayment ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 size={16} className="animate-spin" />
                        Preparing secure checkout…
                      </div>
                    ) : (
                      <Elements
                        key={clientSecret}
                        stripe={stripePromise}
                        options={elementsOptions}
                      >
                        <SongDownloadTipPayment
                          amountCents={amountCents}
                          title={title}
                          disabled={!resolvedEmail}
                          onSuccess={completeDownload}
                        />
                      </Elements>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleFreeDownload} className="space-y-4">
                    <div className="rounded-sm border border-border/60 bg-muted/20 p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="confirm-free-download"
                          className="border-border"
                          checked={confirmFree}
                          onCheckedChange={(checked) =>
                            setConfirmFree(checked === true)
                          }
                        />
                        <div className="space-y-1">
                          <Label
                            htmlFor="confirm-free-download"
                            className="cursor-pointer leading-snug"
                          >
                            Download for free without leaving a tip.
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            No payment info needed.
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full rounded-none"
                      disabled={
                        status === 'loading' ||
                        !confirmFree ||
                        (!isLoggedIn && !resolvedEmail)
                      }
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={18} className="mr-2 animate-spin" />
                          Preparing download…
                        </>
                      ) : (
                        `Download "${title}"`
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
