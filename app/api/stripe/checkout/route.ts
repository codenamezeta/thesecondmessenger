import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import Stripe from 'stripe'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'
import {
  getPriceIdForRank,
  getStripeClient,
  parsePaidCrewRank,
  type PaidCrewRank,
} from '@/utilities/stripe'

function buildLoginRedirect(req: NextRequest, tier: string | null): NextResponse {
  const params = new URLSearchParams()
  if (tier) params.set('tier', tier)
  const returnTo = params.size > 0 ? `/memberships?${params.toString()}` : '/memberships'
  return NextResponse.redirect(
    new URL(`/login?redirect=${encodeURIComponent(returnTo)}`, req.url),
  )
}

function buildErrorRedirect(req: NextRequest, message: string, tier: string | null): NextResponse {
  const params = new URLSearchParams({ error: message })
  if (tier) params.set('tier', tier)
  return NextResponse.redirect(new URL(`/memberships?${params.toString()}`, req.url))
}

function isStripeMissingCustomerError(error: unknown): boolean {
  if (!(error instanceof Stripe.errors.StripeError)) return false
  if (
    error.type === 'StripeInvalidRequestError' &&
    error.code === 'resource_missing'
  ) {
    const safeMessage = error.message.toLowerCase()
    const isCustomerParam = error.param === 'customer' || error.param === 'id'
    const isMissingCustomerMessage =
      safeMessage.includes('no such customer') ||
      safeMessage.includes('customer')

    return isCustomerParam && isMissingCustomerMessage
  }

  return false
}

function isStripeMissingPriceError(error: unknown): boolean {
  if (!(error instanceof Stripe.errors.StripeError)) return false
  return (
    error.type === 'StripeInvalidRequestError' &&
    error.code === 'resource_missing' &&
    error.param === 'line_items[0][price]'
  )
}

async function createStripeCustomer(user: User): Promise<string> {
  const stripe = getStripeClient()
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName || user.username,
    metadata: {
      payloadUserId: String(user.id),
    },
  })
  return customer.id
}

async function resolveOrCreateStripeCustomer(user: User): Promise<string> {
  const stripe = getStripeClient()
  if (user.stripeCustomerId) {
    try {
      const existingCustomer = await stripe.customers.retrieve(user.stripeCustomerId)
      if (!existingCustomer.deleted) {
        return existingCustomer.id
      }
    } catch (error) {
      if (!isStripeMissingCustomerError(error)) {
        throw error
      }
      console.warn(
        `Stripe customer ${user.stripeCustomerId} missing for user ${user.id}; creating a new customer.`,
      )
    }
  }

  return createStripeCustomer(user)
}

async function createCheckoutSession(
  user: User,
  tier: PaidCrewRank,
  origin: string,
): Promise<{ url: string; customerId: string }> {
  const stripe = getStripeClient()
  const customerId = await resolveOrCreateStripeCustomer(user)
  const priceId = getPriceIdForRank(tier)

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    client_reference_id: String(user.id),
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${origin}/crew?stripe=success&tier=${tier}`,
    cancel_url: `${origin}/memberships?canceled=1&tier=${tier}`,
    allow_promotion_codes: true,
    metadata: {
      payloadUserId: String(user.id),
      crewRank: tier,
    },
    subscription_data: {
      metadata: {
        payloadUserId: String(user.id),
        crewRank: tier,
      },
    },
  })

  if (!session.url) {
    throw new Error('Stripe checkout session URL was not returned')
  }

  return { url: session.url, customerId }
}

async function getAuthenticatedUser(): Promise<User | null> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) return null

  const freshUser = await payload.findByID({
    collection: 'users',
    id: user.id,
    depth: 0,
  })

  return freshUser
}

async function persistStripeCustomerId(userId: number, stripeCustomerId: string): Promise<void> {
  const payload = await getPayload({ config: configPromise })
  await payload.update({
    collection: 'users',
    id: userId,
    data: { stripeCustomerId },
  })
}

export async function GET(req: NextRequest) {
  const tierParam = req.nextUrl.searchParams.get('tier')
  const tier = parsePaidCrewRank(tierParam)

  if (!tier) {
    return buildErrorRedirect(req, 'invalid_tier', tierParam)
  }

  try {
    const user = await getAuthenticatedUser()

    if (!user) {
      return buildLoginRedirect(req, tier)
    }

    const { url, customerId } = await createCheckoutSession(
      user,
      tier,
      req.nextUrl.origin,
    )

    if (user.stripeCustomerId !== customerId) {
      await persistStripeCustomerId(user.id, customerId)
    }

    return NextResponse.redirect(url, { status: 303 })
  } catch (error) {
    console.error('Stripe checkout session error:', error)
    if (isStripeMissingPriceError(error)) {
      return buildErrorRedirect(req, 'invalid_price_config', tierParam)
    }
    return buildErrorRedirect(req, 'checkout_unavailable', tierParam)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { tier?: string } | null
    const tier = parsePaidCrewRank(body?.tier || null)

    if (!tier) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }

    const user = await getAuthenticatedUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { url, customerId } = await createCheckoutSession(
      user,
      tier,
      req.nextUrl.origin,
    )
    if (user.stripeCustomerId !== customerId) {
      await persistStripeCustomerId(user.id, customerId)
    }
    return NextResponse.json({ url }, { status: 200 })
  } catch (error) {
    console.error('Stripe checkout POST error:', error)
    if (isStripeMissingPriceError(error)) {
      return NextResponse.json(
        { error: 'Invalid Stripe price configuration' },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: 'Checkout unavailable' }, { status: 500 })
  }
}
