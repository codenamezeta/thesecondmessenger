'use client'
// import { useEffect } from 'react'
import selectors from './SongPlayer.module.scss'
import { useYoutubeVideoId } from '@/app/context/store'

export default function SongPlayer() {
  const { youtubeVideoId, setState } = useYoutubeVideoId()
  // const srcURL = `https://www.youtube.com/embed/${youtubeVideoId}?color=white&rel=0`

  return (
    <section id={selectors.song_player}>
      <div className={selectors.viewport}>
        <iframe
          id='ytplayer'
          data-type='text/html'
          src={`https://www.youtube.com/embed/${youtubeVideoId}?color=white&rel=0`}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>
    </section>
  )
}
