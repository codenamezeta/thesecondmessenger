'use client'

import {
  createContext,
  useContext,
  Dispatch,
  SetStateAction,
  useState,
} from 'react'

type ContextType = {
  youtubeVideoId: string
  setState: Dispatch<SetStateAction<string>>
}

const YoutubeVideoIdContext = createContext<ContextType>({
  youtubeVideoId: 'O94ESaJtHtM',
  setState: () => {},
})

export const YoutubeVideoIdProvider = ({ children }: any) => {
  const [youtubeVideoId, setState] = useState('O94ESaJtHtM')

  return (
    <YoutubeVideoIdContext.Provider value={{ youtubeVideoId, setState }}>
      {children}
    </YoutubeVideoIdContext.Provider>
  )
}

export const useYoutubeVideoId = () => useContext(YoutubeVideoIdContext)
