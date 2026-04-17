import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Best-effort revocation against Google so the token is actually invalidated
// upstream. We deliberately do not fail the disconnect if Google returns an
// error — the token could already be invalid, and we still want to scrub our
// copy of it either way.
async function revokeWithGoogle(token: string): Promise<void> {
  try {
    await fetch('https://oauth2.googleapis.com/revoke', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ token }),
    })
  } catch (error) {
    console.warn('Google token revoke request failed:', error)
  }
}

export async function POST() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const fullUser = await payload.findByID({
      collection: 'users',
      id: user.id,
      depth: 0,
      overrideAccess: true,
    })

    const tokensToRevoke = [fullUser.googleRefreshToken, fullUser.googleAccessToken]
      .filter((token): token is string => typeof token === 'string' && token.length > 0)

    await Promise.all(tokensToRevoke.map(revokeWithGoogle))

    await payload.update({
      collection: 'users',
      id: user.id,
      overrideAccess: true,
      data: {
        youtubeConnected: false,
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('YouTube disconnect failed:', error)
    return NextResponse.json(
      { error: 'Could not disconnect YouTube. Please try again.' },
      { status: 500 },
    )
  }
}
