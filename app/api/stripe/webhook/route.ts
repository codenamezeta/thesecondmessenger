import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import {
  getRankForPriceId,
  getStripeClient,
  getStripeWebhookSecret,
  parsePaidCrewRank,
  type PaidCrewRank,
} from '@/utilities/stripe'
import { notifyOwnerMembershipChange } from '@/utilities/notifications'

type ManagedCrewRank = PaidCrewRank | 'ensign'

async function updateUserMembership(
  userId: number,
  data: { crewRank?: ManagedCrewRank; stripeCustomerId?: string },
): Promise<void> {
  const payload = await getPayload({ config: configPromise })

  // Capture the prior rank so we only alert the owner on an actual tier change
  // (subscription.updated can fire repeatedly with the same rank).
  let previousRank: string | null = null
  if (data.crewRank) {
    try {
      const prior = await payload.findByID({
        collection: 'users',
        id: userId,
        depth: 0,
      })
      previousRank = prior?.crewRank ?? null
    } catch {
      previousRank = null
    }
  }

  const updated = await payload.update({
    collection: 'users',
    id: userId,
    data,
  })

  if (data.crewRank && data.crewRank !== previousRank) {
    await notifyOwnerMembershipChange(payload, {
      username: updated.username,
      email: updated.email,
      newRank: data.crewRank,
    })
  }
}

async function findUserByStripeCustomerId(
  customerId: string,
): Promise<{ id: number } | null> {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'users',
    where: {
      stripeCustomerId: { equals: customerId },
    },
    limit: 1,
    depth: 0,
  })

  const user = result.docs[0]
  return user ? { id: user.id } : null
}

/**
 * Stripe sends customer/subscription references as either a bare id string or
 * an expanded object. Normalize to the id string so handlers don't silently
 * treat an expanded object as "missing".
 */
function extractStripeId(
  value: string | { id?: string } | null | undefined,
): string | null {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && typeof value.id === 'string') return value.id
  return null
}

/**
 * Resolve the Payload user for a Stripe event, preferring the persisted
 * `stripeCustomerId` link and falling back to the `payloadUserId` we stamp
 * into checkout/subscription metadata. This keeps upgrades working even if an
 * earlier event (e.g. checkout.session.completed) failed to link the customer.
 */
async function resolveUserId(
  customerId: string | null,
  metadataUserId: string | null | undefined,
): Promise<number | null> {
  if (customerId) {
    const linked = await findUserByStripeCustomerId(customerId)
    if (linked) return linked.id
  }
  const parsed = Number(metadataUserId)
  if (Number.isFinite(parsed) && parsed > 0) return parsed
  return null
}

function resolveRankFromSubscription(
  subscription: Stripe.Subscription,
): ManagedCrewRank | null {
  const metadataRank = parsePaidCrewRank(
    subscription.metadata?.crewRank || null,
  )
  if (metadataRank) return metadataRank

  const subscriptionPriceId = subscription.items.data[0]?.price?.id
  const rankFromPrice = getRankForPriceId(subscriptionPriceId)
  if (rankFromPrice) return rankFromPrice

  return null
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const purchasedRank = parsePaidCrewRank(session.metadata?.crewRank || null)
  const customerId = extractStripeId(session.customer)
  const userId = await resolveUserId(
    customerId,
    session.metadata?.payloadUserId,
  )

  if (!userId || !purchasedRank || !customerId) {
    throw new Error(
      `checkout.session.completed could not resolve membership update (session=${session.id}, userId=${userId}, rank=${purchasedRank}, customerId=${customerId})`,
    )
  }

  await updateUserMembership(userId, {
    crewRank: purchasedRank,
    stripeCustomerId: customerId,
  })
  console.info(
    `[stripe-webhook] checkout.session.completed: user ${userId} -> ${purchasedRank}`,
  )
}

/**
 * Handles both `customer.subscription.created` and `customer.subscription.updated`.
 * Persists the customer link and syncs crew rank from the subscription. Acts as
 * the safety net if `checkout.session.completed` was missed or failed.
 */
async function handleSubscriptionUpserted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = extractStripeId(subscription.customer)
  const userId = await resolveUserId(
    customerId,
    subscription.metadata?.payloadUserId,
  )
  if (!userId) {
    console.warn(
      `[stripe-webhook] ${subscription.id}: no matching user for customer ${customerId}`,
    )
    return
  }

  const rank = resolveRankFromSubscription(subscription)
  const data: { crewRank?: ManagedCrewRank; stripeCustomerId?: string } = {}
  if (customerId) data.stripeCustomerId = customerId
  if (rank) data.crewRank = rank
  if (Object.keys(data).length === 0) return

  await updateUserMembership(userId, data)
  console.info(
    `[stripe-webhook] ${subscription.id}: user ${userId} synced (${data.crewRank ?? 'rank unchanged'})`,
  )
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId = extractStripeId(subscription.customer)
  const userId = await resolveUserId(
    customerId,
    subscription.metadata?.payloadUserId,
  )
  if (!userId) return

  await updateUserMembership(userId, { crewRank: 'ensign' })
  console.info(
    `[stripe-webhook] subscription deleted: user ${userId} -> ensign`,
  )
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = extractStripeId(invoice.customer)
  if (!customerId) return

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) return

  await updateUserMembership(user.id, { crewRank: 'ensign' })
  console.info(
    `[stripe-webhook] invoice.payment_failed: user ${user.id} -> ensign`,
  )
}

/**
 * Safety net for `invoice.paid` / `invoice.payment_succeeded`: ensures the
 * customer is linked to the user so the billing tab can load invoices, even if
 * the customer link was somehow not persisted by earlier events.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId = extractStripeId(invoice.customer)
  if (!customerId) return

  const linked = await findUserByStripeCustomerId(customerId)
  if (linked) return

  const metadataUserId = Number(invoice.metadata?.payloadUserId)
  if (!Number.isFinite(metadataUserId) || metadataUserId <= 0) {
    console.warn(
      `[stripe-webhook] invoice.paid: no user linked for customer ${customerId}`,
    )
    return
  }

  await updateUserMembership(metadataUserId, { stripeCustomerId: customerId })
  console.info(
    `[stripe-webhook] invoice.paid: linked customer ${customerId} to user ${metadataUserId}`,
  )
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe signature' },
      { status: 400 },
    )
  }

  const body = await req.text()
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      getStripeWebhookSecret(),
    )
  } catch (error) {
    console.error('Stripe webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        )
        break
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpserted(
          event.data.object as Stripe.Subscription,
        )
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
        break
      case 'invoice.paid':
      case 'invoice.payment_succeeded':
        await handleInvoicePaid(event.data.object as Stripe.Invoice)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    )
  }
}
