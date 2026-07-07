import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/utilities/stripe'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const stripe = getStripeClient()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.metadata?.type !== 'song_tip') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const paid =
      session.status === 'complete' && session.payment_status === 'paid'

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      paid,
    })
  } catch (error) {
    console.error('Song tip session status error:', error)
    return NextResponse.json(
      { error: 'Could not verify payment' },
      { status: 500 },
    )
  }
}
