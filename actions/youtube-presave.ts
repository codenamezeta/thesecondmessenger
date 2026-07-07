'use server'

import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getMeUser } from '@/utilities/getMeUser'
import {
  parseIntentStatusMap,
  upsertSongIntent,
} from '@/lib/presave/intents'
import { isSongReleased } from '@/lib/music/songRelease'

export type RecordYouTubePresaveResult = {
  success: boolean
  error?: string
}

/**
 * Persist a YouTube presave intent after client-side subscribe/like actions.
 * Requires an existing presave cookie (Spotify flow) or a logged-in TSM user.
 */
export async function recordYouTubePresave(
  songId: string,
  options?: { likeAttempted?: boolean; likeSucceeded?: boolean },
): Promise<RecordYouTubePresaveResult> {
  const songIdNum = Number(songId)
  if (Number.isNaN(songIdNum)) {
    return { success: false, error: 'Invalid song reference.' }
  }

  const payload = await getPayload({ config: configPromise })
  const cookieStore = await cookies()
  const presaveCookieId = cookieStore.get('tsm_user_id')?.value
  const { user } = await getMeUser()

  let presaveDocId: number | string | null = presaveCookieId ?? null

  if (!presaveDocId && user) {
    const byEmail = await payload.find({
      collection: 'presaves',
      where: { email: { equals: user.email } },
      limit: 1,
    })
    if (byEmail.totalDocs > 0) {
      presaveDocId = byEmail.docs[0].id
    }
  }

  if (!presaveDocId && !user) {
    // Anonymous YouTube-only presave — client actions still ran; nothing to persist.
    return { success: true }
  }

  const song = await payload.findByID({
    collection: 'songs',
    id: songIdNum,
    depth: 0,
  })

  const released = isSongReleased(song.releaseDate, song.premiereAt)
  const likeSucceeded = options?.likeSucceeded === true

  let intentMap = parseIntentStatusMap(
    presaveDocId
      ? (
          await payload.findByID({
            collection: 'presaves',
            id: presaveDocId,
            depth: 0,
          })
        ).intentStatus
      : {},
  )

  intentMap = upsertSongIntent(intentMap, songIdNum, {
    youtube:
      likeSucceeded || (released && options?.likeAttempted)
        ? 'fulfilled'
        : 'pending',
    youtubeFulfilledAt:
      likeSucceeded || (released && options?.likeAttempted)
        ? new Date().toISOString()
        : undefined,
  })

  if (presaveDocId) {
    const currentCampaigns =
      (
        await payload.findByID({
          collection: 'presaves',
          id: presaveDocId,
          depth: 0,
        })
      ).campaigns?.map((c) => (typeof c === 'object' ? c.id : c)) ?? []

    await payload.update({
      collection: 'presaves',
      id: presaveDocId,
      data: {
        intentStatus: intentMap,
        linkedUser: user?.id,
        campaigns: currentCampaigns.includes(songIdNum)
          ? currentCampaigns
          : [...currentCampaigns, songIdNum],
      },
    })
  } else if (user?.email) {
    const created = await payload.create({
      collection: 'presaves',
      data: {
        email: user.email,
        linkedUser: user.id,
        campaigns: [songIdNum],
        intentStatus: intentMap,
      },
    })
    presaveDocId = created.id
    cookieStore.set('tsm_user_id', String(created.id), {
      path: '/',
      maxAge: 60 * 60 * 24 * 90,
      sameSite: 'lax',
    })
  }

  return { success: true }
}
