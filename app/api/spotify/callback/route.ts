import { NextResponse } from 'next/server'
import { saveSpotifyToken } from '@/actions/library-sync'
import { cookies } from 'next/headers'
import { getServerSideURL } from '@/utilities/getURL'

export const dynamic = 'force-dynamic'

function redirectTo(path: string, request: Request): NextResponse {
  return NextResponse.redirect(new URL(path, getServerSideURL() || request.url))
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const songId = searchParams.get('state')
  const oauthError = searchParams.get('error')

  if (oauthError) {
    console.error('Spotify OAuth error:', oauthError, searchParams.get('error_description'))
    const fallback = songId
      ? `/music?error=spotify&action=spotify&reason=${encodeURIComponent(oauthError)}`
      : '/?error=spotify'
    return redirectTo(fallback, request)
  }

  if (!code || !songId) {
    return redirectTo('/?error=spotify&reason=missing_code', request)
  }

  try {
    const result = await saveSpotifyToken(code, songId)

    if (result.success && result.userId) {
      const cookieStore = await cookies()
      cookieStore.set('tsm_user_id', result.userId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 90,
        sameSite: 'lax',
      })
    }

    return redirectTo(result.redirectPath, request)
  } catch (e) {
    console.error('Spotify callback route error:', e)
    return redirectTo('/?error=spotify&reason=callback_failed', request)
  }
}
