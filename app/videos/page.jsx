import { getChannelVideos } from '../../lib/youtube'
import selectors from './video.module.scss'
import Header from '../components/Header'

export default async function VideosPage() {
  const channelId = 'UC7s-BDNomZ-sqKCecBIRrjQ'
  const videos = await getChannelVideos(channelId)

  return (
    <>
      <Header title='Videos' subtitle='@the2ndmsngr' />
      <div className='container'>
        <ul className={selectors.videoList}>
          {videos.map((video) => (
            <li key={video.id} className={selectors.videoItem}>
              <div className={selectors.videoWrapper}>
                <iframe
                  src={`https://www.youtube.com/embed/${video.id}`}
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                />
              </div>
              <h5 className={selectors.videoTitle}>{video.snippet.title}</h5>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
