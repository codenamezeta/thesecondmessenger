import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
// import { useRef, useState, useEffect } from 'react'
import selectors from './Theater.module.scss'
// import YouTube from 'react-youtube'
// import { useEffect } from 'react'

type TheaterProps = {
  youTubeVideoId?: string
  youTubePlaylistId?: string
  videoTitle?: string
}

export default function Theater({
  //Todo: Add defaults if nothing is passed.
  youTubeVideoId,
  youTubePlaylistId,
  videoTitle = 'YouTube Video',
}: TheaterProps) {
  //? Builds the iframe src in a different way if there's a youTubePlaylistId provided.
  const srcURL = youTubePlaylistId
    ? `https://www.youtube.com/embed/${youTubeVideoId}?listType=playlist&list=${youTubePlaylistId}&color=white&rel=0`
    : `https://www.youtube.com/embed/${youTubeVideoId}?color=white&rel=0`

  return (
    <section id={selectors.theater}>
      <div className={selectors.viewport}>
        <iframe
          id='ytplayer'
          data-type='text/html'
          src={srcURL}
          title={videoTitle}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>
    </section>
  )
}
