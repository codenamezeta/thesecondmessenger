import type { Payload } from 'payload'
import { getValidAccessToken } from '@/lib/youtube/token'
import type { User } from '@/payload-types'

/**
 * Server-side YouTube like for cron fulfillment (uses stored refresh token).
 */
export async function likeVideoServer(
  videoId: string,
  user: User,
  payload: Payload,
): Promise<void> {
  const accessToken = await getValidAccessToken(user, payload)

  const url = `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(
    videoId,
  )}&rating=like`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Length': '0',
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(body || `YouTube like failed (${res.status})`)
  }
}
