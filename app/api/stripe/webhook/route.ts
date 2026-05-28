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

type ManagedCrewRank = PaidCrewRank | 'ensign'

async function updateUserMembership(
  userId: number,
  data: { crewRank?: ManagedCrewRank; stripeCustomerId?: string },
): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'users',
    id: userId,
    data,
  })
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
  const payloadUserId = Number(session.metadata?.payloadUserId)
  const purchasedRank = parsePaidCrewRank(session.metadata?.crewRank || null)
  const customerId =
    typeof session.customer === 'string' ? session.customer : null

  if (!Number.isFinite(payloadUserId) || !purchasedRank || !customerId) {
    throw new Error(
      'Missing payloadUserId, purchased rank, or customer id on checkout session',
    )
  }

  await updateUserMembership(payloadUserId, {
    crewRank: purchasedRank,
    stripeCustomerId: customerId,
  })
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : null
  if (!customerId) return

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) return

  const rank = resolveRankFromSubscription(subscription)
  if (!rank) return

  await updateUserMembership(user.id, { crewRank: rank })
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
): Promise<void> {
  const customerId =
    typeof subscription.customer === 'string' ? subscription.customer : null
  if (!customerId) return

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) return

  await updateUserMembership(user.id, { crewRank: 'ensign' })
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId =
    typeof invoice.customer === 'string' ? invoice.customer : null
  if (!customerId) return

  const user = await findUserByStripeCustomerId(customerId)
  if (!user) return

  await updateUserMembership(user.id, { crewRank: 'ensign' })
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
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
        )
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
        )
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
