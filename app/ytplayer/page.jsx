'use client'
import { useEffect, useState, useRef } from 'react'

export default function Youtube() {
  // const [done, setDone] = useState(false)
  const [playerVars, setPlayerVars] = useState({ playsinline: 1 })
  const playerRef = useRef(null)

  useEffect(() => {
    // Load the IFrame Player API code asynchronously.
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

    // Define the onYouTubeIframeAPIReady function and call it after the API code downloads.
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('player', {
        videoId: 'KGpaiUFXGCM',
        playerVars: {
          listType: 'playlist',
          list: 'PLFhi_wBjERLqYiJSbS0jOKhcjnfT1EuE1',
          controls: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: onPlayerReady,
          // onStateChange: onPlayerStateChange,
        },
      })
    }
  }, [])

  const onPlayerReady = (event) => {
    event.target.playVideo()
  }

  // const onPlayerStateChange = (event) => {
  //   if (event.data === window.YT.PlayerState.PLAYING && !done) {
  //     setTimeout(stopVideo, 6000)
  //     setDone(true)
  //   }
  // }

  const stopVideo = () => {
    playerRef.current.stopVideo()
  }

  const handlePlayClick = () => {
    playerRef.current.playVideo()
  }

  const handlePauseClick = () => {
    playerRef.current.pauseVideo()
  }

  const handleStopClick = () => {
    playerRef.current.stopVideo()
  }

  const moveForward = () => {
    const index = playerRef.current.getPlaylistIndex()
    playerRef.current.playVideoAt(index + 1)
  }

  const moveBackward = () => {
    const index = playerRef.current.getPlaylistIndex()
    playerRef.current.playVideoAt(index - 1)
  }

  return (
    <div>
      <div id='player'></div>
      <div>
        <button onClick={moveBackward}>Backward</button>
        <button onClick={handlePlayClick}>Play</button>
        <button onClick={handleStopClick}>Stop</button>
        <button onClick={handlePauseClick}>Pause</button>
        <button onClick={moveForward}>Forward</button>
      </div>
    </div>
  )
}
