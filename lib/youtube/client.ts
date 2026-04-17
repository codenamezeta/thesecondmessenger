/**
 * Client-side wrappers around the YouTube Data API v3.
 *
 * All calls run directly from the browser with an OAuth Bearer token. This
 * keeps TSM's server out of the loop entirely for YouTube engagement actions:
 * anonymous users can like/subscribe/comment using their own YouTube identity
 * via a one-click GIS popup, and logged-in TSM users get a refresh-token-backed
 * access token from `/api/auth/youtube/token` so they never see a prompt.
 */

async function callYouTubeApi(
  url: string,
  accessToken: string,
  init: RequestInit = {},
): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return res
}

async function throwIfNotOk(res: Response, defaultMessage: string) {
  if (res.ok) return
  let message = defaultMessage
  try {
    const body = await res.json()
    message = body?.error?.message || message
  } catch {
    message = `${defaultMessage} (${res.status} ${res.statusText})`
  }
  throw new Error(message)
}

export async function likeVideo(videoId: string, accessToken: string) {
  const url = `https://www.googleapis.com/youtube/v3/videos/rate?id=${encodeURIComponent(
    videoId,
  )}&rating=like`
  const res = await callYouTubeApi(url, accessToken, {
    method: 'POST',
    headers: { 'Content-Length': '0' },
  })
  await throwIfNotOk(res, 'Failed to like video on YouTube')
}

export async function subscribeToChannel(
  channelId: string,
  accessToken: string,
) {
  const url =
    'https://www.googleapis.com/youtube/v3/subscriptions?part=snippet'
  const res = await callYouTubeApi(url, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snippet: {
        resourceId: { kind: 'youtube#channel', channelId },
      },
    }),
  })

  if (!res.ok) {
    let body: { error?: { errors?: Array<{ reason?: string }>; message?: string } } | null = null
    try {
      body = await res.json()
    } catch {
      // fall through
    }
    // YouTube returns 400 "subscriptionDuplicate" if already subscribed — treat as success.
    if (body?.error?.errors?.[0]?.reason === 'subscriptionDuplicate') {
      return { alreadySubscribed: true }
    }
    throw new Error(body?.error?.message || 'Failed to subscribe on YouTube')
  }

  return { alreadySubscribed: false }
}

export async function postComment(
  videoId: string,
  textOriginal: string,
  accessToken: string,
) {
  const url =
    'https://www.googleapis.com/youtube/v3/commentThreads?part=snippet'
  const res = await callYouTubeApi(url, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snippet: {
        videoId,
        topLevelComment: { snippet: { textOriginal } },
      },
    }),
  })
  await throwIfNotOk(res, 'Failed to post comment')
  return res.json()
}

export async function replyToComment(
  parentId: string,
  textOriginal: string,
  accessToken: string,
) {
  const url = 'https://www.googleapis.com/youtube/v3/comments?part=snippet'
  const res = await callYouTubeApi(url, accessToken, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snippet: { parentId, textOriginal },
    }),
  })
  await throwIfNotOk(res, 'Failed to post reply')
  return res.json()
}
