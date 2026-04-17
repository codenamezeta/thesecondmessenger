'use server'

/**
 * Server-side YouTube helpers.
 *
 * Note: Like / subscribe / comment actions used to live here behind Payload
 * auth. They've moved to the browser (`lib/youtube/client.ts` + the
 * `YouTubeAuthContext` provider) so anonymous visitors can engage with
 * YouTube content using their own Google identity via a one-click popup.
 * TSM-logged-in users who have completed the server-side connect flow get a
 * fresh access token from `/api/auth/youtube/token` and skip the popup.
 *
 * Only the public channel-video listing remains here because it uses the
 * server-side API key (not user OAuth) and benefits from request-level caching.
 */

/** Normalized playlist item for the Visual Log / videos page. */
export type YoutubeChannelVideo = {
  id: string
  youtubeId: string
  title: string
  publishedDate: string
  description: string
  category: string
  linkedSong: null
}

export async function getChannelVideos(
  maxResults = 20,
): Promise<YoutubeChannelVideo[]> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID

  if (!API_KEY || !CHANNEL_ID) return []

  const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU')

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`,
      {
        next: { revalidate: 3600 },
      },
    )

    if (!res.ok) return []

    const data = await res.json()

    return data.items.map(
      (item: {
        id: string
        snippet: {
          title: string
          publishedAt: string
          description: string
          resourceId: { videoId: string }
        }
      }) => ({
        id: item.id,
        youtubeId: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        publishedDate: item.snippet.publishedAt,
        description: item.snippet.description,
        category: 'Transmission Log',
        linkedSong: null,
      }),
    )
  } catch (error) {
    console.error('YouTube Fetch Error:', error)
    return []
  }
}
