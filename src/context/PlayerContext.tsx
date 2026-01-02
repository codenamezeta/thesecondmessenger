'use client'

import { createContext, useContext, useState, ReactNode, useMemo } from 'react'
import { Song } from '@/payload-types'

interface PlayerState {
  currentSong: Song | null
  isPlaying: boolean
  isVideoEnabled: boolean
  miniMode: boolean
  controlsVisible: boolean
  volume: number
  isMuted: boolean
}

interface PlayerActions {
  playSong: (song: Song) => void
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
}

type PlayerContextType = PlayerState & PlayerActions

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideoEnabled, setIsVideoEnabled] = useState(false)
  const [miniMode, setMiniMode] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [volume, setVolume] = useState(0.67)
  const [isMuted, setIsMuted] = useState(false)

  const togglePlay = () => {
    setControlsVisible(true)
    setIsPlaying((prev) => !prev)
  }
  const toggleMute = () => setIsMuted((prev) => !prev)
  const toggleVideo = () => setIsVideoEnabled((prev) => !prev)
  const toggleControls = () => setControlsVisible((prev) => !prev)

  const playSong = (song: Song) => {
    // If it's the same song, just toggle play
    if (currentSong?.id === song.id) {
      togglePlay()
      return
    }

    // New song? Start fresh
    setCurrentSong(song)
    setControlsVisible(true)
    setIsPlaying(true)
  }

  const value = useMemo<PlayerContextType>(
    () => ({
      currentSong,
      isPlaying,
      setIsPlaying,
      isVideoEnabled,
      setIsVideoEnabled,
      miniMode,
      controlsVisible,
      volume,
      isMuted,
      playSong,
      togglePlay,
      toggleVideo,
      setMiniMode,
      setControlsVisible,
      toggleControls,
      setVolume,
      toggleMute,
      setIsMuted,
    }),
    [
      currentSong,
      playSong,
      isPlaying,
      setIsPlaying,
      isVideoEnabled,
      setIsVideoEnabled,
      miniMode,
      controlsVisible,
      volume,
      isMuted,
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
