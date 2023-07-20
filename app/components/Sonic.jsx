import { useState } from 'react'
import { RiCloseFill } from 'react-icons/ri'
import { FaPlayCircle, FaPauseCircle, FaStopCircle } from 'react-icons/fa'
import { Howl, Howler } from 'howler'
import selectors from '../styles/Sonic.module.scss'

export default function Sonic() {
  // const [hidden, setHidden] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const stems = [
    new Howl({
      src: ['/audio/Dream-Girl---Acoustic-1.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Acoustic-2.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Bass.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Drums.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Lead-Guitar-1.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Lead-Guitar-2.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Lead-Vocal.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Outro-Vocal-1-(High).wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Outro-Vocal-2-(Middle).wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Outro-Vocal-3-(Low).wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Rhythm-Guitar-1.wav'],
      preload: true,
    }),
    new Howl({
      src: ['/audio/Dream-Girl---Rhythm-Guitar-2.wav'],
      preload: true,
    }),
  ]
  //* Controls Functions
  // var stemsIDs = []
  function playStems() {
    // setIsPlaying(true)
    stems.forEach((stem) => {
      stem.play()
    })
    // setIsPlaying(true)
    console.log(`Is playing? ${isPlaying}`)
  }
  function pauseStems() {
    setIsPlaying(false)
    stems.forEach((stem) => {
      stem.pause()
    })
  }
  function stopStems() {
    setIsPlaying(false)
    stems.forEach((stem) => {
      stem.stop()
    })
  }
  // function setMasterGain() {
  //   Howler.volume([0.6667])
  // }

  return (
    <div id={selectors.sonic}>
      <FaPlayCircle onClick={playStems} />
      <FaPauseCircle onClick={pauseStems} />
      <FaStopCircle onClick={stopStems} />
      {/* <button onClick={playStems}>Play</button>
      <button onClick={pauseStems}>Pause</button>
      <button onClick={stopStems}>Stop</button> */}

      {/* <RiCloseFill style={{ marginLeft: 'auto' }} /> */}
    </div>
  )
}
