'use client'

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import { Song, Release } from '@/payload-types'

export type PlayableMedia =
  | (Song & { coverImage?: string; description?: string; artist?: string })
  | {
      id?: string | number
      youtubeId?: string | null
      youtubePlaylistId?: string
      title?: string
      artist?: string
      coverArt?: Release['coverArt']
      coverImage?: string
      description?: string
      slug?: string
      [key: string]: any
    }

interface PlayerState {
  currentSong: PlayableMedia | null
  queue: PlayableMedia[]
  allSongs: PlayableMedia[]
  currentSongIndex: number
  isPlaying: boolean
  isVideoEnabled: boolean
  miniMode: boolean
  controlsVisible: boolean
  volume: number
  isMuted: boolean
}

interface PlayerActions {
  playMedia: (media: PlayableMedia | string) => void
  playPlaylist: (queue: (PlayableMedia | string)[], startIndex?: number) => void
  playNext: () => void
  playPrevious: () => void
  togglePlay: () => void
  toggleVideo: () => void
  setMiniMode: (mode: boolean) => void
  setControlsVisible: (visible: boolean) => void
  toggleControls: () => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  setIsMuted: (muted: boolean) => void
  isVideoEnabled: boolean
  setIsPlaying: (playing: boolean) => void
  setIsVideoEnabled: (enabled: boolean) => void
  updateSongMetadata: (id: string, metadata: Partial<PlayableMedia>) => void
}

type PlayerContextType = PlayerState & PlayerActions

// Example helper to normalize incoming data
const normalizeSongData = async (input: any, allCmsSongs: any[]) => {
  // 1. If it's already a CMS Song (has a slug), use it directly.
  if (input?.slug) return input

  // 2. If it's a YouTube ID (string) or partial object, check the CMS cache.
  const youtubeId = typeof input === 'string' ? input : input.youtubeId || input.id

  const cmsMatch = allCmsSongs.find((s) => s.youtubeId === youtubeId)
  if (cmsMatch) {
    return cmsMatch // Found in CMS! Use this rich data (slug, official art, etc).
  }

  // 3. Fallback: It's a raw YouTube video not in your CMS.
  // You might want to fetch oEmbed/API data here, or use what was passed.
  return {
    id: youtubeId,
    youtubeId: youtubeId,
    title: input.title || 'Unknown Title', // Ideally fetch this from YouTube API
    artist: input.channelTitle || 'The Second Messenger', // Fallback artist
    coverImage: input.thumbnail || undefined, // Map YouTube thumbnail to coverImage
    // slug: undefined, // Important: This triggers the 'div' fallback in BottomBar
  }
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<PlayableMedia[]>([])
  const [allSongs, setAllSongs] = useState<PlayableMedia[]>([])
  const [currentSong, setCurrentSong] = useState<PlayableMedia | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [miniMode, setMiniMode] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [volume, setVolume] = useState(0.67)
  const [isMuted, setIsMuted] = useState(false)

  // Fetch "Everything" playlist on mount
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const req = await fetch('/api/songs?limit=100&sort=-releaseDate')
        const res = await req.json()
        if (res.docs) setAllSongs(res.docs)
      } catch (e) {
        console.error('Failed to fetch songs for player context:', e)
      }
    }
    fetchAllSongs()
  }, [])

  const togglePlay = useCallback(() => {
    setControlsVisible(true)
    setIsPlaying((prev) => !prev)
  }, [])

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), [])
  const toggleVideo = useCallback(() => setIsVideoEnabled((prev) => !prev), [])
  const toggleControls = useCallback(() => setControlsVisible((prev) => !prev), [])

  const playMedia = useCallback(
    async (media: PlayableMedia | string) => {
      // 1. Normalize the input data (CMS data takes precedence)
      const song = await normalizeSongData(media, allSongs)

      const isSame =
        currentSong?.youtubeId && song.youtubeId && currentSong.youtubeId === song.youtubeId

      if (isSame) {
        togglePlay()
        return
      }

      // 2. Determine the Queue
      // We want to play this song, but keep the "Radio" feel by having the rest of the catalog queued.
      let newQueue = allSongs
      let index = newQueue.findIndex((s) => s.youtubeId === song.youtubeId)

      if (index === -1) {
        // Case: One-off YouTube video not in CMS.
        // We prepend it to the "Everything" list so the radio continues after this song.
        newQueue = [song, ...allSongs]
        index = 0
      }

      // 3. Update State
      setQueue(newQueue)
      setCurrentSongIndex(index)
      setCurrentSong(song)
      setControlsVisible(true)
      setIsPlaying(true)
    },
    [currentSong, togglePlay, allSongs],
  )

  const playPlaylist = useCallback(
    (newQueue: (PlayableMedia | string)[], startIndex: number = 0) => {
      if (!newQueue || newQueue.length === 0) return

      const formattedQueue: PlayableMedia[] = newQueue.map((item) => {
        if (typeof item === 'string') {
          return { youtubeId: item, title: 'Loading...', id: item }
        }
        return item
      })

      const songToPlay = formattedQueue[startIndex]

      // If it's the same playlist and same song, just toggle play
      const isSameSong = currentSong?.youtubeId === songToPlay.youtubeId
      const isSameQueue =
        queue.length === formattedQueue.length &&
        queue.every((s, i) => s.youtubeId === formattedQueue[i].youtubeId)

      if (isSameSong && isSameQueue) {
        togglePlay()
        return
      }

      // New playlist or song? Start fresh.
      setQueue(formattedQueue)
      setCurrentSongIndex(startIndex)
      setCurrentSong(songToPlay)
      setControlsVisible(true)
      setIsPlaying(true)
    },
    [currentSong, queue, togglePlay],
  )

  const playNext = useCallback(() => {
    if (queue.length === 0 || currentSongIndex >= queue.length - 1) {
      setIsPlaying(false)
      return
    }
    const nextIndex = currentSongIndex + 1
    setCurrentSongIndex(nextIndex)
    setCurrentSong(queue[nextIndex])
    setIsPlaying(true)
  }, [currentSongIndex, queue])

  const playPrevious = useCallback(() => {
    if (queue.length === 0 || currentSongIndex <= 0) {
      return
    }
    const prevIndex = currentSongIndex - 1
    setCurrentSongIndex(prevIndex)
    setCurrentSong(queue[prevIndex])
    setIsPlaying(true)
  }, [currentSongIndex, queue])

  const updateSongMetadata = useCallback((id: string, metadata: Partial<PlayableMedia>) => {
    setAllSongs((prev) =>
      prev.map((s) => (s.youtubeId === id ? ({ ...s, ...metadata } as PlayableMedia) : s)),
    )
    setQueue((prev) =>
      prev.map((s) => (s.youtubeId === id ? ({ ...s, ...metadata } as PlayableMedia) : s)),
    )
    setCurrentSong((prev) =>
      prev?.youtubeId === id ? ({ ...prev, ...metadata } as PlayableMedia) : prev,
    )
  }, [])

  const value = useMemo<PlayerContextType>(
    () => ({
      currentSong,
      queue,
      allSongs,
      currentSongIndex,
      isPlaying,
      setIsPlaying,
      isVideoEnabled,
      setIsVideoEnabled,
      miniMode,
      controlsVisible,
      volume,
      isMuted,
      playMedia,
      playPlaylist,
      playNext,
      playPrevious,
      togglePlay,
      toggleVideo,
      setMiniMode,
      setControlsVisible,
      toggleControls,
      setVolume,
      toggleMute,
      setIsMuted,
      updateSongMetadata,
    }),
    [
      currentSong,
      queue,
      allSongs,
      currentSongIndex,
      isPlaying,
      setIsPlaying,
      isVideoEnabled,
      setIsVideoEnabled,
      miniMode,
      controlsVisible,
      volume,
      isMuted,
      updateSongMetadata,
    ],
  )

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
}

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
