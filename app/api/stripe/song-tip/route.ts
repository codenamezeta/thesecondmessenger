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

function buildSongTipReturnUrl(origin: string, songSlug: string | null): string {
  const basePath = songSlug
    ? `/music/${encodeURIComponent(songSlug)}`
    : '/music'
  return `${origin}${basePath}?tip_session_id={CHECKOUT_SESSION_ID}`
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

    const songSlug = body?.songSlug?.trim() || null
    const songTitle = body?.songTitle?.trim() || ''
    const origin = req.nextUrl.origin

    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.create({
      ui_mode: 'elements',
      mode: 'payment',
      customer_email: user?.stripeCustomerId ? undefined : customerEmail,
      ...(user?.stripeCustomerId ? { customer: user.stripeCustomerId } : {}),
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: songTitle ? `Tip: ${songTitle}` : 'Song tip',
            },
          },
          quantity: 1,
        },
      ],
      return_url: buildSongTipReturnUrl(origin, songSlug),
      metadata: {
        type: 'song_tip',
        songSlug: songSlug || '',
        songTitle,
        payloadUserId: user ? String(user.id) : '',
        email: customerEmail,
      },
    })

    if (!session.client_secret) {
      return NextResponse.json(
        { error: 'Could not start payment' },
        { status: 500 },
      )
    }

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error('Song tip Checkout Session error:', error)
    return NextResponse.json({ error: 'Payment unavailable' }, { status: 500 })
  }
}
