import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getValidAccessToken } from '@/lib/youtube/token'
import type { User } from '@/payload-types'

/**
 * Returns a fresh YouTube access token for the currently-signed-in TSM user
 * if they have previously completed the server-side connect flow.
 *
 * Response shape:
 *   { accessToken: string, expiresAt: string }   - token is ready to use
 *   { accessToken: null }                        - no persistent connection;
 *                                                  client should fall back to
 *                                                  the GIS implicit popup flow
 *
 * Never throws to the client — errors become `{ accessToken: null }` so the
 * browser can cleanly fall through to the anonymous OAuth path.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user || !user.youtubeConnected) {
      return NextResponse.json({ accessToken: null }, { status: 200 })
    }

    const accessToken = await getValidAccessToken(user as User, payload)
    return NextResponse.json({
      accessToken,
      expiresAt: (user as User).googleTokenExpiry,
    })
  } catch (err) {
    console.error('[youtube/token] failed to resolve token', err)
    return NextResponse.json({ accessToken: null }, { status: 200 })
  }
}
