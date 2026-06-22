import type { Payload } from 'payload'
import type Stripe from 'stripe'

import type { User } from '@/payload-types'
import {
  getRankForPriceId,
  getStripeClient,
  parsePaidCrewRank,
  type PaidCrewRank,
} from '@/utilities/stripe'

const ACTIVE_STATUSES: Stripe.Subscription.Status[] = [
  'active',
  'trialing',
  'past_due',
]

export type ReconcileResult = {
  changed: boolean
  crewRank: User['crewRank']
  stripeCustomerId: string | null
  subscriptionId: string | null
  message: string
}

function rankFromSubscription(
  subscription: Stripe.Subscription,
): PaidCrewRank | null {
  const metadataRank = parsePaidCrewRank(
    subscription.metadata?.crewRank || null,
  )
  if (metadataRank) return metadataRank
  return getRankForPriceId(subscription.items.data[0]?.price?.id)
}

/**
 * Find the Stripe customer id(s) associated with a user: the persisted id plus
 * any customers that share the user's email (covers cases where checkout
 * created a customer that was never linked back to the Payload user).
 */
async function findCandidateCustomerIds(user: User): Promise<string[]> {
  const stripe = getStripeClient()
  const ids = new Set<string>()
  if (user.stripeCustomerId) ids.add(user.stripeCustomerId)

  if (user.email) {
    const byEmail = await stripe.customers.list({ email: user.email, limit: 10 })
    for (const customer of byEmail.data) {
      if (!customer.deleted) ids.add(customer.id)
    }
  }

  return Array.from(ids)
}

async function findActiveSubscription(
  customerIds: string[],
): Promise<{ customerId: string; subscription: Stripe.Subscription } | null> {
  const stripe = getStripeClient()
  for (const customerId of customerIds) {
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 10,
    })
    const active = subs.data.find((sub) => ACTIVE_STATUSES.includes(sub.status))
    if (active) return { customerId, subscription: active }
  }
  return null
}

/**
 * Reconcile a user's crew rank and Stripe customer link directly from Stripe.
 * This is the self-heal path for the case where a checkout succeeded in Stripe
 * but the webhook never applied the upgrade (or never linked the customer).
 */
export async function reconcileMembershipFromStripe(
  payload: Payload,
  user: User,
): Promise<ReconcileResult> {
  const candidateIds = await findCandidateCustomerIds(user)

  if (candidateIds.length === 0) {
    return {
      changed: false,
      crewRank: user.crewRank,
      stripeCustomerId: user.stripeCustomerId ?? null,
      subscriptionId: null,
      message: 'No Stripe customer found for this account.',
    }
  }

  const found = await findActiveSubscription(candidateIds)

  if (!found) {
    // No active subscription. Persist the customer link if we discovered one so
    // the billing tab can still surface past invoices.
    const resolvedCustomerId = candidateIds[0]
    const needsLink = user.stripeCustomerId !== resolvedCustomerId
    if (needsLink) {
      await payload.update({
        collection: 'users',
        id: user.id,
        data: { stripeCustomerId: resolvedCustomerId },
        overrideAccess: true,
      })
    }
    return {
      changed: needsLink,
      crewRank: user.crewRank,
      stripeCustomerId: resolvedCustomerId,
      subscriptionId: null,
      message: needsLink
        ? 'Linked your Stripe customer. No active subscription found.'
        : 'No active subscription found.',
    }
  }

  const rank = rankFromSubscription(found.subscription)
  const nextRank = rank ?? user.crewRank
  const changed =
    user.crewRank !== nextRank || user.stripeCustomerId !== found.customerId

  if (changed) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        crewRank: nextRank,
        stripeCustomerId: found.customerId,
      },
      overrideAccess: true,
    })
  }

  return {
    changed,
    crewRank: nextRank,
    stripeCustomerId: found.customerId,
    subscriptionId: found.subscription.id,
    message: changed
      ? `Membership synced to ${nextRank}.`
      : 'Membership already up to date.',
  }
}
