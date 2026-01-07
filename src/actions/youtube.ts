'use server'

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

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
