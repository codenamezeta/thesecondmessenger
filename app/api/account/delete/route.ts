import { NextRequest, NextResponse } from 'next/server'
import { cookies, headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { getStripeClient } from '@/utilities/stripe'

type DeleteBody = {
  confirm?: string
  cancelSubscriptionImmediately?: boolean
}

async function revokeGoogleTokens(tokens: Array<string | null | undefined>): Promise<void> {
  const valid = tokens.filter((t): t is string => typeof t === 'string' && t.length > 0)
  await Promise.all(
    valid.map(async (token) => {
      try {
        await fetch('https://oauth2.googleapis.com/revoke', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ token }),
        })
      } catch (error) {
        console.warn('Google revoke during account deletion failed:', error)
      }
    }),
  )
}

async function cancelStripeSubscriptions(
  customerId: string | null | undefined,
  immediately: boolean,
): Promise<void> {
  if (!customerId?.trim()) return

  try {
    const stripe = getStripeClient()
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 20,
    })

    const cancelable = subs.data.filter((s) =>
      ['active', 'trialing', 'past_due', 'unpaid', 'paused'].includes(s.status),
    )

    await Promise.all(
      cancelable.map(async (sub) => {
        if (immediately) {
          await stripe.subscriptions.cancel(sub.id)
        } else {
          await stripe.subscriptions.update(sub.id, { cancel_at_period_end: true })
        }
      }),
    )
  } catch (error) {
    console.warn('Stripe subscription cancellation failed during deletion:', error)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as DeleteBody

    if (body?.confirm !== 'DELETE') {
      return NextResponse.json(
        { error: 'Missing deletion confirmation. Type DELETE to confirm.' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    await revokeGoogleTokens([fullUser.googleAccessToken, fullUser.googleRefreshToken])

    await cancelStripeSubscriptions(
      fullUser.stripeCustomerId,
      Boolean(body.cancelSubscriptionImmediately),
    )

    await payload.delete({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
    })

    // Log the user out by expiring the Payload auth cookie. Payload issues a
    // cookie named `payload-token` by default; clearing both conservatively.
    const cookieStore = await cookies()
    cookieStore.delete('payload-token')
    cookieStore.delete('tsm_user_id')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Account deletion failed:', error)
    return NextResponse.json(
      { error: 'Could not delete account. Please email support if this persists.' },
      { status: 500 },
    )
  }
}
