// import { useRef, useState, useEffect } from 'react'
// import { Howl, Howler } from 'howler'
// import ReactAudioPlayer from 'react-audio-player'
// import { loadGetInitialProps } from 'next/dist/shared/lib/utils'
import { useState, useRef, useEffect } from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { FaPlayCircle, FaPauseCircle } from 'react-icons/fa'
import selectors from '../styles/SongPlayer.module.scss'

export default function SongPlayer({ audioSrc }) {
  //* State
  const [isOpen, setIsOpen] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)

  //* Reference
  const audioEl = useRef()

  function play() {
    setIsOpen(true)
    setIsPlaying(true)
    audioEl.current.play()
  }
  function pause() {
    setIsPlaying(false)
    audioEl.current.pause()
  }
  function closePlayer() {
    setIsPlaying(false)
    setIsOpen(false)
    audioEl.current.pause()
  }

  // function useKey(key, callback) {
  //   useEffect(()=>{
  //     document.addEventListener
  //   })
  // }

  // function handleKey(event) {
  //   useEffect(() => {
  //     console.log(event)
  //     //     document.addEventListener
  //   })

  //   // if (event.key === 'y') {
  //   //   alert('The sky is your starting point!')
  //   // } else if (event.key === 'n') {
  //   //   alert('The sky is your limit👀')
  //   // }
  // }

  return (
    <div
      id={selectors.sonic}
      className={isOpen ? `${selectors.open}` : null}
      onKeyDown={(event) => {
        console.log(event)
      }}
    >
      <audio src={audioSrc} ref={audioEl} preload='auto' />
      <input
        type='range'
        id={selectors.progressBar}
        min='0'
        max='800'
        // value={audioEl.current.currentTime}
      />
      <input
        type='range'
        id={selectors.volumeSlider}
        min='0'
        max='12'
        // value={audioEl.current.currentTime}
      />
      <span id={selectors.playPause}>
        {isPlaying ? (
          <FaPauseCircle onClick={pause} title='Pause Playback' />
        ) : (
          <FaPlayCircle onClick={play} title='Play Audio' />
        )}
      </span>
      <RiCloseFill
        onClick={closePlayer}
        title='Close Audio Player'
        id={selectors.closeButton}
        // style={{ marginRight: 'var(--spacer-2)' }}
      />
    </div>
  )
}
