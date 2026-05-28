import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import type { User } from '@/payload-types'
import { getStripeClient } from '@/utilities/stripe'

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
          error: 'No Stripe customer on file. Subscribe to a paid tier first.',
        },
        { status: 400 },
      )
    }

    const stripe = getStripeClient()
    const origin = req.nextUrl.origin
    const returnUrl = `${origin}/account`

    const portalConfig = process.env.STRIPE_BILLING_PORTAL_CONFIGURATION_ID

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
      ...(portalConfig ? { configuration: portalConfig } : {}),
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Portal session URL missing' },
        { status: 500 },
      )
    }

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (error) {
    console.error('Stripe billing portal error:', error)
    return NextResponse.json(
      { error: 'Could not open billing portal' },
      { status: 500 },
    )
  }
}
