'use client'

import { Song } from '@/payload-types'
import Image from 'next/image'
import { usePlayer } from '@/context/PlayerContext'
import Link from 'next/link'

export const SongCard = ({ song }: { song: Song }) => {
  const { playMedia, currentSong, isPlaying } = usePlayer()

  const isCurrent = currentSong?.id === song.id
  const isActuallyPlaying = isCurrent && isPlaying

  return (
    <div
      className={`group bg-card rounded overflow-hidden hover:bg-main transition-all border cursor-pointer
        ${isCurrent ? 'border-accent ring-1 ring-accent' : 'border-gray-800 hover:border-gray-700'}`}
    >
      <div
        onClick={() => playMedia(song)} // <--- THE MAGIC CLICK
        className="relative aspect-square bg-surface overflow-hidden"
      >
        {song.coverArt && typeof song.coverArt === 'object' && song.coverArt.url ? (
          <Image
            src={song.coverArt.url}
            alt={song.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-primary font-heading text-3xl font-bold">
            {song.title}
          </div>
        )}

        {/* Hover Play Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300
          ${isActuallyPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <div className="flex items-center justify-center bg-secondary text-body w-12 h-12 p-4 rounded-full">
            {isActuallyPlaying ? '❚❚' : '▶'}
          </div>
        </div>
      </div>

      <Link href={`/songs/${song.slug}`} className="p-4 flex flex-col justify-between space-y-2">
        <h3 className="text-xl font-bold text-primary">{song.title}</h3>
        <span className="text-secondary">{song.genres}</span>
        <span className="text-card-foreground">{song.tagline}</span>
      </Link>
    </div>
  )
}
