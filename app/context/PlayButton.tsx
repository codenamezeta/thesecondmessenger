'use client'
import { useYoutubeVideoId } from '@/app/context/store'

type PlayButtonProps = {
  videoId: string
}

export default function PlayButton({ videoId }: PlayButtonProps) {
  const { youtubeVideoId, setState } = useYoutubeVideoId()

  return <button onClick={() => setState(videoId)}>Play This Song</button>
}
