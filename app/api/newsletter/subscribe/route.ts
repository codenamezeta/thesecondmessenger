import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { notifyOwnerNewSubscriber } from '@/utilities/notifications'
import { upsertAudienceContact } from '@/utilities/resendAudience'

// Must match the `source` select options on the MailingList collection.
const VALID_SOURCES = [
  'spotify_presave',
  'newsletter_signup',
  'merch_purchase',
] as const

type MailingListSource = (typeof VALID_SOURCES)[number]

function coerceSource(value: unknown): MailingListSource {
  return VALID_SOURCES.includes(value as MailingListSource)
    ? (value as MailingListSource)
    : 'newsletter_signup'
}

export async function POST(req: Request) {
  try {
    const { email, source, tags } = await req.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })
    const resolvedSource = coerceSource(source)
    const resolvedTags = typeof tags === 'string' && tags.trim() ? tags.trim() : 'direct_signup'

    // 1. Check if they already exist to avoid duplicates
    const existing = await payload.find({
      collection: 'mailing-list',
      where: {
        email: { equals: email },
      },
    })

    if (existing.totalDocs > 0) {
      // Already joined - just say success
      return NextResponse.json({ success: true, message: 'Already subscribed' })
    }

    // 2. Create the entry
    await payload.create({
      collection: 'mailing-list',
      data: {
        email,
        source: resolvedSource,
        tags: resolvedTags,
      },
    })

    // 3. Best-effort: alert the owner + sync to Resend audience. Never block
    // the signup/download flow on these external side effects.
    await notifyOwnerNewSubscriber(payload, {
      email,
      source: resolvedSource,
      tags: resolvedTags,
    })
    await upsertAudienceContact({ email })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter Error:', error)
    return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
  }
}
