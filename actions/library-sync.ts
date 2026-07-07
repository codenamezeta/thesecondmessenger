'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getServerSideURL } from '@/utilities/getURL'
import { isSongReleased } from '@/lib/music/songRelease'
import {
  parseIntentStatusMap,
  upsertSongIntent,
  getSongIntent,
} from '@/lib/presave/intents'
import {
  ensureSpotifyArtistFollowed,
} from '@/lib/presave/fulfillment'
import {
  followSpotifyArtist,
  refreshSpotifyToken,
  saveTrackToLibrary,
} from '@/utilities/spotify'

// --- SPOTIFY CONFIG ---
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

// Must match a Redirect URI registered in the Spotify Developer Dashboard exactly.
function getSpotifyRedirectUri(): string {
  return `${getServerSideURL()}/api/spotify/callback`
}

// Scopes: "user-library-modify" (Saving songs) + "user-follow-modify" (Pre-save artists)
const SPOTIFY_SCOPES = 'user-library-modify user-follow-modify user-read-email'

export type SaveSpotifyResult = {
  success: boolean
  userId?: string
  redirectPath: string
  error?: string
}

function songRedirectPath(
  slug: string | null | undefined,
  params: Record<string, string>,
): string {
  const search = new URLSearchParams(params).toString()
  if (!slug) return search ? `/?${search}` : '/'
  return `/music/${slug}${search ? `?${search}` : ''}`
}

async function resolveSongRedirectPath(
  songId: string,
  params: Record<string, string>,
): Promise<string> {
  const songIdTyped = Number(songId)
  if (isNaN(songIdTyped)) return songRedirectPath(null, params)

  try {
    const payload = await getPayload({ config: configPromise })
    const songDoc = await payload.findByID({
      collection: 'songs',
      id: songIdTyped,
    })
    return songRedirectPath(songDoc?.slug, params)
  } catch {
    return songRedirectPath(null, params)
  }
}

function assertSpotifyConfig(): void {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify integration is not configured on this server.')
  }
  if (!getServerSideURL()) {
    throw new Error('NEXT_PUBLIC_SERVER_URL is not configured.')
  }
}

/**
 * 1. SPOTIFY: Generate the Login URL
 * Call this when the user clicks "Connect Spotify"
 */
export async function getSpotifyAuthUrl(songId: string): Promise<string> {
  assertSpotifyConfig()

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID!,
    scope: SPOTIFY_SCOPES,
    redirect_uri: getSpotifyRedirectUri(),
    state: songId,
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

/**
 * Save a released track immediately when the user already has a presave cookie.
 */
export async function saveSpotifyTrackNow(songId: string): Promise<{
  success: boolean
  error?: string
}> {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const presaveId = cookieStore.get('tsm_user_id')?.value
  if (!presaveId) {
    return { success: false, error: 'No Spotify connection on this device.' }
  }

  try {
    assertSpotifyConfig()
    const payload = await getPayload({ config: configPromise })
    const presave = await payload.findByID({
      collection: 'presaves',
      id: presaveId,
      depth: 0,
    })

    if (!presave.refreshToken) {
      return { success: false, error: 'Spotify session expired. Re-connect.' }
    }

    const songIdNum = Number(songId)
    const song = await payload.findByID({
      collection: 'songs',
      id: songIdNum,
      depth: 0,
    })

    if (!song.spotifyId) {
      return { success: false, error: 'This song is not on Spotify yet.' }
    }

    const accessToken = await refreshSpotifyToken(presave.refreshToken)
    if (!accessToken) {
      return { success: false, error: 'Could not refresh Spotify token.' }
    }

    await followSpotifyArtist(accessToken)
    const saved = await saveTrackToLibrary(accessToken, [song.spotifyId])
    if (!saved) {
      return { success: false, error: 'Spotify library save failed.' }
    }

    const intentMap = upsertSongIntent(
      parseIntentStatusMap(presave.intentStatus),
      songIdNum,
      {
        spotify: 'fulfilled',
        spotifyFulfilledAt: new Date().toISOString(),
      },
    )

    await payload.update({
      collection: 'presaves',
      id: presaveId,
      data: { intentStatus: intentMap },
    })

    return { success: true }
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Spotify save failed.',
    }
  }
}

/**
 * 2. SPOTIFY: Exchange Code for Token (Pre-Save Logic)
 * This is called by your Callback Route
 */
export async function saveSpotifyToken(
  code: string,
  songId: string,
): Promise<SaveSpotifyResult> {
  const failurePath = await resolveSongRedirectPath(songId, {
    error: 'spotify',
    action: 'spotify',
  })

  try {
    assertSpotifyConfig()

    const redirectUri = getSpotifyRedirectUri()

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
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    const tokens = await tokenResponse.json()

    if (tokens.error) {
      console.error('Spotify Token Error:', tokens)
      return {
        success: false,
        redirectPath: failurePath,
        error: tokens.error_description ?? tokens.error,
      }
    }

    const userResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    const userData = await userResponse.json()

    if (userData.error) {
      console.error('Spotify User Error:', userData)
      return {
        success: false,
        redirectPath: failurePath,
        error: userData.error.message ?? 'Failed to read Spotify profile.',
      }
    }

    const songIdTyped = Number(songId)
    if (isNaN(songIdTyped)) {
      console.error('Invalid Song ID:', songId)
      return {
        success: false,
        redirectPath: failurePath,
        error: 'Invalid song reference.',
      }
    }

    const payload = await getPayload({ config: configPromise })

    const existingUser = await payload.find({
      collection: 'presaves',
      where: { spotifyId: { equals: userData.id } },
    })

    let presaveDocId: number | string = ''
    const refreshTokenUpdate =
      typeof tokens.refresh_token === 'string' ? tokens.refresh_token : undefined

    let existingIntentMap = parseIntentStatusMap(
      existingUser.totalDocs > 0 ? existingUser.docs[0].intentStatus : {},
    )
    const priorIntent = getSongIntent(existingIntentMap, songIdTyped)
    existingIntentMap = upsertSongIntent(existingIntentMap, songIdTyped, {
      spotify:
        priorIntent.spotify === 'fulfilled' ? 'fulfilled' : 'pending',
    })

    if (existingUser.totalDocs > 0) {
      const doc = existingUser.docs[0]
      presaveDocId = doc.id

      const currentCampaigns = (doc.campaigns || []).map(
        (c: number | { id: number }) => (typeof c === 'object' ? c.id : c),
      )

      const updateData: {
        refreshToken?: string
        campaigns?: number[]
        intentStatus?: typeof existingIntentMap
      } = {
        intentStatus: existingIntentMap,
      }

      if (refreshTokenUpdate) {
        updateData.refreshToken = refreshTokenUpdate
      }

      if (!currentCampaigns.includes(songIdTyped)) {
        updateData.campaigns = [...currentCampaigns, songIdTyped]
      }

      if (Object.keys(updateData).length > 0) {
        await payload.update({
          collection: 'presaves',
          id: doc.id,
          data: updateData,
        })
      }
    } else {
      if (!userData.email) {
        console.error('Spotify account has no email:', userData.id)
        return {
          success: false,
          redirectPath: failurePath,
          error:
            'Spotify did not share an email address. Enable email access for this app in your Spotify account settings.',
        }
      }

      if (!refreshTokenUpdate) {
        console.error('Spotify did not return a refresh token for new user')
        return {
          success: false,
          redirectPath: failurePath,
          error: 'Spotify authorization was incomplete. Please try again.',
        }
      }

      const newDoc = await payload.create({
        collection: 'presaves',
        data: {
          email: userData.email,
          spotifyId: userData.id,
          refreshToken: refreshTokenUpdate,
          campaigns: [songIdTyped],
          intentStatus: existingIntentMap,
        },
      })
      presaveDocId = newDoc.id
    }

    await followSpotifyArtist(tokens.access_token)
    await ensureSpotifyArtistFollowed(payload, presaveDocId, tokens.access_token)

    const songDoc = await payload.findByID({
      collection: 'songs',
      id: songIdTyped,
    })

    if (songDoc?.spotifyId) {
      const saveResponse = await fetch('https://api.spotify.com/v1/me/tracks', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids: [songDoc.spotifyId] }),
      })

      if (saveResponse.ok) {
        const fulfilledMap = upsertSongIntent(
          parseIntentStatusMap(
            (
              await payload.findByID({
                collection: 'presaves',
                id: presaveDocId,
                depth: 0,
              })
            ).intentStatus,
          ),
          songIdTyped,
          {
            spotify: 'fulfilled',
            spotifyFulfilledAt: new Date().toISOString(),
          },
        )
        await payload.update({
          collection: 'presaves',
          id: presaveDocId,
          data: { intentStatus: fulfilledMap },
        })
      } else {
        const err = await saveResponse.text()
        console.error('Spotify library save failed:', err)
      }
    } else if (isSongReleased(songDoc?.releaseDate, songDoc?.premiereAt)) {
      // Released but no Spotify ID yet — cron will pick up when ID is added.
    }

    return {
      success: true,
      userId: String(presaveDocId),
      redirectPath: songRedirectPath(songDoc?.slug, {
        success: 'true',
        action: 'spotify',
      }),
    }
  } catch (e) {
    console.error('Spotify save flow error:', e)
    return {
      success: false,
      redirectPath: failurePath,
      error: e instanceof Error ? e.message : 'Unexpected Spotify sync error.',
    }
  }
}
