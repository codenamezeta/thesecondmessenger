import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { User } from '@/payload-types'
import {
  getPriceIdForRank,
  getStripeClient,
  parsePaidCrewRank,
  type PaidCrewRank,
} from '@/utilities/stripe'

const MANAGEABLE_STATUSES = ['active', 'trialing', 'past_due'] as const

async function getAuthenticatedUser(): Promise<User | null> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) return null
  return payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      tier?: string
    } | null
    const tier = parsePaidCrewRank(body?.tier ?? null)

    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const user = await getAuthenticatedUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const customerId = user.stripeCustomerId
    if (!customerId?.trim()) {
      return NextResponse.json(
        {
          error:
            'No active billing account. Use checkout to start a subscription.',
        },
        { status: 400 },
      )
    }

    const stripe = getStripeClient()
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    })

    const subscription = subs.data.find((s) =>
      MANAGEABLE_STATUSES.includes(
        s.status as (typeof MANAGEABLE_STATUSES)[number],
      ),
    )

    if (!subscription) {
      return NextResponse.json(
        {
          error:
            'No active subscription to change. Start checkout from Memberships.',
        },
        { status: 400 },
      )
    }

    const item = subscription.items.data[0]
    if (!item?.id) {
      return NextResponse.json(
        { error: 'Subscription has no line items' },
        { status: 400 },
      )
    }

    const newPriceId = getPriceIdForRank(tier)
    const currentPriceId = item.price?.id
    if (currentPriceId === newPriceId) {
      return NextResponse.json(
        { error: 'You are already on this plan.' },
        { status: 400 },
      )
    }

    await stripe.subscriptions.update(subscription.id, {
      items: [{ id: item.id, price: newPriceId }],
      proration_behavior: 'create_prorations',
      metadata: {
        ...subscription.metadata,
        payloadUserId: String(user.id),
        crewRank: tier,
      },
    })

    return NextResponse.json({ ok: true, tier }, { status: 200 })
  } catch (error) {
    console.error('Stripe change subscription error:', error)
    return NextResponse.json(
      { error: 'Could not update subscription' },
      { status: 500 },
    )
  }
}
