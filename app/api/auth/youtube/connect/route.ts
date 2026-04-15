import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const returnTo = req.nextUrl.searchParams.get('returnTo') || '/account'
  const safeReturnTo =
    returnTo.startsWith('/') && !returnTo.startsWith('//') ? returnTo : '/account'
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth/callback/google`

  // We need the 'youtube.force-ssl' scope to allow liking and subscribing
  const scope = 'https://www.googleapis.com/auth/youtube.force-ssl'

  // The magic parameters: access_type=offline and prompt=consent
  // These are REQUIRED to force Google to give us a Refresh Token
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  authUrl.searchParams.append('client_id', clientId!)
  authUrl.searchParams.append('redirect_uri', redirectUri)
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('scope', scope)
  authUrl.searchParams.append('access_type', 'offline')
  authUrl.searchParams.append('prompt', 'consent')
  authUrl.searchParams.append('state', safeReturnTo)

  return NextResponse.redirect(authUrl.toString())
}
