'use client'

import { Play } from 'lucide-react'
import type { Song } from '@/payload-types'
import { usePlayer } from '@/context/PlayerContext'
import { Button } from '@/components/ui/button'

interface ArchivePlayResultsButtonProps {
  songs: Song[]
}

/**
 * Isolated so that subscribing to the player context (which updates on every
 * playback tick) re-renders only this button — not the entire MusicArchive and
 * its cover images, which would flicker during playback.
 */
export function ArchivePlayResultsButton({
  songs,
}: ArchivePlayResultsButtonProps) {
  const { playPlaylist } = usePlayer()

  const handlePlayResults = () => {
    if (songs.length === 0) return
    playPlaylist(songs, 0)
  }

  return (
    <Button
      type="button"
      variant="default"
      size="sm"
      onClick={handlePlayResults}
      disabled={songs.length === 0}
      className="gap-1.5 text-xs font-semibold tracking-wide uppercase"
      aria-label={`Play all ${songs.length} results in the player`}
    >
      <Play className="size-4" fill="currentColor" />
      Play {songs.length} {songs.length === 1 ? 'Result' : 'Results'}
    </Button>
  )
}
