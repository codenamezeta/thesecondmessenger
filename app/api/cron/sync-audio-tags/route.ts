import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

// Vercel Cron hits this route on a schedule in vercel.json (daily on
// Hobby; upgrade or use an external pinger to hit this URL for faster
// production syncs). It's the worker side of the audio-tag sync:
// for each Song in `tagSyncStatus = queued`, run the full
// download → mutate → upload flow.
//
// We also drain Payload's built-in jobs queue (`payload.jobs.run`),
// which is the primary path triggered from the Songs `afterChange`
// hook. The DB sweep is just a belt-and-suspenders backup so a song
// can never get stranded in `queued` indefinitely.

export const dynamic = 'force-dynamic'
// On Vercel, audio re-tagging is IO-heavy (download a multi-MB file,
// mutate, re-upload). Allow the function up to ~5 min so a single run
// can chew through several queued songs.
export const maxDuration = 300

const BATCH_LIMIT = 10

export async function GET(request: Request) {
  // 1. Auth — require ?key=CRON_SECRET in the URL OR a Bearer header
  // (Vercel Cron sets the latter automatically when CRON_SECRET is set).
  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  const auth = request.headers.get('authorization') ?? ''
  const expected = process.env.CRON_SECRET

  if (!expected) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    )
  }

  const authorized = key === expected || auth === `Bearer ${expected}`
  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  const stats = {
    jobsRun: 0,
    sweepFound: 0,
    sweepEnqueued: 0,
    sweepErrors: 0,
  }

  // 2. Drain the Payload jobs queue first.
  try {
    const jobs = (
      payload as unknown as {
        jobs?: {
          run?: (args?: unknown) => Promise<{ noJobsRemaining?: boolean }>
        }
      }
    ).jobs
    if (jobs?.run) {
      const result = await jobs.run({ limit: BATCH_LIMIT })
      stats.jobsRun = (
        result as unknown as { jobStatus?: Record<string, unknown> }
      ).jobStatus
        ? Object.keys(
            (result as unknown as { jobStatus: Record<string, unknown> })
              .jobStatus,
          ).length
        : 0
    }
  } catch (err) {
    payload.logger.warn({
      err,
      msg: '🎵 [CronSyncTags] payload.jobs.run failed; continuing to sweep.',
    })
  }

  // 3. Sweep DB for songs marked `queued` that didn't make it onto the
  // jobs queue (e.g. a save that happened during a deploy). Re-enqueue.
  try {
    const queued = await payload.find({
      collection: 'songs',
      where: {
        tagSyncStatus: { equals: 'queued' },
      },
      limit: BATCH_LIMIT,
      depth: 0,
      overrideAccess: true,
    })
    stats.sweepFound = queued.docs.length

    const jobsApi = (
      payload as unknown as {
        jobs?: { queue?: (args: unknown) => Promise<unknown> }
      }
    ).jobs
    for (const song of queued.docs) {
      try {
        if (jobsApi?.queue) {
          await jobsApi.queue({
            task: 'syncAudioTags',
            input: { songId: song.id },
          })
          stats.sweepEnqueued += 1
        }
      } catch (err) {
        stats.sweepErrors += 1
        payload.logger.error({
          err,
          msg: `🎵 [CronSyncTags] Failed to re-enqueue song id=${song.id}.`,
        })
      }
    }
  } catch (err) {
    payload.logger.error({
      err,
      msg: '🎵 [CronSyncTags] Sweep failed.',
    })
  }

  return NextResponse.json({ ok: true, ...stats })
}
