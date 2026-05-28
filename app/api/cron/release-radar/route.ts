import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { refreshSpotifyToken, saveTrackToLibrary } from '@/utilities/spotify'

// Force dynamic so Vercel doesn't cache the result
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // 1. Security Check
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key')

  if (key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  // 2. Find Songs that "Just Released" (e.g., today)
  // We look for songs released between yesterday and now to catch anything we missed.
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

  // NOTE: If you are testing, you might want to comment out this 'where' clause
  // to force it to run on ALL songs for a test run.
  const releasedSongs = await payload.find({
    collection: 'songs',
    where: {
      and: [
        { releaseDate: { less_than_equal: now.toISOString() } },
        { releaseDate: { greater_than: yesterday.toISOString() } },
      ],
    },
    limit: 50,
  })

  const stats = {
    songsFound: releasedSongs.docs.length,
    usersProcessed: 0,
    successfulSaves: 0,
    errors: 0,
  }

  // 3. Process each song
  for (const song of releasedSongs.docs) {
    if (!song.spotifyId) continue

    // Find users who pre-saved this specific song
    const presaves = await payload.find({
      collection: 'presaves',
      where: {
        campaigns: { equals: song.id },
      },
      limit: 1000,
    })

    // 4. Save for each user
    for (const user of presaves.docs) {
      if (!user.refreshToken) continue
      stats.usersProcessed++

      try {
        // A. Refresh their token
        const accessToken = await refreshSpotifyToken(user.refreshToken)

        if (accessToken) {
          // B. Save the song to their library
          const success = await saveTrackToLibrary(accessToken, [
            song.spotifyId,
          ])
          if (success) stats.successfulSaves++
        } else {
          stats.errors++ // Token refresh failed (maybe user revoked access)
        }
      } catch (e) {
        console.error(`Error processing user ${user.email}:`, e)
        stats.errors++
      }
    }
  }

  return NextResponse.json({
    success: true,
    ...stats,
    message: `Processed ${stats.usersProcessed} users for ${stats.songsFound} newly released songs.`,
  })
}
