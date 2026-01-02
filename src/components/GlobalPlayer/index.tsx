'use client'

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import YouTube, { YouTubeProps, YouTubeEvent } from 'react-youtube'
import { usePlayer } from '@/context/PlayerContext'
import { Browser, LibraryTab, DetailsTab } from './Browser'
import { BottomBar } from './BottomBar'
import { cn } from '@/utilities/ui'
import { Music4 } from 'lucide-react'

export const GlobalPlayer = () => {
  const {
    currentSong,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
    isVideoEnabled,
    setIsVideoEnabled,
    miniMode,
    setMiniMode,
    togglePlay,
    setVolume,
    toggleMute,
    toggleVideo,
    controlsVisible,
    setControlsVisible,
  } = usePlayer()

  // --- STATE ---
  const [activeLibraryTab, setActiveLibraryTab] = useState<LibraryTab>('queue')
  const [activeDetailsTab, setActiveDetailsTab] = useState<DetailsTab>('lyrics')

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
    if (player && typeof player.getIframe === 'function') {
      const iframe = player.getIframe()
      if (!iframe || !iframe.isConnected) return
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

  // // Scroll Lock
  // useEffect(() => {
  //   document.body.style.overflow = isVideoEnabled ? 'hidden' : ''
  //   return () => {
  //     document.body.style.overflow = ''
  //   }
  // }, [isVideoEnabled])

  // Command Bridge
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      if (isPlaying) player.playVideo()
      else player.pauseVideo()
    })
  }, [isPlaying, isReady])

  // Volume Bridge
  useEffect(() => {
    if (!currentSong || !isReady) return
    safePlayerCall((player) => {
      const vol = Math.round(volume * 100)
      player.setVolume(vol)
      if (isMuted || vol === 0) player.mute()
      else player.unMute()
    })
  }, [volume, isMuted, isReady])

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
  }, [isPlaying, isReady, isSeeking])

  // --- HANDLERS ---
  const onPlayerReady: YouTubeProps['onReady'] = useCallback(
    (event: YouTubeEvent) => {
      internalPlayerRef.current = event.target
      setIsReady(true)
      setDuration(event.target.getDuration())
      event.target.setVolume(volume * 100)
      if (isPlaying) event.target.playVideo()
    },
    [volume, isPlaying],
  )

  const onPlayerStateChange: YouTubeProps['onStateChange'] = useCallback(
    (event: YouTubeEvent) => {
      if (event.data === 0) togglePlay()
    },
    [togglePlay],
  )

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

  const closePlayer = () => {
    setIsPlaying(false)
    setControlsVisible(false)
    setIsVideoEnabled(false)
  }

  const opts: YouTubeProps['opts'] = useMemo(
    () => ({
      host: 'https://www.youtube.com',
      playerVars: {
        autoplay: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        origin: origin,
        rel: 0,
        fs: 0,
      },
    }),
    [origin],
  )

  // --- RENDER ---

  if (currentSong && currentSong.youtubeId) {
    return (
      <aside
        id="media_player"
        className={cn(
          'fixed top-[calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))] inset-x-0 bottom-0 flex flex-col gap-[0.04rem] items-center justify-end z-20 pointer-events-none transition-all duration-1000 ease-in-out',
        )}
      >
        <Browser
          isVideoEnabled={isVideoEnabled}
          toggleVideo={toggleVideo}
          miniMode={miniMode}
          setMiniMode={setMiniMode}
          activeLibraryTab={activeLibraryTab}
          setActiveLibraryTab={setActiveLibraryTab}
          activeDetailsTab={activeDetailsTab}
          setActiveDetailsTab={setActiveDetailsTab}
          currentSong={currentSong}
        >
          {origin ? (
            <YouTube
              videoId={currentSong.youtubeId ?? undefined}
              onReady={onPlayerReady}
              onStateChange={onPlayerStateChange}
              title={currentSong.title}
              opts={opts}
              className="w-full"
              iframeClassName="w-full h-full"
            />
          ) : null}
        </Browser>
        <button className="flex items-center justify-center w-12 h-12 fixed bottom-4 right-20 z-10 bg-black/50 backdrop-blur-lg rounded-full shadow-[0_0_20px_var(--color-primary)] hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-200 ease-in-out cursor-pointer pointer-events-auto">
          <Music4 onClick={() => setControlsVisible(true)} size={24} className="text-white" />
        </button>

        <BottomBar
          currentSong={currentSong}
          isVideoEnabled={isVideoEnabled}
          setIsVideoEnabled={setIsVideoEnabled}
          miniMode={miniMode}
          setMiniMode={setMiniMode}
          controlsVisible={controlsVisible}
          setControlsVisible={setControlsVisible}
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
          onClose={closePlayer}
        />
      </aside>
    )
  } else {
    return null
  }
}
