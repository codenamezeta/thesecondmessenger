import { NextResponse } from 'next/server'

// This route will take the logged-in user's ID, create a Stripe Checkout session for the specific tier they clicked, and return the Stripe checkout URL to the frontend.

export async function POST() {
  return NextResponse.json({ ok: true, stub: true }, { status: 200 })
}
