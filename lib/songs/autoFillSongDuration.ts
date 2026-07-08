import type { Payload, PayloadRequest } from 'payload'
import type { Song } from '@/payload-types'
import { getAudioDurationSeconds } from '@/lib/audio-tags/getAudioDurationSeconds'
import type { TaggableUploadCollection } from '@/lib/audio-tags/mapSongToTagSpec'
import { fetchUploadBytes } from '@/lib/storage/fetchUploadBytes'
import { formatDurationMmSs } from '@/lib/songs/formatDurationMmSs'

type MasterPick = {
  collection: TaggableUploadCollection
  id: number
}

function relationId(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'object' && 'id' in value) {
    const id = (value as { id: unknown }).id
    if (typeof id === 'number') return id
  }
  return null
}

function pickMastersForDuration(
  merged: Record<string, unknown>,
): MasterPick[] {
  const out: MasterPick[] = []
  const mp3 = relationId(merged.masterAudio)
  if (mp3) out.push({ collection: 'media', id: mp3 })
  const flac = relationId(merged.masterAudioFlac)
  if (flac) out.push({ collection: 'gated-content', id: flac })
  const wav = relationId(merged.masterAudioWav)
  if (wav) out.push({ collection: 'gated-content', id: wav })
  return out
}

function pickMasterForDuration(
  merged: Record<string, unknown>,
): MasterPick | null {
  return pickMastersForDuration(merged)[0] ?? null
}

function masterSourceKey(pick: MasterPick | null): string | null {
  if (!pick) return null
  return `${pick.collection}:${pick.id}`
}

async function resolveUploadInfo(
  payload: Payload,
  pick: MasterPick,
  req?: PayloadRequest,
) {
  const doc = await payload.findByID({
    collection: pick.collection,
    id: pick.id,
    depth: 0,
    overrideAccess: true,
    ...(req ? { req } : {}),
  })
  if (!doc || typeof doc !== 'object') return null
  const d = doc as unknown as Record<string, unknown>
  return {
    collection: pick.collection,
    id: pick.id,
    url: typeof d.url === 'string' ? d.url : null,
    mimeType: typeof d.mimeType === 'string' ? d.mimeType : null,
    filename: typeof d.filename === 'string' ? d.filename : null,
    prefix: typeof d.prefix === 'string' ? d.prefix : null,
  }
}

export type AutoFillSongDurationArgs = {
  data: Record<string, unknown>
  originalDoc?: Song | null
  payload: Payload
  req: PayloadRequest
}

/**
 * When a song's master audio is attached or replaced, read the file length
 * with taglib-wasm and stamp `duration` (+ formatted `durationText`).
 */
export async function autoFillSongDuration({
  data,
  originalDoc,
  payload,
  req,
}: AutoFillSongDurationArgs): Promise<Record<string, unknown>> {
  const ctx = (req as unknown as { context?: Record<string, unknown> }).context
  if (ctx?.skipAudioTagSync) return data

  const merged: Record<string, unknown> = {
    ...(originalDoc as Record<string, unknown> | undefined),
    ...data,
  }

  const currentPick = pickMasterForDuration(merged)
  const previousPick = originalDoc
    ? pickMasterForDuration(originalDoc as unknown as Record<string, unknown>)
    : null

  const sourceChanged =
    masterSourceKey(currentPick) !== masterSourceKey(previousPick)
  const effectiveDuration =
    data.duration !== undefined ? data.duration : originalDoc?.duration
  const durationMissing =
    effectiveDuration === null || effectiveDuration === undefined

  if (!sourceChanged && !durationMissing) return data
  if (!currentPick) return data

  const picks = pickMastersForDuration(merged)
  let lastErr: unknown
  for (const pick of picks) {
    try {
      const upload = await resolveUploadInfo(payload, pick, req)
      if (!upload) continue

      const bytes = await fetchUploadBytes(upload)
      const seconds = await getAudioDurationSeconds(bytes)
      if (seconds === null) continue

      data.duration = seconds
      data.durationText = formatDurationMmSs(seconds)
      payload.logger.info(
        `🎵 [Songs] Auto-filled duration ${formatDurationMmSs(seconds)} from ${pick.collection} id=${pick.id}`,
      )
      return data
    } catch (err) {
      lastErr = err
      payload.logger.warn({
        err,
        msg: `🎵 [Songs] Duration read failed for ${pick.collection} id=${pick.id}; trying next master.`,
      })
    }
  }

  if (lastErr) {
    payload.logger.warn({
      err: lastErr,
      msg: '🎵 [Songs] Failed to auto-fill duration from any master audio.',
    })
  }

  return data
}

/** Read duration from the song's preferred master file (MP3 → FLAC → WAV). */
export async function readDurationFromSongMasters(
  payload: Payload,
  song: Record<string, unknown>,
  req?: PayloadRequest,
): Promise<number | null> {
  for (const pick of pickMastersForDuration(song)) {
    try {
      const upload = await resolveUploadInfo(payload, pick, req)
      if (!upload) continue
      const bytes = await fetchUploadBytes(upload)
      const seconds = await getAudioDurationSeconds(bytes)
      if (seconds !== null) return seconds
    } catch {
      // Try the next available master (e.g. missing FLAC in R2).
    }
  }
  return null
}
