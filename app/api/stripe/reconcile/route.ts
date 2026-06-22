import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { reconcileMembershipFromStripe } from '@/utilities/reconcileMembership'

/**
 * Self-heal endpoint: re-derives the caller's crew rank and Stripe customer
 * link from Stripe. Admins may reconcile another account by passing
 * `{ userId }` or `{ email }`. This is the recovery path for payments that
 * succeeded in Stripe but were never applied by the webhook.
 */
export async function POST(req: NextRequest) {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  const body = (await req.json().catch(() => null)) as {
    userId?: number
    email?: string
  } | null

  let targetUserId = user.id

  if (body?.userId || body?.email) {
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required to reconcile another account.' },
        { status: 403 },
      )
    }
    if (body.userId) {
      targetUserId = body.userId
    } else if (body.email) {
      const found = await payload.find({
        collection: 'users',
        where: { email: { equals: body.email } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })
      const match = found.docs[0]
      if (!match) {
        return NextResponse.json({ error: 'User not found.' }, { status: 404 })
      }
      targetUserId = match.id
    }
  }

  try {
    const targetUser = await payload.findByID({
      collection: 'users',
      id: targetUserId,
      depth: 0,
      overrideAccess: true,
    })

    const result = await reconcileMembershipFromStripe(payload, targetUser)
    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Stripe reconcile error:', error)
    return NextResponse.json(
      { error: 'Could not reconcile membership from Stripe.' },
      { status: 500 },
    )
  }
}
