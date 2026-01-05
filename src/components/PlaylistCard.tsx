'use client'

import { usePlayer } from '@/context/PlayerContext'

const MyPlaylistComponent = () => {
  const { playPlaylist } = usePlayer()

  // This can be a list of YouTube IDs, or full/partial song objects
  const playlistItems = ['e4uenzs0Lfs', 'dQw4w9WgXcQ', '3JZ_D3ELwOQ']

  const handlePlayPlaylist = () => {
    // Start playing the playlist from the first video (index 0)
    playPlaylist(playlistItems, 0)
  }

  return (
    <button
      onClick={handlePlayPlaylist}
      className="w-full h-20 border border-white/50 hover:border-primary bg-primary/10 hover:bg-primary hover:text-black my-44"
    >
      Play My Awesome Playlist
    </button>
  )
}

export default MyPlaylistComponent
