'use client'
import { useState } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import selectors from './Play.module.scss'
import { getVideoOrPlaylistIdFromUrl } from '@/lib/youtube'

// type PlayProps = {
//   youTubeVideoId?: string
//   youTubePlaylistId?: string
//   videoTitle?: string
// }

export default function Play(
  {
    // //Todo: Add defaults if nothing is passed.
    // youTubeVideoId,
    // youTubePlaylistId = 'PLFhi_wBjERLqYiJSbS0jOKhcjnfT1EuE1',
    // videoTitle = 'YouTube Video',
  }
) {
  // : PlayProps
  const [whatToPlay, setWhatToPlay] = useState('O94ESaJtHtM')
  //- Builds the iframe src in a different way if there's a youTubePlaylistId provided instead of a single video.
  // const srcURL = youTubePlaylistId
  //   ? `https://www.youtube.com/embed/${youTubeVideoId}?listType=playlist&list=${youTubePlaylistId}&color=white&rel=0`
  //   : `https://www.youtube.com/embed/${youTubeVideoId}?color=white&rel=0`
  const srcURL = `https://www.youtube.com/embed/${whatToPlay}?color=white&rel=0`

  return (
    <section id={selectors.play}>
      <div className={selectors.viewport}>
        <iframe
          id='ytplayer'
          data-type='text/html'
          // src={srcURL}
          // title={videoTitle}
          src={srcURL}
          frameBorder='0'
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>
    </section>
  )
}
