import type { Payload, PayloadRequest } from 'payload'
import type { Song } from '@/payload-types'

/**
 * Called from the Songs `afterChange` hook. Decides whether the save
 * was tag-relevant and, if so, enqueues a `syncAudioTags` job for the
 * worker to pick up later.
 *
 * We never do the heavy lifting (download → mutate → upload) inside the
 * request; that would block admin saves on multi-megabyte file IO and
 * is fragile against Vercel's serverless time limits. The actual work
 * happens in `syncSongAudioTags`, invoked by the Payload jobs runner
 * via Vercel Cron.
 *
 * Re-entrancy: the sync orchestrator updates the Song with
 * `context.skipAudioTagSync = true` when stamping status fields, so
 * we never queue a job for our own status writes.
 */
export type QueueArgs = {
  payload: Payload
  doc: Song
  previousDoc?: Song
  req: PayloadRequest
}

export async function queueAudioTagSync({
  payload,
  doc,
  previousDoc,
  req,
}: QueueArgs): Promise<'queued' | 'skipped'> {
  // Bail if the orchestrator itself is the one writing.
  const ctx = (req as unknown as { context?: Record<string, unknown> }).context
  if (ctx?.skipAudioTagSync) return 'skipped'

  // Bail if there's no master audio to write into.
  if (!doc.masterAudio) return 'skipped'

  // Bail if nothing tag-relevant changed.
  if (previousDoc && !tagRelevantChange(doc, previousDoc)) return 'skipped'

  try {
    // Must reuse the inbound `req` so this update joins the caller's transaction.
    // A fresh req (Payload's default when `req` is omitted) opens a separate
    // transaction that blocks on this song row until afterChange completes —
    // and afterChange awaits this call, which deadlocks saves in admin UI.
    await payload.update({
      collection: 'songs',
      id: doc.id,
      data: { tagSyncStatus: 'queued' } as Record<string, unknown>,
      overrideAccess: true,
      req,
      context: { skipAudioTagSync: true },
    })
  } catch (err) {
    payload.logger.warn({
      err,
      msg: `🎵 [QueueTags] Could not stamp queued status for song id=${doc.id}.`,
    })
  }

  // Try Payload's built-in jobs queue. If it's not configured, we fall
  // back to a no-op — the Vercel Cron run will still pick up any songs
  // marked `queued` on its next pass.
  type QueueFn = (args: {
    task: string
    input: Record<string, unknown>
    req?: PayloadRequest
  }) => Promise<unknown>
  const jobs = (payload as unknown as { jobs?: { queue?: QueueFn } }).jobs
  if (jobs?.queue) {
    try {
      await jobs.queue({
        task: 'syncAudioTags',
        input: { songId: doc.id },
        req,
      })
      return 'queued'
    } catch (err) {
      payload.logger.warn({
        err,
        msg: `🎵 [QueueTags] payload.jobs.queue failed for song id=${doc.id}; relying on cron sweep.`,
      })
    }
  }

  return 'queued'
}

/**
 * Conservative comparison of fields that influence the TagSpec. Any
 * change here triggers a re-sync. The hash check inside the orchestrator
 * is the final word — this is just an early-out for the common "user
 * tweaked an unrelated field" case.
 */
function tagRelevantChange(a: Song, b: Song): boolean {
  type Indexable = Record<string, unknown>
  const ai = a as unknown as Indexable
  const bi = b as unknown as Indexable

  const keys = [
    'title',
    'slug',
    'releaseDate',
    'masterAudio',
    'coverArt',
    'compositionType',
    'isExplicit',
    'isrc',
    'iswc',
    'duration',
    'bpm',
    'bpmEnd',
    'key',
    'keyEnd',
    'changesTempo',
    'changesKey',
    'genres',
    'subGenres',
    'activities',
    'themes',
    'moods',
    'production',
    'instruments',
    'gear',
    'arrangements',
    'influences',
    'otherTags',
    'credits',
    'lyrics',
    'comment',
    'featuredArtists',
    'primaryRelease',
    'phonogramCopyrightOwner',
    'compositionCopyrightOwner',
    'publisher',
    'termsOfUse',
    'termsOfUseCustom',
    'discNumber',
  ]

  for (const k of keys) {
    if (!shallowEqual(ai[k], bi[k])) return true
  }
  return false
}

function shallowEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return false
  if (typeof a !== typeof b) return false
  if (typeof a !== 'object') return false
  // Cheap deep-ish compare via JSON. The fields we care about are small.
  try {
    return JSON.stringify(a) === JSON.stringify(b)
  } catch {
    return false
  }
}
