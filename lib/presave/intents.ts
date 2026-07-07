export type PlatformIntentStatus = 'pending' | 'fulfilled' | 'failed'

export type SongIntentRecord = {
  spotify?: PlatformIntentStatus
  youtube?: PlatformIntentStatus
  spotifyError?: string
  youtubeError?: string
  spotifyFulfilledAt?: string
  youtubeFulfilledAt?: string
}

/** Keyed by Payload song id (string). */
export type IntentStatusMap = Record<string, SongIntentRecord>

export function parseIntentStatusMap(
  raw: unknown,
): IntentStatusMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {}
  return raw as IntentStatusMap
}

export function getSongIntent(
  map: IntentStatusMap,
  songId: number | string,
): SongIntentRecord {
  return map[String(songId)] ?? {}
}

export function upsertSongIntent(
  map: IntentStatusMap,
  songId: number | string,
  patch: Partial<SongIntentRecord>,
): IntentStatusMap {
  const key = String(songId)
  return {
    ...map,
    [key]: {
      ...getSongIntent(map, songId),
      ...patch,
    },
  }
}

export function isPlatformPending(
  map: IntentStatusMap,
  songId: number | string,
  platform: 'spotify' | 'youtube',
): boolean {
  const status = getSongIntent(map, songId)[platform]
  return status === 'pending' || status === undefined
}

export function isPlatformFulfilled(
  map: IntentStatusMap,
  songId: number | string,
  platform: 'spotify' | 'youtube',
): boolean {
  return getSongIntent(map, songId)[platform] === 'fulfilled'
}
