import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/** HTTP-only cookie holding the OAuth CSRF nonce; must match decoded `state` on callback. */
export const GOOGLE_YOUTUBE_OAUTH_STATE_COOKIE = 'google_youtube_oauth_state'

const STATE_MAX_AGE_SEC = 60 * 10

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/account'
  const safeReturnTo =
    returnTo.startsWith('/') && !returnTo.startsWith('//')
      ? returnTo
      : '/account'
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/callback/google`

  // We need the 'youtube.force-ssl' scope to allow liking and subscribing
  const scope = 'https://www.googleapis.com/auth/youtube.force-ssl'

  // RFC 6749 `state` CSRF defense; Google OAuth recommends an unguessable value verified on callback: https://developers.google.com/identity/protocols/oauth2/web-server#creatingclient
  const stateNonce = crypto.randomUUID()
  const statePayload = JSON.stringify({
    nonce: stateNonce,
    returnTo: safeReturnTo,
  })
  const encodedState = Buffer.from(statePayload, 'utf8').toString('base64url')

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', clientId!)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', scope)
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent')
  authUrl.searchParams.append('state', encodedState)

  const res = NextResponse.redirect(authUrl.toString())
  res.cookies.set(GOOGLE_YOUTUBE_OAUTH_STATE_COOKIE, stateNonce, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: STATE_MAX_AGE_SEC,
    path: '/',
  })
  return res
}
