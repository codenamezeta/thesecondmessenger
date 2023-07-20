import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import selectors from './Play.module.scss'

type PlayProps = {
  youTubeVideoId?: string
  youTubePlaylistId?: string
  videoTitle?: string
}

export default function Play({
  //Todo: Add defaults if nothing is passed.
  youTubeVideoId,
  youTubePlaylistId,
  videoTitle = 'YouTube Video',
}: PlayProps) {
  //- Builds the iframe src in a different way if there's a youTubePlaylistId provided instead of a single video.
  const srcURL = youTubePlaylistId
    ? `https://www.youtube.com/embed/${youTubeVideoId}?listType=playlist&list=${youTubePlaylistId}&color=white&rel=0`
    : `https://www.youtube.com/embed/${youTubeVideoId}?color=white&rel=0`

  return (
    <section id={selectors.play}>
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
