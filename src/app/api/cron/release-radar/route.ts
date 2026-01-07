import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { refreshSpotifyToken, saveTrackToLibrary } from '@/utilities/spotify'

export async function GET(request: Request) {
  // 1. Security Check (Prevent random people from triggering this)
  const { searchParams } = new URL(request.url)
  if (searchParams.get('key') !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload({ config: configPromise })

  // 2. Find Songs released "Recently" (e.g., in the last 24 hours)
  // This prevents us from re-processing old songs every time the script runs.
  const now = new Date()
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const releasedSongs = await payload.find({
    collection: 'songs',
    where: {
      and: [
        { releaseDate: { less_than_equal: now.toISOString() } },
        { releaseDate: { greater_than: yesterday.toISOString() } },
      ],
    },
  })

  const results = {
    songsProcessed: 0,
    usersProcessed: 0,
    errors: 0,
  }

  // 3. Iterate through newly released songs
  for (const song of releasedSongs.docs) {
    if (!song.spotifyId) continue

    results.songsProcessed++

    // Find ALL users who have this song in their campaigns
    // Note: If you have thousands of users, you'd want to paginate this.
    const presaves = await payload.find({
      collection: 'presaves',
      where: {
        campaigns: { equals: song.id },
      },
      limit: 1000,
    })

    // 4. Execute the Save for each user
    for (const user of presaves.docs) {
      if (!user.refreshToken) continue

      try {
        // A. Get fresh token
        const newToken = await refreshSpotifyToken(user.refreshToken)

        if (newToken) {
          // B. Save the song
          await saveTrackToLibrary(newToken, song.spotifyId)
          results.usersProcessed++
        }
      } catch (e) {
        console.error(`Failed to process user ${user.email}`, e)
        results.errors++
      }
    }
  }

  return NextResponse.json({ success: true, ...results })
}
