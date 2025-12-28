'use client'

import { createContext, useContext, useState, ReactNode, JSX } from 'react'
import { Song } from '@/payload-types'

// We define the modes exactly like your old project
export type PlayerMode = 'hidden' | 'mini' | 'full'

interface PlayerState {
  isPlaying: boolean
  currentSong: Song | null
  playerMode: PlayerMode
  volume: number
  isMuted: boolean
}

interface PlayerContextType extends PlayerState {
  playSong: (song: Song) => void
  togglePlay: () => void
  setPlayerMode: (mode: PlayerMode) => void
  toggleVideo: () => void
  setVolume: (vol: number) => void
  toggleMute: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [playerMode, setPlayerMode] = useState<PlayerMode>('hidden')
  const [volume, setVolume] = useState(0.67)
  const [isMuted, setIsMuted] = useState(false)

  const playSong = (song: Song) => {
    // If it's the same song, just toggle play
    if (currentSong?.id === song.id) {
      togglePlay()
      return
    }

    // New song? Start fresh
    setCurrentSong(song)
    setIsPlaying(true)

    // Auto-open the player bar if it was hidden
    if (playerMode === 'hidden') {
      setPlayerMode('mini')
    }
  }

  const togglePlay = () => setIsPlaying((prev) => !prev)
  const toggleMute = () => setIsMuted((prev) => !prev)
  const toggleVideo = () => {
    setPlayerMode((prev) => (prev === 'hidden' ? 'mini' : prev === 'mini' ? 'full' : 'hidden'))
  }

  return (
    <PlayerContext.Provider
      value={{
        isPlaying,
        currentSong,
        playerMode,
        toggleVideo,
        volume,
        isMuted,
        playSong,
        togglePlay,
        setPlayerMode,
        setVolume,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = (): PlayerContextType => {
  const context = useContext(PlayerContext)
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
