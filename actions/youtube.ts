'use server'

// --- NEW IMPORTS FOR PAYLOAD / OAUTH ---
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { headers } from 'next/headers'
import type { Payload } from 'payload'
import type { User } from '@/payload-types'

// ==========================================
// 1. YOUR EXISTING CODE (UNTOUCHED)
// ==========================================

/** Normalized playlist item for the Visual Log / videos page. */
export type YoutubeChannelVideo = {
  id: string
  youtubeId: string
  title: string
  publishedDate: string
  description: string
  category: string
  linkedSong: null
}

export async function getChannelVideos(
  maxResults = 20,
): Promise<YoutubeChannelVideo[]> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID // Add this to your .env

  if (!API_KEY || !CHANNEL_ID) return []

  const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU')

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!res.ok) return []

    const data = await res.json()

    return data.items.map(
      (item: {
        id: string
        snippet: {
          title: string
          publishedAt: string
          description: string
          resourceId: { videoId: string }
        }
      }) => ({
        id: item.id,
        youtubeId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedDate: item.snippet.publishedAt,
        description: item.snippet.description,
        category: 'Transmission Log',
        linkedSong: null,
      }),
    )
  } catch (error) {
    console.error('YouTube Fetch Error:', error)
    return []
  }
}

async function handleResponse(res: Response, defaultMessage: string) {
  if (!res.ok) {
    let errorMessage = defaultMessage
    try {
      const error = await res.json()
      errorMessage = error.error?.message || errorMessage
    } catch {
      errorMessage += ` (${res.status} ${res.statusText})`
    }
    throw new Error(errorMessage)
  }
  return res.json()
}

async function getAuthenticatedYouTubeContext() {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user || !user.youtubeConnected) {
    throw new Error('Not connected to YouTube')
  }

  const accessToken = await getValidAccessToken(user as User, payload)
  return { accessToken, payload, user }
}

export async function postCommentAction(videoId: string, textOriginal: string) {
  const { accessToken } = await getAuthenticatedYouTubeContext()

  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
  url.searchParams.set('part', 'snippet')

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal,
          },
        },
      },
    }),
  })

  return handleResponse(res, 'Failed to post comment')
}

export async function replyToCommentAction(
  parentId: string,
  textOriginal: string,
) {
  const { accessToken } = await getAuthenticatedYouTubeContext()

  const url = new URL('https://www.googleapis.com/youtube/v3/comments')
  url.searchParams.set('part', 'snippet')

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        parentId,
        textOriginal,
      },
    }),
  })

  return handleResponse(res, 'Failed to post reply')
}

// ==========================================
// 2. NEW OAUTH & BACKGROUND ACTIONS
// ==========================================

// Helper function to handle the Google Token Refresh
async function getValidAccessToken(user: User, payload: Payload) {
  const now = new Date()
  const expiry = user.googleTokenExpiry
    ? new Date(user.googleTokenExpiry)
    : new Date(0)

  // If the token is still good (adding a 1-minute buffer), just return it
  if (user.googleAccessToken && expiry > new Date(now.getTime() + 60000)) {
    return user.googleAccessToken
  }

  // If it's expired (or missing), we MUST use the refresh token
  if (!user.googleRefreshToken) {
    throw new Error('No refresh token available. User must reconnect YouTube.')
  }

  // Ask Google for a new Access Token
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

  const tokens = await tokenResponse.json()

  if (tokens.error) {
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

export async function likeYouTubeVideo(videoId: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user || !user.youtubeConnected) {
      return { success: false, error: 'Not connected to YouTube' }
    }

    // 1. Get a guaranteed valid token (refreshes silently if needed!)
    const accessToken = await getValidAccessToken(user, payload)

    // 2. Hit the YouTube Data API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Length': '0', // Required by YouTube for empty POST bodies
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('YouTube API Error:', errorData)
      return { success: false, error: 'Failed to like video on YouTube' }
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Like Action Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function subscribeToChannel(channelId?: string) {
  try {
    const payload = await getPayload({ config: configPromise })
    const { user } = await payload.auth({ headers: await headers() })

    if (!user || !user.youtubeConnected) {
      return { success: false, error: 'Not connected to YouTube' }
    }

    // Grab the auto-refreshing token from the vault!
    const accessToken = await getValidAccessToken(user, payload)

    const targetChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID

    if (!targetChannelId) {
      return { success: false, error: 'No Channel ID provided' }
    }

    const res = await fetch(
      'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snippet: {
            resourceId: {
              kind: 'youtube#channel',
              channelId: targetChannelId,
            },
          },
        }),
      },
    )

    if (!res.ok) {
      const errorData = await res.json()
      // Handle "Already Subscribed" as success
      if (errorData?.error?.errors?.[0]?.reason === 'subscriptionDuplicate') {
        return { success: true }
      }
      throw new Error(errorData.error?.message || 'Failed to subscribe')
    }

    return { success: true }
  } catch (error: unknown) {
    console.error('Subscribe Action Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
