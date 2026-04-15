'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { PaidCrewRank } from '@/utilities/stripe'

type Props = {
  hasStripeCustomer: boolean
  hasActiveSubscription: boolean
  subscriptionTier: PaidCrewRank | null
}

const PAID_TIERS: PaidCrewRank[] = ['lieutenant', 'commander', 'captain']

function tierLabel(tier: PaidCrewRank): string {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function parseError(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as { error?: string }
  return typeof data.error === 'string' ? data.error : null
}

export function AccountBillingActions({
  hasStripeCustomer,
  hasActiveSubscription,
  subscriptionTier,
}: Props) {
  const [portalLoading, setPortalLoading] = useState(false)
  const [changeLoading, setChangeLoading] = useState<PaidCrewRank | null>(null)
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(
    null,
  )

  const openBillingPortal = async () => {
    setMessage(null)
    setPortalLoading(true)
    try {
      const res = await fetch('/api/stripe/billing-portal', { method: 'POST' })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(parseError(data) ?? 'Could not open billing portal.')
      }
      const url = typeof data?.url === 'string' ? data.url : null
      if (!url) throw new Error('Portal URL missing.')
      window.location.assign(url)
    } catch (e: unknown) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Something went wrong.',
      })
    } finally {
      setPortalLoading(false)
    }
  }

  const changeTier = async (tier: PaidCrewRank) => {
    setMessage(null)
    setChangeLoading(tier)
    try {
      const res = await fetch('/api/stripe/change-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(parseError(data) ?? 'Could not change plan.')
      }
      setMessage({
        type: 'success',
        text: `Plan updated to ${tierLabel(tier)}. Your Crew rank will sync after Stripe processes the change.`,
      })
      window.setTimeout(() => window.location.reload(), 1500)
    } catch (e: unknown) {
      setMessage({
        type: 'error',
        text: e instanceof Error ? e.message : 'Something went wrong.',
      })
    } finally {
      setChangeLoading(null)
    }
  }

  return (
    <div className="space-y-4">
      {message && (
        <p
          className={
            message.type === 'error'
              ? 'text-sm font-semibold text-destructive'
              : 'text-sm font-semibold text-primary'
          }
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {hasStripeCustomer && (
          <Button
            type="button"
            variant="secondary"
            className="rounded-none"
            disabled={portalLoading}
            onClick={openBillingPortal}
          >
            {portalLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Opening…
              </>
            ) : (
              'Manage billing'
            )}
          </Button>
        )}

        {!hasActiveSubscription && (
          <Button asChild variant="default" className="rounded-none">
            <Link href="/memberships">View membership plans</Link>
          </Button>
        )}
      </div>

      {hasActiveSubscription && (
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Change paid tier
          </p>
          <p className="text-xs text-muted-foreground">
            Upgrades or downgrades use prorated billing. You can also cancel or update your card in
            Manage billing.
          </p>
          <div className="flex flex-wrap gap-2">
            {PAID_TIERS.map((tier) => {
              const isCurrent = subscriptionTier === tier
              const loading = changeLoading === tier
              return (
                <Button
                  key={tier}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-none"
                  disabled={isCurrent || changeLoading !== null}
                  onClick={() => changeTier(tier)}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isCurrent ? (
                    `${tierLabel(tier)} (current)`
                  ) : (
                    `Switch to ${tierLabel(tier)}`
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
