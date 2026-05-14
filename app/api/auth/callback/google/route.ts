import { timingSafeEqual } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'

import { GOOGLE_YOUTUBE_OAUTH_STATE_COOKIE } from '../../youtube/connect/route'

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  try {
    return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'))
  } catch {
    return false
  }
}

function isSafeRelativePath(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//')
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const stateStr = searchParams.get('state')

  const clearStateCookie = (res: NextResponse) => {
    res.cookies.set(GOOGLE_YOUTUBE_OAUTH_STATE_COOKIE, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  }

  if (!code || !stateStr) {
    return NextResponse.json(
      { error: 'Missing code or state' },
      { status: 400 },
    )
  }

  let parsedState: { nonce: unknown; returnTo: unknown }
  try {
    const decoded = Buffer.from(stateStr, 'base64url').toString('utf8')
    parsedState = JSON.parse(decoded) as { nonce: unknown; returnTo: unknown }
  } catch {
    const res = NextResponse.json(
      { error: 'Malformed state parameter' },
      { status: 400 },
    )
    clearStateCookie(res)
    return res
  }

  if (
    typeof parsedState.nonce !== 'string' ||
    typeof parsedState.returnTo !== 'string'
  ) {
    const res = NextResponse.json(
      { error: 'Invalid state payload' },
      { status: 400 },
    )
    clearStateCookie(res)
    return res
  }

  const cookieNonce = req.cookies.get(GOOGLE_YOUTUBE_OAUTH_STATE_COOKIE)?.value
  if (!cookieNonce || !timingSafeEqualStrings(parsedState.nonce, cookieNonce)) {
    const res = NextResponse.json(
      { error: 'State mismatch (CSRF protection)' },
      { status: 403 },
    )
    clearStateCookie(res)
    return res
  }

  const safeReturnTo = isSafeRelativePath(parsedState.returnTo)
    ? parsedState.returnTo
    : '/account'

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
      const res = NextResponse.json(
        { error: 'Failed to exchange token' },
        { status: 400 },
      )
      clearStateCookie(res)
      return res
    }

    // 2. Identify the currently logged-in user
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      const res = NextResponse.redirect(
        new URL('/login?error=must_be_logged_in', req.url),
      )
      clearStateCookie(res)
      return res
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

    // 5. Send them back to the requested page (defaults to account settings).
    const res = NextResponse.redirect(new URL(safeReturnTo, req.url))
    clearStateCookie(res)
    return res
  } catch (error) {
    console.error('OAuth Callback Error:', error)
    const res = NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
    clearStateCookie(res)
    return res
  }
}
