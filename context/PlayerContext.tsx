'use client'

import {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useMemo,
  useCallback,
  useEffect,
} from 'react'
import { Song, Release } from '@/payload-types'

export type ViewMode = 'audio' | 'medium' | 'fullscreen'
export type VideoMode = 'theater' | 'mini'

/**
 * Metadata for a Song page that wants the Global Player's VideoStage to land
 * inline on its own viewscreen frame. Registered by `SongInlineVideoFrame`,
 * consumed by `VideoStage` to compute fixed-overlay coordinates.
 */
export interface InlineTarget {
  element: HTMLElement
  songYoutubeId: string
}

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
      [key: string]: unknown
    }

interface PlayerState {
  currentSong: PlayableMedia | null
  queue: PlayableMedia[]
  allSongs: PlayableMedia[]
  currentSongIndex: number
  isPlaying: boolean
  /** Independent flag: is the video visually shown */
  videoEnabled: boolean
  /** Which visual mode the video is in when enabled */
  videoMode: VideoMode
  /** Backward-compat: derived from videoEnabled */
  isVideoEnabled: boolean
  /** Backward-compat: derived from videoMode */
  miniMode: boolean
  /** Backward-compat: derived from videoEnabled + videoMode */
  viewMode: ViewMode
  controlsVisible: boolean
  volume: number
  isMuted: boolean
  /** Drawer open states */
  isLibraryDrawerOpen: boolean
  isInfoDrawerOpen: boolean
  /** Active tab states */
  activeLibraryTab: 'playlists' | 'queue'
  activeInfoTab: string
  /** YouTube playback state (managed by VideoStage) */
  currentTime: number
  duration: number
  played: number
  isSeeking: boolean
  /** Song page inline video frame registration (see InlineTarget) */
  inlineTarget: InlineTarget | null
}

interface PlayerActions {
  playMedia: (media: PlayableMedia | string) => void
  playPlaylist: (queue: (PlayableMedia | string)[], startIndex?: number) => void
  playNext: () => void
  playPrevious: () => void
  togglePlay: () => void
  /** Independent video enabled toggle */
  toggleVideo: () => void
  setVideoEnabled: (enabled: boolean) => void
  setVideoMode: (mode: VideoMode) => void
  toggleVideoMode: () => void
  /** Backward-compat setters */
  setViewMode: (mode: ViewMode) => void
  setMiniMode: (mode: boolean) => void
  setControlsVisible: (visible: boolean) => void
  toggleControls: () => void
  setVolume: (vol: number) => void
  toggleMute: () => void
  setIsMuted: (muted: boolean) => void
  setIsPlaying: (playing: boolean) => void
  setIsVideoEnabled: (enabled: boolean) => void
  /** Drawer actions */
  setIsLibraryDrawerOpen: (open: boolean) => void
  setIsInfoDrawerOpen: (open: boolean) => void
  setActiveLibraryTab: (tab: 'playlists' | 'queue') => void
  setActiveInfoTab: (tab: string) => void
  /** YouTube playback state setters (called by VideoStage) */
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlayed: (played: number) => void
  setIsSeeking: (seeking: boolean) => void
  /** Seek to a specific time — VideoStage registers its player via registerYouTubePlayer */
  seekTo: (time: number) => void
  registerYouTubePlayer: (player: any) => void
  /** Close the player (standby mode): pause + hide all UI */
  closePlayer: () => void
  updateSongMetadata: (id: string, metadata: Partial<PlayableMedia>) => void
  /**
   * Register a Song page's inline video frame. VideoStage will lay its
   * iframe over this element (matching position + size) when the currentSong
   * matches and videoEnabled is false.
   */
  setInlineTarget: (target: InlineTarget) => void
  /**
   * Clear the registered inline target, but only if the element passed in is
   * still the active target. This avoids a race when a new SongInlineVideoFrame
   * mounts before the previous one's cleanup effect runs.
   */
  clearInlineTarget: (element: HTMLElement) => void
}

type PlayerContextType = PlayerState & PlayerActions

const normalizeSongData = async (
  input: PlayableMedia | string,
  allCmsSongs: PlayableMedia[],
): Promise<PlayableMedia> => {
  if (typeof input !== 'string' && 'slug' in input && input.slug) return input

  const youtubeId =
    typeof input === 'string'
      ? input
      : (input as { youtubeId?: string | null }).youtubeId ||
        (input as { id?: string | number }).id

  const cmsMatch = allCmsSongs.find((s) => s.youtubeId === youtubeId)
  if (cmsMatch) return cmsMatch

  return {
    id: youtubeId as string,
    youtubeId: youtubeId as string,
    title:
      (typeof input !== 'string' && (input as { title?: string }).title) || 'Unknown Title',
    artist:
      (typeof input !== 'string' && (input as { channelTitle?: string }).channelTitle) ||
      'The Second Messenger',
    coverImage:
      (typeof input !== 'string' && (input as { thumbnail?: string }).thumbnail) || undefined,
  }
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<PlayableMedia[]>([])
  const [allSongs, setAllSongs] = useState<PlayableMedia[]>([])
  const [currentSong, setCurrentSong] = useState<PlayableMedia | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [volume, setVolume] = useState(0.67)
  const [isMuted, setIsMuted] = useState(false)

  // Independent video state
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [videoMode, setVideoMode] = useState<VideoMode>('theater')

  // Drawer & tab state
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false)
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [activeLibraryTab, setActiveLibraryTab] = useState<'playlists' | 'queue'>('queue')
  const [activeInfoTab, setActiveInfoTab] = useState('about')

  // Playback state (updated by VideoStage)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [played, setPlayed] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  // Inline target (Song page viewscreen frame that wants to host the video)
  const [inlineTarget, setInlineTargetState] = useState<InlineTarget | null>(null)

  // YouTube player ref — VideoStage registers its player instance here
  const ytPlayerRef = useRef<any>(null)

  // Derived backward-compat values
  const isVideoEnabled = videoEnabled
  const miniMode = videoMode === 'mini'
  const viewMode: ViewMode = !videoEnabled ? 'audio' : videoMode === 'mini' ? 'medium' : 'fullscreen'

  // Fetch all songs on mount
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

  // --- Actions ---

  const registerYouTubePlayer = useCallback((player: any) => {
    ytPlayerRef.current = player
  }, [])

  const seekTo = useCallback((time: number) => {
    ytPlayerRef.current?.seekTo(time, true)
  }, [])

  const togglePlay = useCallback(() => {
    setControlsVisible(true)
    setIsPlaying((prev) => !prev)
  }, [])

  const toggleMute = useCallback(() => setIsMuted((prev) => !prev), [])

  const toggleVideo = useCallback(() => setVideoEnabled((prev) => !prev), [])

  const toggleVideoMode = useCallback(
    () => setVideoMode((prev) => (prev === 'theater' ? 'mini' : 'theater')),
    [],
  )

  const toggleControls = useCallback(() => setControlsVisible((prev) => !prev), [])

  const closePlayer = useCallback(() => {
    setIsPlaying(false)
    setControlsVisible(false)
    setVideoEnabled(false)
  }, [])

  // Backward-compat setters that map to the new independent state
  const setIsVideoEnabled = useCallback((enabled: boolean) => {
    setVideoEnabled(enabled)
  }, [])

  const setMiniMode = useCallback((mini: boolean) => {
    setVideoMode(mini ? 'mini' : 'theater')
  }, [])

  const setViewMode = useCallback((mode: ViewMode) => {
    if (mode === 'audio') {
      setVideoEnabled(false)
    } else if (mode === 'medium') {
      setVideoEnabled(true)
      setVideoMode('mini')
    } else {
      setVideoEnabled(true)
      setVideoMode('theater')
    }
  }, [])

  const playMedia = useCallback(
    async (media: PlayableMedia | string) => {
      const song = await normalizeSongData(media, allSongs)

      const isSame =
        currentSong?.youtubeId && song.youtubeId && currentSong.youtubeId === song.youtubeId

      if (isSame) {
        togglePlay()
        return
      }

      let newQueue = allSongs
      let index = newQueue.findIndex((s) => s.youtubeId === song.youtubeId)

      if (index === -1) {
        newQueue = [song, ...allSongs]
        index = 0
      }

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

      const isSameSong = currentSong?.youtubeId === songToPlay.youtubeId
      const isSameQueue =
        queue.length === formattedQueue.length &&
        queue.every((s, i) => s.youtubeId === formattedQueue[i]?.youtubeId)

      if (isSameSong && isSameQueue) {
        togglePlay()
        return
      }

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
    setCurrentSong(queue[nextIndex] ?? null)
    setIsPlaying(true)
  }, [currentSongIndex, queue])

  const playPrevious = useCallback(() => {
    if (queue.length === 0 || currentSongIndex <= 0) return
    const prevIndex = currentSongIndex - 1
    setCurrentSongIndex(prevIndex)
    setCurrentSong(queue[prevIndex] ?? null)
    setIsPlaying(true)
  }, [currentSongIndex, queue])

  const setInlineTarget = useCallback((target: InlineTarget) => {
    setInlineTargetState(target)
  }, [])

  const clearInlineTarget = useCallback((element: HTMLElement) => {
    setInlineTargetState((prev) => (prev?.element === element ? null : prev))
  }, [])

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
      videoEnabled,
      videoMode,
      isVideoEnabled,
      miniMode,
      viewMode,
      controlsVisible,
      volume,
      isMuted,
      isLibraryDrawerOpen,
      isInfoDrawerOpen,
      activeLibraryTab,
      activeInfoTab,
      currentTime,
      duration,
      played,
      isSeeking,
      inlineTarget,
      playMedia,
      playPlaylist,
      playNext,
      playPrevious,
      togglePlay,
      toggleVideo,
      setVideoEnabled,
      setVideoMode,
      toggleVideoMode,
      setViewMode,
      setMiniMode,
      setControlsVisible,
      toggleControls,
      setVolume,
      toggleMute,
      setIsMuted,
      setIsPlaying,
      setIsVideoEnabled,
      setIsLibraryDrawerOpen,
      setIsInfoDrawerOpen,
      setActiveLibraryTab,
      setActiveInfoTab,
      setCurrentTime,
      setDuration,
      setPlayed,
      setIsSeeking,
      seekTo,
      registerYouTubePlayer,
      closePlayer,
      updateSongMetadata,
      setInlineTarget,
      clearInlineTarget,
    }),
    [
      currentSong,
      queue,
      allSongs,
      currentSongIndex,
      isPlaying,
      videoEnabled,
      videoMode,
      isVideoEnabled,
      miniMode,
      viewMode,
      controlsVisible,
      volume,
      isMuted,
      isLibraryDrawerOpen,
      isInfoDrawerOpen,
      activeLibraryTab,
      activeInfoTab,
      currentTime,
      duration,
      played,
      isSeeking,
      inlineTarget,
      playMedia,
      playPlaylist,
      playNext,
      playPrevious,
      togglePlay,
      toggleVideo,
      setVideoEnabled,
      setVideoMode,
      toggleVideoMode,
      setViewMode,
      setMiniMode,
      setControlsVisible,
      toggleControls,
      toggleMute,
      setIsVideoEnabled,
      seekTo,
      registerYouTubePlayer,
      closePlayer,
      updateSongMetadata,
      setInlineTarget,
      clearInlineTarget,
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
