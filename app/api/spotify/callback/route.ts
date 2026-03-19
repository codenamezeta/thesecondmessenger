import { NextResponse } from 'next/server'
import { saveSpotifyToken } from '@/actions/library-sync'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const songId = searchParams.get('state') // We stored the ID here

  if (!code || !songId) {
    return NextResponse.redirect(new URL('/error', request.url))
  }

  // 1. Run the Save Logic
  // This now returns { success, userId, redirectPath }
  const result = await saveSpotifyToken(code, songId)

  // 2. Set the Identity Cookie
  if (result.success && result.userId) {
    const cookieStore = await cookies()

    // Store the Payload Document ID so we can look up their history later
    cookieStore.set('tsm_user_id', result.userId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 90, // 90 Days
      sameSite: 'lax',
    })
  }

  // 3. Redirect
  // We use the path calculated by the Action (which knows the slug),
  // or fall back to home if something went wrong.
  const targetUrl = result.redirectPath || '/'

  return NextResponse.redirect(new URL(targetUrl, request.url))
}
