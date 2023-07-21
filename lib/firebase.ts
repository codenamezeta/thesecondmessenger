//* Firebase library

//- Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
// import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getStorage, ref, getDownloadURL } from 'firebase/storage'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { DocumentData } from '@firebase/firestore-types'

//* Firebase Configuration
//? For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

//- Initialize Firebase & Services
export const app = initializeApp(firebaseConfig)
// export const analytics = getAnalytics(app)
export const auth = getAuth(app)
export const storage = getStorage(app) // Creates a reference to the firebase storage bucket
export const db = getFirestore(app) // Used a lot throughout custom lib functions

//* Custom lib functions
//* A reference to the songs collection
const songsCol = collection(db, 'songs')

//* Gets the most recently released song
export async function getLatestRelease(): Promise<DocumentData> {
  try {
    const now = new Date()
    const furthestReleaseDate = query(
      songsCol,
      where('release_date', '<=', now), //- Ensures release_date is not in the future.
      orderBy('release_date', 'desc'),
      limit(1)
    )
    const querySnapshot = await getDocs(furthestReleaseDate)
    let latestRelease
    querySnapshot.forEach((doc) => {
      latestRelease = doc.data()
    })
    return latestRelease!
  } catch (error) {
    console.error('Error getting latest release: ', error)
    throw error
  }
}

//* Gets a list of all songs from the firestore database
export async function getAllSongs(): Promise<DocumentData[]> {
  try {
    const songsSnapshot = await getDocs(songsCol)
    const songsData = songsSnapshot.docs.map((doc) => doc.data())
    return songsData!
  } catch (error) {
    console.error('Error getting songs: ', error)
    return []
  }
}

//* Gets a song by it's slug
export async function getSongBySlug(slug: string): Promise<DocumentData> {
  try {
    const songRequest = query(songsCol, where('slug', '==', slug), limit(1))
    const querySnapshot = await getDocs(songRequest)
    let song
    querySnapshot.forEach((doc) => {
      song = doc.data()
    })
    return song!
  } catch (error) {
    console.error('Error getting latest release: ', error)
    throw error
  }
}

//* Gets a URL for cover art images
export function getCoverArtUrl(coverArtPath: string): Promise<string> {
  // console.log('🚀 ~ coverArtPath:', coverArtPath)
  if (coverArtPath) {
    return getDownloadURL(ref(storage, coverArtPath))
  } else {
    let coverArtFallback = 'images/circled-transparent-bg-crow-logo.png'
    return getDownloadURL(ref(storage, coverArtFallback))
  }
}
