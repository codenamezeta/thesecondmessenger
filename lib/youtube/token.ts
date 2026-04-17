import type { Payload } from 'payload'
import type { User } from '@/payload-types'

/**
 * Returns a valid YouTube (Google OAuth) access token for a TSM user that has
 * completed the server-side OAuth connect flow. Refreshes silently against
 * Google's token endpoint when the stored access token is within 1 minute of
 * expiry, persisting the new token back to the user document.
 *
 * Throws if the user has no refresh token on file (they must re-run the
 * connect flow at `/api/auth/youtube/connect`).
 */
export async function getValidAccessToken(
  user: User,
  payload: Payload,
): Promise<string> {
  const now = new Date()
  const expiry = user.googleTokenExpiry
    ? new Date(user.googleTokenExpiry)
    : new Date(0)

  if (user.googleAccessToken && expiry > new Date(now.getTime() + 60_000)) {
    return user.googleAccessToken
  }

  if (!user.googleRefreshToken) {
    throw new Error('No refresh token available. User must reconnect YouTube.')
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: user.googleRefreshToken,
      grant_type: 'refresh_token',
    }),
  })

  const tokens = (await tokenResponse.json()) as {
    access_token?: string
    expires_in?: number
    error?: string
  }

  if (tokens.error || !tokens.access_token || !tokens.expires_in) {
    throw new Error('Failed to refresh YouTube token.')
  }

  const newExpiry = new Date()
  newExpiry.setSeconds(newExpiry.getSeconds() + tokens.expires_in)

  await payload.update({
    collection: 'users',
    id: user.id,
    data: {
      googleAccessToken: tokens.access_token,
      googleTokenExpiry: newExpiry.toISOString(),
    },
  })

  return tokens.access_token
}
