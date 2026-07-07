'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useCheckoutElements,
} from '@stripe/react-stripe-js/checkout'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

type Props = {
  amountCents: number
  title: string
  disabled?: boolean
  onSuccess: () => void | Promise<void>
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100)
}

function isCheckoutSessionPaid(
  status: { type: string; paymentStatus?: string },
): boolean {
  return (
    status.type === 'complete' &&
    (status.paymentStatus === 'paid' ||
      status.paymentStatus === 'no_payment_required')
  )
}

export function SongDownloadTipPayment({
  amountCents,
  title,
  disabled = false,
  onSuccess,
}: Props) {
  const checkoutState = useCheckoutElements()
  const [status, setStatus] = useState<'idle' | 'processing'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (checkoutState.type !== 'success') return

    setError(null)
    setStatus('processing')

    try {
      const confirmResult = await checkoutState.checkout.confirm({
        redirect: 'if_required',
      })

      if (confirmResult.type === 'error') {
        throw new Error(confirmResult.error.message ?? 'Payment failed.')
      }

      if (!isCheckoutSessionPaid(confirmResult.session.status)) {
        throw new Error('Payment was not completed.')
      }

      await onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed.')
      setStatus('idle')
    }
  }

  if (checkoutState.type === 'loading') {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        Loading payment form…
      </div>
    )
  }

  if (checkoutState.type === 'error') {
    return (
      <p className="text-sm font-semibold text-destructive">
        {checkoutState.error.message}
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      {error && (
        <p className="text-sm font-semibold text-destructive">{error}</p>
      )}
      <Button
        type="submit"
        className="w-full rounded-none"
        disabled={disabled || status === 'processing'}
      >
        {status === 'processing' ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Processing payment…
          </>
        ) : (
          `Pay ${formatUsd(amountCents)} & download ${title}`
        )}
      </Button>
    </form>
  )
}
