'use server'

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

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
  const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID // Add this to your .env

  if (!API_KEY || !CHANNEL_ID) return []

  // 1. Get "Uploads" Playlist ID (It's usually the channel ID with 'UU' instead of 'UC')
  // But strictly, you should fetch the channel details to get the exact ID.
  // For simplicity/performance, you can just replace 'UC' with 'UU' if you know your ID.
  const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU')

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`,
      {
        next: { revalidate: 3600 }, // Cache for 1 hour
      },
    )

    if (!res.ok) return []

    const data = await res.json()

    // Map to our "VisualLog" format
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
        category: 'Transmission Log', // Default category since API doesn't give us one
        linkedSong: null,
      }),
    )
  } catch (error) {
    console.error('YouTube Fetch Error:', error)
    return []
  }
}

async function handleResponse(res: Response, defaultMessage: string) {
  if (!res.ok) {
    let errorMessage = defaultMessage
    try {
      const error = await res.json()
      errorMessage = error.error?.message || errorMessage
    } catch {
      errorMessage += ` (${res.status} ${res.statusText})`
    }
    throw new Error(errorMessage)
  }
  return res.json()
}

export async function postCommentAction(
  accessToken: string,
  videoId: string,
  textOriginal: string,
) {
  if (!API_KEY) throw new Error('API Key missing')

  const url = new URL('https://www.googleapis.com/youtube/v3/commentThreads')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: {
          snippet: {
            textOriginal,
          },
        },
      },
    }),
  })

  return handleResponse(res, 'Failed to post comment')
}

export async function replyToCommentAction(
  accessToken: string,
  parentId: string,
  textOriginal: string,
) {
  if (!API_KEY) throw new Error('API Key missing')

  const url = new URL('https://www.googleapis.com/youtube/v3/comments')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('key', API_KEY)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        parentId,
        textOriginal,
      },
    }),
  })

  return handleResponse(res, 'Failed to post reply')
}
