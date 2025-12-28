'use client'

import React, { useState, useRef, useEffect } from 'react'
import { YouTubeProps } from 'react-youtube'
import { usePlayer } from '@/context/PlayerContext'
import { ViewMode, LeftTab, RightTab } from './types'
import { StandbyTab } from './StandbyTab'
import { TheaterOverlay } from './TheaterOverlay'
import { VideoContainer } from './VideoContainer'
import { BottomBar } from './BottomBar'

export const GlobalPlayer = () => {
  const {
    currentSong,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    setVolume,
    toggleMute,
    toggleVideo,
  } = usePlayer()

  // --- STATE ---
  // Default to Standby on load.
  // When a song is clicked, the context should ideally trigger this to change,
  // but for now we'll auto-switch in the useEffect below.
  const [viewMode, setViewMode] = useState<ViewMode>('hidden')
  const [activeRightTab, setActiveRightTab] = useState<RightTab>('lyrics')
  const [activeLeftTab, setActiveLeftTab] = useState<LeftTab>('queue')

  // Playback State
  const [played, setPlayed] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [isReady, setIsReady] = useState(false)
  const [origin, setOrigin] = useState('')

  const internalPlayerRef = useRef<any>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)

  // --- HELPER: Safe Player Calls ---
  const safePlayerCall = (callback: (player: any) => void) => {
    const player = internalPlayerRef.current
    if (player && typeof player.getIframe === 'function' && player.getIframe()) {
      try {
        callback(player)
      } catch (e) {
        /* silence */
      }
    }
  }

  // --- EFFECTS ---
  useEffect(() => {
    if (typeof window !== 'undefined') setOrigin(window.location.origin)
  }, [])

  // Auto-wake from Standby when song changes
  useEffect(() => {
    if (currentSong && viewMode === 'hidden') {
      setViewMode('audio') // I don't think we need this.
    }
  }, [currentSong])

  // Command Bridge
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      if (isPlaying) player.playVideo()
      else player.pauseVideo()
    })
  }, [isPlaying, isReady, currentSong])

  // Volume Bridge
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      const vol = Math.round(volume * 100)
      player.setVolume(vol)
      if (isMuted || vol === 0) player.mute()
      else player.unMute()
    })
  }, [volume, isMuted, isReady, currentSong])

  // Progress Poller
  useEffect(() => {
    if (!currentSong || !isPlaying || !isReady) {
      if (progressInterval.current) clearInterval(progressInterval.current)
      return
    }
    progressInterval.current = setInterval(() => {
      if (!isSeeking) {
        safePlayerCall((player) => {
          const time = player.getCurrentTime()
          const total = player.getDuration()
          if (time && total) {
            setCurrentTime(time)
            setDuration(total)
            setPlayed(time / total)
          }
        })
      }
    }, 250)
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current)
    }
  }, [isPlaying, isReady, isSeeking, currentSong])

  // --- HANDLERS ---
  const onPlayerReady: YouTubeProps['onReady'] = (event) => {
    internalPlayerRef.current = event.target
    setIsReady(true)
    setDuration(event.target.getDuration())
    event.target.setVolume(volume * 100)
    if (isPlaying) event.target.playVideo()
  }

  const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === 0) togglePlay()
  }

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value)
    setPlayed(newPercent)
    setCurrentTime(newPercent * duration)
  }

  const handleSeekMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
    setIsSeeking(false)
    const newPercent = parseFloat((e.target as HTMLInputElement).value)
    const newTime = newPercent * duration
    safePlayerCall((player) => player.seekTo(newTime, true))
  }

  const formatTime = (seconds: number) => {
    if (!seconds) return '0:00'
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh) return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    return `${mm}:${ss}`
  }

  // --- RENDER ---
  const hasActiveSong = currentSong && currentSong.youtubeId

  // If no song is loaded, render nothing (or just the hidden div)
  if (!hasActiveSong) {
    // setViewMode('hidden')
    return <div className="hidden" />
  }

  // If hidden, show the standby tab (regardless of play state, if the user explicitly hid it)
  if (viewMode === 'hidden') {
    return <StandbyTab onRestore={() => setViewMode('audio')} />
  }

  return (
    <aside
      id="media_player"
      className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-end"
    >
      <TheaterOverlay
        viewMode={viewMode}
        setViewMode={setViewMode}
        activeLeftTab={activeLeftTab}
        setActiveLeftTab={setActiveLeftTab}
        activeRightTab={activeRightTab}
        setActiveRightTab={setActiveRightTab}
        currentSong={currentSong}
      >
        <VideoContainer
          currentSong={currentSong}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onPlayerReady={onPlayerReady}
          onPlayerStateChange={onPlayerStateChange}
          origin={origin}
        />
      </TheaterOverlay>

      <BottomBar
        currentSong={currentSong}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isPlaying={isPlaying}
        togglePlay={togglePlay}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        toggleMute={toggleMute}
        played={played}
        handleSeekChange={handleSeekChange}
        handleSeekMouseUp={handleSeekMouseUp}
        setIsSeeking={setIsSeeking}
        currentTime={currentTime}
        duration={duration}
        formatTime={formatTime}
        toggleVideo={toggleVideo}
        onClose={() => {
          togglePlay()
          setViewMode('hidden')
        }}
      />
    </aside>
  )
}
