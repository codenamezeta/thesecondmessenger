import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export async function POST(req: Request) {
  try {
    const { email, source } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config: configPromise })

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
        source: source || 'web_signup',
        tags: 'direct_signup',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Newsletter Error:', error)
    return NextResponse.json({ error: 'Failed to join' }, { status: 500 })
  }
}
