import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 })
  }

  try {
    // 1. Exchange the code for the actual tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/callback/google`,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Token exchange error:', tokens.error)
      return NextResponse.json(
        { error: 'Failed to exchange token' },
        { status: 400 },
      )
    }

    // 2. Identify the currently logged-in user
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      // If they aren't logged in to your site, we can't save their tokens!
      return NextResponse.redirect(
        new URL('/login?error=must_be_logged_in', req.url),
      )
    }

    // 3. Calculate Expiry Date (Google usually returns expires_in as 3599 seconds)
    const expiryDate = new Date()
    expiryDate.setSeconds(expiryDate.getSeconds() + tokens.expires_in)

    // 4. Securely save to the Payload database
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        youtubeConnected: true,
        googleAccessToken: tokens.access_token,
        googleTokenExpiry: expiryDate.toISOString(),
        // Google ONLY sends a refresh token on the very first authorization.
        // We only want to update it if they sent a new one, otherwise keep the old one.
        ...(tokens.refresh_token && {
          googleRefreshToken: tokens.refresh_token,
        }),
      },
    })

    // 5. Send them back to the music player or their dashboard!
    return NextResponse.redirect(new URL('/', req.url))
  } catch (error) {
    console.error('OAuth Callback Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
