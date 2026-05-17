'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { usePlayer } from '@/context/PlayerContext'

/**
 * When the SPA pathname changes while video is in theater mode, collapse to
 * mini so the underlying page remains visible — theater otherwise obscures route changes.
 */
export const CollapseTheaterOnRouteChange = () => {
  const pathname = usePathname()
  const { videoEnabled, videoMode, setVideoMode } = usePlayer()
  const prevPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (prevPathRef.current === null) {
      prevPathRef.current = pathname
      return
    }
    if (prevPathRef.current === pathname) return

    prevPathRef.current = pathname

    if (videoEnabled && videoMode === 'theater') setVideoMode('mini')
  }, [pathname, videoEnabled, videoMode, setVideoMode])

  return null
}
