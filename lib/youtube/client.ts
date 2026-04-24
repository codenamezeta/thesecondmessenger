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

type YouTubeErrorBody = {
  error?: {
    message?: string
    errors?: Array<{ reason?: string; message?: string }>
  }
}

/**
 * Map YouTube Data API error `reason` codes to messages our users can act on.
 * Google's raw `error.message` strings are frequently outdated (e.g. they
 * still reference Google+, which was shut down in 2019) so we rewrite the
 * well-known cases. Falls back to the raw Google message for unknown reasons.
 */
function humanizeYouTubeError(
  body: YouTubeErrorBody | null,
  fallback: string,
  status?: number,
): Error {
  const reason = body?.error?.errors?.[0]?.reason
  const googleMessage = body?.error?.message

  switch (reason) {
    case 'accountNotConnectedToGooglePlus':
      return new Error(
        "Your Google account doesn't have a YouTube channel that can post comments. Open youtube.com, sign in, and create a channel (or pick a different Google account on the next sign-in prompt).",
      )
    case 'commentsDisabled':
      return new Error('Comments are disabled on this video.')
    case 'ineligibleAccount':
      return new Error(
        'This Google account can’t be used with the YouTube API. Try signing in with a different account or merge your brand channel at youtube.com/account.',
      )
    case 'forbidden':
    case 'insufficientPermissions':
      return new Error(
        'YouTube rejected the request due to missing permissions. Try signing out and reconnecting YouTube.',
      )
    case 'quotaExceeded':
    case 'rateLimitExceeded':
      return new Error('YouTube is rate-limiting this account right now. Try again in a moment.')
    case 'subscriptionDuplicate':
      // Callers handle this as success; surface a message just in case it
      // bubbles up somewhere.
      return new Error('You are already subscribed to this channel.')
    default:
      if (googleMessage) return new Error(googleMessage)
      if (status) return new Error(`${fallback} (${status})`)
      return new Error(fallback)
  }
}

async function throwIfNotOk(res: Response, defaultMessage: string) {
  if (res.ok) return
  let body: YouTubeErrorBody | null = null
  try {
    body = (await res.json()) as YouTubeErrorBody
  } catch {
    // non-JSON error body; fall through to status-based message
  }
  throw humanizeYouTubeError(body, defaultMessage, res.status)
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
    let body: YouTubeErrorBody | null = null
    try {
      body = (await res.json()) as YouTubeErrorBody
    } catch {
      // fall through
    }
    // YouTube returns 400 "subscriptionDuplicate" if already subscribed — treat as success.
    if (body?.error?.errors?.[0]?.reason === 'subscriptionDuplicate') {
      return { alreadySubscribed: true }
    }
    throw humanizeYouTubeError(body, 'Failed to subscribe on YouTube', res.status)
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
