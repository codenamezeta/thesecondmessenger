'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'

// --- SPOTIFY CONFIG ---
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET
// CRITICAL: This must match your .env NEXT_PUBLIC_SERVER_URL (http://127.0.0.1:3000 locally)
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/spotify/callback`

// Scopes: "user-library-modify" (Saving songs) + "user-follow-modify" (Pre-save artists)
const SPOTIFY_SCOPES = 'user-library-modify user-follow-modify user-read-email'

/**
 * 1. SPOTIFY: Generate the Login URL
 * Call this when the user clicks "Connect Spotify"
 */
export async function getSpotifyAuthUrl(songId: string) {
  const state = songId // Pass song ID as state to preserve it through the redirect

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES,
    redirect_uri: REDIRECT_URI,
    state: state,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

/**
 * 2. SPOTIFY: Exchange Code for Token (Pre-Save Logic)
 * This is called by your Callback Route
 */
export async function saveSpotifyToken(code: string, songId: string) {
  // A. Trade Code for Tokens
  const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`,
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenResponse.json()

  if (tokens.error) {
    console.error('Spotify Token Error:', tokens)
    return { success: false }
  }

  // B. Get User Profile (for Email)
  const userResponse = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })
  const userData = await userResponse.json()

  if (userData.error) {
    console.error('Spotify User Error:', userData)
    return { success: false }
  }

  // C. Save to Payload CMS
  const payload = await getPayload({ config: configPromise })

  // Ensure songId is the correct type (number) for the relationship field
  const songIdTyped = Number(songId)
  if (isNaN(songIdTyped)) {
    console.error('Invalid Song ID:', songId)
    return { success: false }
  }

  try {
    // Check if user exists in Presaves
    const existingUser = await payload.find({
      collection: 'presaves',
      where: { spotifyId: { equals: userData.id } },
    })

    let presaveDocId: number | string = ''

    if (existingUser.totalDocs > 0) {
      // Update existing user
      const doc = existingUser.docs[0]
      presaveDocId = doc.id

      // Get existing campaigns safely
      const currentCampaigns = (doc.campaigns || []).map(
        (c: number | { id: number }) => (typeof c === 'object' ? c.id : c),
      )

      // Add new songId if not already there
      if (!currentCampaigns.includes(songIdTyped)) {
        await payload.update({
          collection: 'presaves',
          id: doc.id,
          data: {
            refreshToken: tokens.refresh_token, // Always update refresh token
            campaigns: [...currentCampaigns, songIdTyped], // <--- ADD THE SONG ID
          },
        })
      } else {
        // Just update token if song exists
        await payload.update({
          collection: 'presaves',
          id: doc.id,
          data: { refreshToken: tokens.refresh_token },
        })
      }
    } else {
      // Create new Pre-Save User
      const newDoc = await payload.create({
        collection: 'presaves',
        data: {
          email: userData.email,
          spotifyId: userData.id,
          refreshToken: tokens.refresh_token,
          campaigns: [songIdTyped], // <--- START THE ARRAY
        },
      })
      presaveDocId = newDoc.id
    }

    // D. IMMEDIATE ACTION: Save the song now (if ID is known)
    // We fetch the song from Payload to get the actual Spotify ID
    const songDoc = await payload.findByID({
      collection: 'songs',
      id: songIdTyped,
    })

    if (songDoc && songDoc.spotifyId) {
      await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [songDoc.spotifyId] }),
      })
    }

    // Return success AND the User ID for the cookie
    return {
      success: true,
      userId: String(presaveDocId),
      // Return the path so the API route knows where to redirect
      redirectPath: songDoc
        ? `/songs/${songDoc.slug}?success=true&action=spotify`
        : '/',
    }
  } catch (e) {
    console.error('Payload Save Error:', e)
    return { success: false }
  }
}

/**
 * 3. YOUTUBE: Like Video
 */
export async function likeYouTubeVideo(videoId: string, accessToken: string) {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos/rate?id=${videoId}&rating=like`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    if (!res.ok) throw new Error('Failed to like video')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

/**
 * 4. YOUTUBE: Subscribe (Pre-Save Equivalent)
 */
// ... (imports)

export async function subscribeToChannel(
  channelId: string | undefined,
  accessToken: string,
) {
  const targetChannelId = channelId || process.env.YOUTUBE_CHANNEL_ID

  if (!targetChannelId) {
    console.error('No Channel ID provided for subscription')
    return { success: false }
  }

  try {
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

      console.error(
        'YouTube Subscribe Error:',
        JSON.stringify(errorData, null, 2),
      )
      throw new Error(
        `Failed to subscribe: ${errorData.error?.message || res.statusText}`,
      )
    }
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
