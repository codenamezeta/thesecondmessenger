import { google } from 'googleapis'
const youtube = google.youtube('v3')

// Set up YouTube OAuth2 client with credentials
import { OAuth2Client } from 'google-auth-library'
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback/google' //! Not sure about this one. https://console.cloud.google.com/apis/credentials/oauthclient/588453420225-52l89qj8h4vicae06oacmtnqgnoo5c3s.apps.googleusercontent.com?orgonly=true&project=the-second-messenger-website&supportedpurview=organizationId
const oauth2Client = new OAuth2Client({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: REDIRECT_URI,
})

// Set access token for OAuth2 client
oauth2Client.setCredentials({
  access_token: 'YOUR_ACCESS_TOKEN',
  refresh_token: 'YOUR_REFRESH_TOKEN',
})

// Set YouTube API key
const API_KEY = process.env.YOUTUBE_API_KEY

// Helpful to use hardcoded channel id for testing
const TSMChannelId = 'UC7s-BDNomZ-sqKCecBIRrjQ'

// Get all videos for your channel
export async function getChannelVideos(channelId) {
  const res = await youtube.search.list({
    // auth: oauth2Client,
    auth: API_KEY,
    part: 'id',
    channelId: channelId,
    type: 'video',
  })
  // console.log(res.data.items)
  const videoIds = res.data.items.map((item) => item.id.videoId).join(',')
  const videos = await getVideosById(videoIds)
  return videos
}

// Get specific video by video ID
export async function getVideoById(videoId) {
  const res = await youtube.videos.list({
    auth: oauth2Client,
    part: 'snippet',
    id: videoId,
  })
  return res.data.items[0]
}

// Get all playlists for your channel
export async function getChannelPlaylists(channelId) {
  const res = await youtube.playlists.list({
    auth: API_KEY,
    part: 'snippet',
    channelId: 'UC7s-BDNomZ-sqKCecBIRrjQ',
  })
  // console.log(res.data)
  return res.data.items
}

// Get all comment threads for a specific video
// export async function getVideoComments(videoId) {
//   const res = await youtube.commentThreads.list({
//     auth: API_KEY,
//     part: 'snippet',
//     videoId: videoId,
//   })
//   return res.data.items
// }
export async function getVideoComments(videoId) {
  try {
    const res = await youtube.commentThreads.list({
      auth: API_KEY,
      part: 'snippet',
      videoId: videoId,
    })
    if (res.status === 200 && res.data.items) {
      return { comments: res.data.items, commentsEnabled: true }
    } else {
      throw new Error('Invalid response from YouTube API')
    }
  } catch (error) {
    // Handle the error here
    console.error('Error while fetching video comments:', error)
    // throw error // Re-throw the error for the caller to handle if needed
    return { comments: [], commentsEnabled: false }
  }
}

// Subscribe user to your channel
export async function subscribeToChannel(channelId, subscriberEmail) {
  const res = await youtube.subscriptions.insert({
    auth: oauth2Client,
    part: 'snippet',
    resource: {
      snippet: {
        resourceId: {
          channelId: channelId,
        },
      },
    },
  })
  return res.data
}

// Update user's subscribed channels
export async function updateSubscriptions(subscriptions) {
  const res = await youtube.subscriptions.update({
    auth: oauth2Client,
    part: 'snippet',
    resource: {
      id: subscriptions.id,
      snippet: {
        resourceId: {
          channelId: subscriptions.channelId,
        },
      },
    },
  })
  return res.data
}

// Helper function to get multiple videos by video IDs
async function getVideosById(videoIds) {
  const res = await youtube.videos.list({
    auth: API_KEY,
    part: 'snippet',
    id: videoIds,
  })
  // console.log(res.data)
  return res.data.items
}

// Helper function to extract a video ID or a playlist ID from a YouTube URL
export function getVideoOrPlaylistIdFromUrl(url) {
  // Use a regular expression to match the video or playlist ID portion of the URL
  const regex =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|\w{0,3}\/?)([\w-]{11})(?=[^\w-]|$)[?=&+%\w.-]*)|(?:youtu\.be\/([\w-]{11}))|(?:youtube(?:-nocookie)?\.com\/(?:[^/]+\/.+\/|(?:playlist)\?|(\w{0,3}\/?)list=)([\w-]{34}))/
  const match = url.match(regex)

  // If there is a match, return the video or playlist ID
  if (match) {
    return match[1] || match[2] || match[3]
  }

  // Otherwise, return null
  return nulls
}
