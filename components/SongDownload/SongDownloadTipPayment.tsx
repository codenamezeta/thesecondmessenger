'use client'

import { useState } from 'react'
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
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

export function SongDownloadTipPayment({
  amountCents,
  title,
  disabled = false,
  onSuccess,
}: Props) {
  const stripe = useStripe()
  const elements = useElements()
  const [status, setStatus] = useState<'idle' | 'processing'>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setError(null)
    setStatus('processing')

    try {
      const { error: submitError, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      })

      if (submitError) {
        throw new Error(submitError.message ?? 'Payment failed.')
      }

      if (
        paymentIntent &&
        paymentIntent.status !== 'succeeded' &&
        paymentIntent.status !== 'processing'
      ) {
        throw new Error('Payment was not completed.')
      }

      await onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Payment failed.')
      setStatus('idle')
    }
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
        disabled={disabled || !stripe || !elements || status === 'processing'}
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
