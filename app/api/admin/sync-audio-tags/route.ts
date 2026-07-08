import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { syncSongAudioTags } from '@/lib/audio-tags/syncSongAudioTags'

/**
 * Manual tag sync for a single Song — runs download → ID3/Vorbis write →
 * re-upload immediately so admins don't wait for the daily Vercel Cron.
 *
 *   POST /api/admin/sync-audio-tags
 *   Body: { "songId": 27, "force": true }
 *
 * Auth: logged-in Payload admin (session cookie).
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

async function authenticateAdmin(): Promise<
  | { ok: true; payload: Awaited<ReturnType<typeof getPayload>> }
  | { ok: false; response: NextResponse }
> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    }
  }

  if ((user as { role?: string }).role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 },
      ),
    }
  }

  return { ok: true, payload }
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin()
  if (!auth.ok) return auth.response
  const { payload } = auth

  let body: { songId?: unknown; force?: unknown }
  try {
    body = (await req.json()) as { songId?: unknown; force?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const songId = Number(body.songId)
  if (!Number.isFinite(songId) || songId <= 0) {
    return NextResponse.json(
      { error: 'songId (positive number) is required' },
      { status: 400 },
    )
  }

  const force = body.force === true || body.force === 'true'

  payload.logger.info(
    `🎵 [AdminSyncTags] Manual sync requested for song id=${songId} (force=${force}).`,
  )

  const result = await syncSongAudioTags(payload, songId, { force })

  const song = await payload.findByID({
    collection: 'songs',
    id: songId,
    depth: 0,
    overrideAccess: true,
  })

  return NextResponse.json({
    ok: result.status !== 'error',
    result,
    tagSyncStatus: (song as { tagSyncStatus?: string }).tagSyncStatus ?? null,
    tagsSyncedAt: (song as { tagsSyncedAt?: string | null }).tagsSyncedAt ?? null,
    tagSyncError: (song as { tagSyncError?: string | null }).tagSyncError ?? null,
  })
}
