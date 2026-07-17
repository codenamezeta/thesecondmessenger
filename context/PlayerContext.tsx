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
import {
  LISTEN_PROGRESS_MILESTONES,
  trackListenProgress,
  trackSongPlay,
  type ListenPercent,
} from '@/lib/analytics/ga'
import { isSongPlayable } from '@/lib/music/songRelease'
import { applyYouTubeCaptions } from '@/lib/youtube/captions'

export type ViewMode = 'audio' | 'medium' | 'fullscreen'
export type VideoMode = 'theater' | 'mini'

/** Seconds into a track past which "previous" restarts instead of skipping back. */
const PREVIOUS_RESTART_THRESHOLD = 3

export interface YouTubePlayerRef {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  getIframe?: () => HTMLIFrameElement | null
  playVideo?: () => void
  pauseVideo?: () => void
  setVolume?: (volume: number) => void
  mute?: () => void
  unMute?: () => void
  getCurrentTime?: () => number
  getDuration?: () => number
  loadModule?: (moduleName: string) => void
  unloadModule?: (moduleName: string) => void
  setOption?: (module: string, option: string, value: unknown) => void
}

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

function songAnalyticsParams(song: PlayableMedia) {
  return {
    song_id:
      song.id != null
        ? String(song.id)
        : song.youtubeId
          ? String(song.youtubeId)
          : undefined,
    song_slug: typeof song.slug === 'string' ? song.slug : undefined,
    song_title: typeof song.title === 'string' ? song.title : undefined,
  }
}

function songSessionKey(song: PlayableMedia | null): string | null {
  if (!song) return null
  if (song.youtubeId) return String(song.youtubeId)
  if (typeof song.slug === 'string') return song.slug
  if (song.id != null) return String(song.id)
  return null
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
  /** Closed captions — only visible when video is enabled */
  captionsEnabled: boolean
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
  /** Randomize upcoming tracks, keeping the current song playing at the top. */
  shuffleQueue: () => void
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
  toggleCaptions: () => void
  setCaptionsEnabled: (enabled: boolean) => void
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
  registerYouTubePlayer: (player: YouTubePlayerRef) => void
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
      (typeof input !== 'string' && (input as { title?: string }).title) ||
      'Unknown Title',
    artist:
      (typeof input !== 'string' &&
        (input as { channelTitle?: string }).channelTitle) ||
      'The Second Messenger',
    coverImage:
      (typeof input !== 'string' &&
        (input as { thumbnail?: string }).thumbnail) ||
      undefined,
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
  const [captionsEnabled, setCaptionsEnabledState] = useState(false)

  // Independent video state
  const [videoEnabled, setVideoEnabled] = useState(false)
  const [videoMode, setVideoMode] = useState<VideoMode>('theater')

  // Drawer & tab state
  const [isLibraryDrawerOpen, setIsLibraryDrawerOpen] = useState(false)
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false)
  const [activeLibraryTab, setActiveLibraryTab] = useState<
    'playlists' | 'queue'
  >('queue')
  const [activeInfoTab, setActiveInfoTab] = useState('about')

  // Playback state (updated by VideoStage)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [played, setPlayed] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)

  // Inline target (Song page viewscreen frame that wants to host the video)
  const [inlineTarget, setInlineTargetState] = useState<InlineTarget | null>(
    null,
  )

  // YouTube player ref — VideoStage registers its player instance here
  const ytPlayerRef = useRef<YouTubePlayerRef | null>(null)

  // GA4 listen milestones — once per song session (reset when track changes)
  const listenMilestonesRef = useRef<Set<ListenPercent>>(new Set())
  const listenSessionKeyRef = useRef<string | null>(null)

  // Derived backward-compat values
  const isVideoEnabled = videoEnabled
  const miniMode = videoMode === 'mini'
  const viewMode: ViewMode = !videoEnabled
    ? 'audio'
    : videoMode === 'mini'
      ? 'medium'
      : 'fullscreen'

  // Fetch all songs on mount
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const req = await fetch(
          '/api/songs?limit=100&sort=-popularity,-releaseDate',
        )
        const res = await req.json()
        if (res.docs) setAllSongs(res.docs)
      } catch (e) {
        console.error('Failed to fetch songs for player context:', e)
      }
    }
    fetchAllSongs()
  }, [])

  // Reset listen milestones when the current track changes
  useEffect(() => {
    const key = songSessionKey(currentSong)
    if (key !== listenSessionKeyRef.current) {
      listenSessionKeyRef.current = key
      listenMilestonesRef.current = new Set()
    }
  }, [currentSong])

  // Fire listen_progress at 25 / 50 / 75 / 100 once per song session
  useEffect(() => {
    if (!currentSong) return
    const percentOfTrack = played * 100
    const song_slug =
      typeof currentSong.slug === 'string' ? currentSong.slug : undefined
    for (const milestone of LISTEN_PROGRESS_MILESTONES) {
      if (
        percentOfTrack >= milestone &&
        !listenMilestonesRef.current.has(milestone)
      ) {
        listenMilestonesRef.current.add(milestone)
        trackListenProgress({ song_slug, percent: milestone })
      }
    }
  }, [played, currentSong])

  // --- Actions ---

  const registerYouTubePlayer = useCallback((player: YouTubePlayerRef) => {
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

  const setCaptionsEnabled = useCallback((enabled: boolean) => {
    setCaptionsEnabledState(enabled)
    applyYouTubeCaptions(ytPlayerRef.current, enabled)
  }, [])

  const toggleCaptions = useCallback(() => {
    setCaptionsEnabledState((prev) => {
      const next = !prev
      applyYouTubeCaptions(ytPlayerRef.current, next)
      return next
    })
  }, [])

  const toggleVideo = useCallback(() => setVideoEnabled((prev) => !prev), [])

  const toggleVideoMode = useCallback(
    () => setVideoMode((prev) => (prev === 'theater' ? 'mini' : 'theater')),
    [],
  )

  const toggleControls = useCallback(
    () => setControlsVisible((prev) => !prev),
    [],
  )

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

      const releaseDate = (song as { releaseDate?: string | null }).releaseDate
      const premiereAt = (song as { premiereAt?: string | null }).premiereAt
      if (releaseDate && !isSongPlayable(releaseDate, premiereAt)) {
        return
      }

      const isSame =
        currentSong?.youtubeId &&
        song.youtubeId &&
        currentSong.youtubeId === song.youtubeId

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
      trackSongPlay(songAnalyticsParams(song))
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
      trackSongPlay(songAnalyticsParams(songToPlay))
    },
    [currentSong, queue, togglePlay],
  )

  const playNext = useCallback(() => {
    if (queue.length === 0 || currentSongIndex >= queue.length - 1) {
      setIsPlaying(false)
      return
    }
    const nextIndex = currentSongIndex + 1
    const nextSong = queue[nextIndex] ?? null
    setCurrentSongIndex(nextIndex)
    setCurrentSong(nextSong)
    setIsPlaying(true)
    if (nextSong) trackSongPlay(songAnalyticsParams(nextSong))
  }, [currentSongIndex, queue])

  const playPrevious = useCallback(() => {
    if (queue.length === 0) return
    // Spotify-style behavior: if we're more than a few seconds into the track
    // (or there is no earlier track), restart the current one instead of
    // skipping back. Only an early press jumps to the previous track.
    if (currentTime >= PREVIOUS_RESTART_THRESHOLD || currentSongIndex <= 0) {
      seekTo(0)
      setIsPlaying(true)
      return
    }
    const prevIndex = currentSongIndex - 1
    const prevSong = queue[prevIndex] ?? null
    setCurrentSongIndex(prevIndex)
    setCurrentSong(prevSong)
    setIsPlaying(true)
    if (prevSong) trackSongPlay(songAnalyticsParams(prevSong))
  }, [currentSongIndex, queue, currentTime, seekTo])

  const shuffleQueue = useCallback(() => {
    setQueue((prev) => {
      if (prev.length <= 1) return prev
      const current = prev[currentSongIndex]
      const rest = prev.filter((_, i) => i !== currentSongIndex)
      // Fisher–Yates shuffle of the remaining tracks.
      for (let i = rest.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[rest[i], rest[j]] = [rest[j], rest[i]]
      }
      const next = current ? [current, ...rest] : rest
      setCurrentSongIndex(current ? 0 : currentSongIndex)
      return next
    })
  }, [currentSongIndex])

  const setInlineTarget = useCallback((target: InlineTarget) => {
    setInlineTargetState(target)
  }, [])

  const clearInlineTarget = useCallback((element: HTMLElement) => {
    setInlineTargetState((prev) => (prev?.element === element ? null : prev))
  }, [])

  const updateSongMetadata = useCallback(
    (id: string, metadata: Partial<PlayableMedia>) => {
      setAllSongs((prev) =>
        prev.map((s) =>
          s.youtubeId === id ? ({ ...s, ...metadata } as PlayableMedia) : s,
        ),
      )
      setQueue((prev) =>
        prev.map((s) =>
          s.youtubeId === id ? ({ ...s, ...metadata } as PlayableMedia) : s,
        ),
      )
      setCurrentSong((prev) =>
        prev?.youtubeId === id
          ? ({ ...prev, ...metadata } as PlayableMedia)
          : prev,
      )
    },
    [],
  )

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
      captionsEnabled,
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
      shuffleQueue,
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
      toggleCaptions,
      setCaptionsEnabled,
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
      captionsEnabled,
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
      shuffleQueue,
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
      toggleCaptions,
      setCaptionsEnabled,
      setIsVideoEnabled,
      seekTo,
      registerYouTubePlayer,
      closePlayer,
      updateSongMetadata,
      setInlineTarget,
      clearInlineTarget,
    ],
  )

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  )
}

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
