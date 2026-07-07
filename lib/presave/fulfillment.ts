import type { Payload } from 'payload'
import type { Presave, Song, User } from '@/payload-types'
import { isSongReleased, resolveSongReleaseMs } from '@/lib/music/songRelease'
import {
  getSongIntent,
  parseIntentStatusMap,
  type IntentStatusMap,
  upsertSongIntent,
} from '@/lib/presave/intents'
import { likeVideoServer } from '@/lib/youtube/server'
import {
  followSpotifyArtist,
  refreshSpotifyToken,
  saveTrackToLibrary,
} from '@/utilities/spotify'

const FULFILLMENT_LOOKBACK_DAYS = 14

export type FulfillmentStats = {
  presavesScanned: number
  spotifyAttempts: number
  spotifyFulfilled: number
  youtubeAttempts: number
  youtubeFulfilled: number
  errors: number
}

function resolveCampaignIds(
  campaigns: Presave['campaigns'],
): number[] {
  if (!campaigns?.length) return []
  return campaigns.map((c) => (typeof c === 'object' ? c.id : c))
}

async function loadLinkedUser(
  payload: Payload,
  presave: Presave,
): Promise<User | null> {
  const linked = presave.linkedUser
  const userId =
    typeof linked === 'object' && linked !== null
      ? linked.id
      : typeof linked === 'number'
        ? linked
        : null

  if (!userId) return null

  try {
    return (await payload.findByID({
      collection: 'users',
      id: userId,
      depth: 0,
    })) as User
  } catch {
    return null
  }
}

async function fulfillSpotifyForSong(
  payload: Payload,
  presave: Presave,
  song: Song,
  intentMap: IntentStatusMap,
): Promise<{ map: IntentStatusMap; fulfilled: boolean; errored: boolean }> {
  if (!presave.refreshToken || !song.spotifyId) {
    return { map: intentMap, fulfilled: false, errored: false }
  }

  const current = getSongIntent(intentMap, song.id)
  if (current.spotify === 'fulfilled') {
    return { map: intentMap, fulfilled: false, errored: false }
  }

  const accessToken = await refreshSpotifyToken(presave.refreshToken)
  if (!accessToken) {
    return {
      map: upsertSongIntent(intentMap, song.id, {
        spotify: 'failed',
        spotifyError: 'Token refresh failed',
      }),
      fulfilled: false,
      errored: true,
    }
  }

  const success = await saveTrackToLibrary(accessToken, [song.spotifyId])
  if (!success) {
    return {
      map: upsertSongIntent(intentMap, song.id, {
        spotify: 'failed',
        spotifyError: 'Library save failed',
      }),
      fulfilled: false,
      errored: true,
    }
  }

  return {
    map: upsertSongIntent(intentMap, song.id, {
      spotify: 'fulfilled',
      spotifyFulfilledAt: new Date().toISOString(),
      spotifyError: undefined,
    }),
    fulfilled: true,
    errored: false,
  }
}

async function fulfillYouTubeForSong(
  payload: Payload,
  presave: Presave,
  song: Song,
  intentMap: IntentStatusMap,
): Promise<{ map: IntentStatusMap; fulfilled: boolean; errored: boolean }> {
  if (!song.youtubeId) {
    return { map: intentMap, fulfilled: false, errored: false }
  }

  const current = getSongIntent(intentMap, song.id)
  if (current.youtube === 'fulfilled') {
    return { map: intentMap, fulfilled: false, errored: false }
  }

  const linkedUser = await loadLinkedUser(payload, presave)
  if (!linkedUser?.googleRefreshToken) {
    return { map: intentMap, fulfilled: false, errored: false }
  }

  try {
    await likeVideoServer(song.youtubeId, linkedUser, payload)
    return {
      map: upsertSongIntent(intentMap, song.id, {
        youtube: 'fulfilled',
        youtubeFulfilledAt: new Date().toISOString(),
        youtubeError: undefined,
      }),
      fulfilled: true,
      errored: false,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'YouTube like failed'
    return {
      map: upsertSongIntent(intentMap, song.id, {
        youtube: 'failed',
        youtubeError: message,
      }),
      fulfilled: false,
      errored: true,
    }
  }
}

function isWithinFulfillmentWindow(
  releaseDate: string | null | undefined,
  premiereAt: string | null | undefined,
  now: Date,
): boolean {
  if (!isSongReleased(releaseDate, premiereAt, now)) return false

  const ms = resolveSongReleaseMs(releaseDate, premiereAt)
  if (ms === null) return false

  const releasedAt = ms
  const windowMs = FULFILLMENT_LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  return now.getTime() - releasedAt <= windowMs
}

/**
 * Process pending presave intents for recently released songs.
 * Safe to run frequently via cron-job.org.
 */
export async function fulfillPendingPresaves(
  payload: Payload,
): Promise<FulfillmentStats> {
  const now = new Date()
  const stats: FulfillmentStats = {
    presavesScanned: 0,
    spotifyAttempts: 0,
    spotifyFulfilled: 0,
    youtubeAttempts: 0,
    youtubeFulfilled: 0,
    errors: 0,
  }

  const presaves = await payload.find({
    collection: 'presaves',
    limit: 2000,
    depth: 0,
  })

  for (const presave of presaves.docs) {
    stats.presavesScanned++

    let intentMap = parseIntentStatusMap(presave.intentStatus)
    const campaignIds = resolveCampaignIds(presave.campaigns)
    const songIds = new Set<number>(campaignIds)

    for (const key of Object.keys(intentMap)) {
      const id = Number(key)
      if (!Number.isNaN(id)) songIds.add(id)
    }

    if (songIds.size === 0) continue

    let mapChanged = false

    for (const songId of songIds) {
      let song: Song
      try {
        song = (await payload.findByID({
          collection: 'songs',
          id: songId,
          depth: 0,
        })) as Song
      } catch {
        continue
      }

      if (!isWithinFulfillmentWindow(song.releaseDate, song.premiereAt, now)) continue

      const intent = getSongIntent(intentMap, song.id)
      const needsSpotify =
        presave.refreshToken &&
        song.spotifyId &&
        intent.spotify !== 'fulfilled' &&
        (intent.spotify === 'pending' ||
          intent.spotify === 'failed' ||
          campaignIds.includes(song.id))

      const needsYouTube =
        song.youtubeId &&
        intent.youtube !== 'fulfilled' &&
        (intent.youtube === 'pending' ||
          intent.youtube === 'failed' ||
          campaignIds.includes(song.id))

      if (needsSpotify) {
        stats.spotifyAttempts++
        const result = await fulfillSpotifyForSong(
          payload,
          presave,
          song,
          intentMap,
        )
        intentMap = result.map
        mapChanged = true
        if (result.fulfilled) stats.spotifyFulfilled++
        if (result.errored) stats.errors++
      }

      if (needsYouTube) {
        stats.youtubeAttempts++
        const result = await fulfillYouTubeForSong(
          payload,
          presave,
          song,
          intentMap,
        )
        intentMap = result.map
        mapChanged = true
        if (result.fulfilled) stats.youtubeFulfilled++
        if (result.errored) stats.errors++
      }
    }

    if (mapChanged) {
      await payload.update({
        collection: 'presaves',
        id: presave.id,
        data: { intentStatus: intentMap },
      })
    }
  }

  return stats
}

/**
 * Follow artist once per presave profile (idempotent).
 */
export async function ensureSpotifyArtistFollowed(
  payload: Payload,
  presaveId: number | string,
  accessToken: string,
): Promise<void> {
  const doc = await payload.findByID({
    collection: 'presaves',
    id: presaveId,
    depth: 0,
  })

  if (doc.artistFollowedAt) return

  const followed = await followSpotifyArtist(accessToken)
  if (followed) {
    await payload.update({
      collection: 'presaves',
      id: presaveId,
      data: { artistFollowedAt: new Date().toISOString() },
    })
  }
}
