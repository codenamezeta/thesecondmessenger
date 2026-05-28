import Link from 'next/link'

import type { User } from '@/payload-types'
import {
  formatStripeMoney,
  formatStripeTimestamp,
  type BillingSummary,
} from '@/utilities/billing'
import type { PaidCrewRank } from '@/utilities/stripe'

import { AccountBillingActions } from './billing-actions'

const RANK_LABELS: Record<User['crewRank'], string> = {
  ensign: 'Ensign',
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  captain: 'Captain',
  admiral: 'Admiral',
}

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  trialing: 'Trial',
  past_due: 'Past due — update payment method',
  canceled: 'Canceled',
  incomplete: 'Incomplete',
  incomplete_expired: 'Incomplete (expired)',
  unpaid: 'Unpaid',
  paused: 'Paused',
}

function statusLabel(status: string): string {
  return SUBSCRIPTION_STATUS_LABELS[status] ?? status
}

type Props = {
  crewRank: User['crewRank']
  billing: BillingSummary
}

export function AccountBillingSection({ crewRank, billing }: Props) {
  const sub = billing.subscription
  const hasActiveSubscription = Boolean(sub)
  const subscriptionTier: PaidCrewRank | null = sub?.rankFromPrice ?? null

  const rankMismatch =
    Boolean(sub && subscriptionTier) &&
    crewRank !== 'admiral' &&
    subscriptionTier !== crewRank

  return (
    <section className="mt-10 space-y-6 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-8">
      <div className="space-y-2">
        <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
          {'// Membership & Billing'}
        </p>
        <h2 className="font-heading text-xl tracking-tight text-foreground uppercase md:text-2xl">
          Subscription & payments
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Crew rank on the site usually updates right after Stripe webhooks run.
          Invoice history and card updates are handled securely by Stripe.
        </p>
      </div>

      {billing.error && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {billing.error}
        </div>
      )}

      <div className="grid gap-4 border border-border/50 bg-background/30 p-4 md:grid-cols-2">
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Crew rank (site)
          </p>
          <p className="mt-1 text-lg font-semibold text-foreground">
            {RANK_LABELS[crewRank]}
          </p>
          {crewRank === 'admiral' && (
            <p className="mt-2 text-xs text-muted-foreground">
              Admiral is assigned manually and is not sold as a subscription.
            </p>
          )}
        </div>
        <div>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Stripe subscription
          </p>
          {sub ? (
            <>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {statusLabel(sub.status)}
                {subscriptionTier ? ` · ${RANK_LABELS[subscriptionTier]}` : ''}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {sub.cancelAtPeriodEnd
                  ? 'Cancels at end of current period.'
                  : `Renews or next invoice: ${formatStripeTimestamp(sub.currentPeriodEnd)}`}
              </p>
            </>
          ) : billing.hasStripeCustomer ? (
            <p className="mt-1 text-sm text-muted-foreground">
              No active subscription on this billing account. You can subscribe
              from{' '}
              <Link
                href="/memberships"
                className="text-primary underline-offset-4 hover:underline"
              >
                Memberships
              </Link>
              .
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No Stripe customer yet. Starting a paid plan creates your billing
              profile.
            </p>
          )}
        </div>
      </div>

      {rankMismatch && (
        <div className="border border-primary/40 bg-primary/10 p-4 text-sm text-muted-foreground">
          Your site rank ({RANK_LABELS[crewRank]}) and Stripe plan (
          {RANK_LABELS[subscriptionTier!]}) may be out of sync briefly after a
          change. Refresh in a moment or contact support if it persists.
        </div>
      )}

      {sub?.status === 'past_due' && (
        <div className="border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Payment failed. Use <strong>Manage billing</strong> to update your
          card before access downgrades.
        </div>
      )}

      <AccountBillingActions
        hasStripeCustomer={billing.hasStripeCustomer}
        hasActiveSubscription={hasActiveSubscription}
        subscriptionTier={subscriptionTier}
      />

      <div className="space-y-3">
        <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
          Recent invoices
        </p>
        {billing.invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto border border-border/50">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border/50 bg-background/40 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Invoice</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Amount paid</th>
                  <th className="px-3 py-2">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {billing.invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-border/30 last:border-b-0"
                  >
                    <td className="px-3 py-2 text-muted-foreground">
                      {formatStripeTimestamp(inv.created)}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">
                      {inv.number ?? inv.id}
                    </td>
                    <td className="px-3 py-2 capitalize">
                      {inv.status ?? '—'}
                    </td>
                    <td className="px-3 py-2">
                      {formatStripeMoney(inv.amountPaid, inv.currency)}
                    </td>
                    <td className="px-3 py-2">
                      {inv.hostedInvoiceUrl ? (
                        <a
                          href={inv.hostedInvoiceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          View
                        </a>
                      ) : inv.invoicePdf ? (
                        <a
                          href={inv.invoicePdf}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          PDF
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
