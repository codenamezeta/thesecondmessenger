import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { fulfillPendingPresaves } from '@/lib/presave/fulfillment'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false

  const url = new URL(request.url)
  const key = url.searchParams.get('key')
  const auth = request.headers.get('authorization') ?? ''

  return key === expected || auth === `Bearer ${expected}`
}

/**
 * Fulfill pending Spotify saves and YouTube likes for recently released songs.
 *
 * Schedule via cron-job.org (recommended) every 15–30 minutes around release
 * windows. Vercel Hobby only allows one daily run — see docs/PRESAVE_CRON.md.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: 'CRON_SECRET not configured' },
      { status: 500 },
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })
  const stats = await fulfillPendingPresaves(payload)

  return NextResponse.json({
    success: true,
    ...stats,
    message: `Scanned ${stats.presavesScanned} presave profiles. Spotify: ${stats.spotifyFulfilled}/${stats.spotifyAttempts}. YouTube: ${stats.youtubeFulfilled}/${stats.youtubeAttempts}.`,
  })
}
