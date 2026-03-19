const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

/**
 * Exchanges a Refresh Token for a new Access Token
 */
export async function refreshSpotifyToken(refreshToken: string) {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing Spotify Client ID or Secret')
  }

  // REAL URL: https://accounts.spotify.com/api/token
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Failed to refresh token:', err)
    return null
  }

  const data = await res.json()
  return data.access_token as string
}



/**
 * Saves a list of Track IDs to the User's Library
 */
export async function saveTrackToLibrary(accessToken: string, trackIds: string[]) {
  // REAL URL: https://api.spotify.com/v1/me/tracks
  const res = await fetch('https://api.spotify.com/v1/me/tracks', {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ids: trackIds }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Failed to save track to library:', err)
  }

  return res.ok
}
