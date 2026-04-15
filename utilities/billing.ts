import type Stripe from 'stripe'

import { getRankForPriceId, getStripeClient, type PaidCrewRank } from '@/utilities/stripe'

const ACTIVE_SUBSCRIPTION_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
]

export type BillingInvoiceRow = {
  id: string
  number: string | null
  status: string | null
  amountPaid: number
  currency: string
  created: number
  hostedInvoiceUrl: string | null
  invoicePdf: string | null
}

export type BillingSubscriptionSummary = {
  id: string
  status: Stripe.Subscription.Status
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: number
  priceId: string | null
  rankFromPrice: PaidCrewRank | null
}

export type BillingSummary = {
  hasStripeCustomer: boolean
  subscription: BillingSubscriptionSummary | null
  invoices: BillingInvoiceRow[]
  error: string | null
}

function pickActiveSubscription(
  subscriptions: Stripe.Subscription[],
): Stripe.Subscription | null {
  return (
    subscriptions.find((sub) => ACTIVE_SUBSCRIPTION_STATUSES.includes(sub.status)) ?? null
  )
}

function subscriptionToSummary(sub: Stripe.Subscription): BillingSubscriptionSummary {
  const firstItem = sub.items.data[0]
  const priceId =
    firstItem && typeof firstItem.price === 'object' && firstItem.price
      ? firstItem.price.id
      : typeof firstItem?.price === 'string'
        ? firstItem.price
        : null
  const currentPeriodEnd =
    firstItem?.current_period_end ?? sub.trial_end ?? sub.billing_cycle_anchor
  return {
    id: sub.id,
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    currentPeriodEnd,
    priceId,
    rankFromPrice: getRankForPriceId(priceId),
  }
}

export async function getBillingSummaryForCustomer(
  stripeCustomerId: string | null | undefined,
): Promise<BillingSummary> {
  if (!stripeCustomerId?.trim()) {
    return {
      hasStripeCustomer: false,
      subscription: null,
      invoices: [],
      error: null,
    }
  }

  try {
    const stripe = getStripeClient()

    const [subscriptionList, invoiceList] = await Promise.all([
      stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 10,
      }),
      stripe.invoices.list({
        customer: stripeCustomerId,
        limit: 15,
      }),
    ])

    const subscription = pickActiveSubscription(subscriptionList.data)

    const invoices: BillingInvoiceRow[] = invoiceList.data.map((inv) => ({
      id: inv.id,
      number: inv.number,
      status: inv.status,
      amountPaid: inv.amount_paid,
      currency: inv.currency,
      created: inv.created,
      hostedInvoiceUrl: inv.hosted_invoice_url ?? null,
      invoicePdf: inv.invoice_pdf ?? null,
    }))

    return {
      hasStripeCustomer: true,
      subscription: subscription ? subscriptionToSummary(subscription) : null,
      invoices,
      error: null,
    }
  } catch (err: unknown) {
    console.error('getBillingSummaryForCustomer failed:', err)
    return {
      hasStripeCustomer: true,
      subscription: null,
      invoices: [],
      error:
        err instanceof Error
          ? err.message
          : 'Could not load billing details from Stripe.',
    }
  }
}

export function formatStripeMoney(amountMinorUnits: number, currency: string): string {
  const code = currency.toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).format(amountMinorUnits / 100)
  } catch {
    return `${(amountMinorUnits / 100).toFixed(2)} ${code}`
  }
}

export function formatStripeTimestamp(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}
