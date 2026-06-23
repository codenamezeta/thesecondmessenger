import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { User } from '@/payload-types'
import { getStripeClient, STRIPE_MIN_TIP_CENTS } from '@/utilities/stripe'

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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as {
      amountCents?: number
      email?: string
      songSlug?: string | null
      songTitle?: string
    } | null

    const amountCents =
      typeof body?.amountCents === 'number'
        ? Math.round(body.amountCents)
        : NaN

    if (!Number.isFinite(amountCents) || amountCents < STRIPE_MIN_TIP_CENTS) {
      return NextResponse.json(
        { error: `Minimum tip is $${(STRIPE_MIN_TIP_CENTS / 100).toFixed(2)}` },
        { status: 400 },
      )
    }

    const user = await getAuthenticatedUser()
    const emailFromBody =
      typeof body?.email === 'string' ? body.email.trim() : ''
    const customerEmail = user?.email ?? emailFromBody

    if (!customerEmail || !isValidEmail(customerEmail)) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 })
    }

    const stripe = getStripeClient()
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      receipt_email: customerEmail,
      metadata: {
        type: 'song_tip',
        songSlug: body?.songSlug?.trim() || '',
        songTitle: body?.songTitle?.trim() || '',
        payloadUserId: user ? String(user.id) : '',
        email: customerEmail,
      },
      ...(user?.stripeCustomerId
        ? { customer: user.stripeCustomerId }
        : {}),
    })

    if (!paymentIntent.client_secret) {
      return NextResponse.json(
        { error: 'Could not start payment' },
        { status: 500 },
      )
    }

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error('Song tip PaymentIntent error:', error)
    return NextResponse.json({ error: 'Payment unavailable' }, { status: 500 })
  }
}
