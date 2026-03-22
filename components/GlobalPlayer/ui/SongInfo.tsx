'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePlayer } from '@/context/PlayerContext'
import { cn } from '@/utilities/ui'

interface SongInfoProps {
  className?: string
  /** When true, hides the thumbnail image (compact layout) */
  compact?: boolean
}

export const SongInfo = ({ className, compact = false }: SongInfoProps) => {
  const { currentSong } = usePlayer()

  if (!currentSong) return null

  const coverArtUrl = currentSong.coverImage
    ? currentSong.coverImage
    : typeof currentSong.coverArt === 'object'
      ? (currentSong.coverArt as { url?: string })?.url
      : undefined

  const Wrapper = (currentSong.slug ? Link : 'div') as React.ElementType
  const wrapperProps = currentSong.slug
    ? { href: `/music/${currentSong.slug}` }
    : {}

  return (
    <Wrapper
      {...wrapperProps}
      className={cn(
        'flex items-center gap-2 overflow-x-clip',
        currentSong.slug &&
          'cursor-pointer transition-transform hover:scale-105',
        className,
      )}
    >
      {!compact && coverArtUrl && (
        <Image
          src={coverArtUrl}
          alt={`${currentSong.title} Cover Art`}
          height={144}
          width={144}
          className="h-16 w-auto shrink-0 rounded-md object-cover"
          sizes="144px"
        />
      )}
      <div className="flex min-w-0 flex-col space-y-1">
        <h4 className="truncate font-heading text-lg leading-tight font-bold tracking-wide text-foreground">
          {currentSong.title}
        </h4>
        <span className="truncate font-mono text-sm leading-tight text-foreground/50 uppercase">
          {(currentSong as { artist?: string }).artist ||
            'The Second Messenger'}
        </span>
      </div>
    </Wrapper>
  )
}
