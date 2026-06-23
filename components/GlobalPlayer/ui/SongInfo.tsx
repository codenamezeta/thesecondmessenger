'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { motion, type PanInfo } from 'motion/react'
import { usePlayer } from '@/context/PlayerContext'
import { normalizeMediaUrlForImage } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

interface SongInfoProps {
  className?: string
  /** When true, hides the thumbnail image (compact layout) */
  compact?: boolean
}

// Horizontal offset / velocity thresholds for triggering a skip. Chosen to
// feel deliberate enough that incidental mouse drags on desktop don't fire
// a skip, but loose enough that a natural swipe on mobile does.
const SKIP_DISTANCE_PX = 70
const SKIP_VELOCITY = 400

export const SongInfo = ({ className, compact = false }: SongInfoProps) => {
  const { currentSong, playNext, playPrevious } = usePlayer()

  // Tracks whether a drag has just occurred, so the wrapped <Link>'s click
  // handler can suppress navigation. Framer-motion doesn't automatically
  // suppress click on descendants of a draggable element; this ref bridges
  // the gesture/click boundary.
  const hasPannedRef = useRef(false)

  if (!currentSong) return null

  const rawCoverUrl = currentSong.coverImage
    ? currentSong.coverImage
    : typeof currentSong.coverArt === 'object'
      ? (currentSong.coverArt as { url?: string })?.url
      : undefined
  const coverArtUrl = normalizeMediaUrlForImage(rawCoverUrl) || undefined

  const hasSlug = Boolean(currentSong.slug)

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -SKIP_DISTANCE_PX || info.velocity.x < -SKIP_VELOCITY) {
      playNext()
    } else if (
      info.offset.x > SKIP_DISTANCE_PX ||
      info.velocity.x > SKIP_VELOCITY
    ) {
      playPrevious()
    }
    // Brief delay so the synthetic click fired on pointerup still sees the
    // flag and can cancel itself before navigation.
    setTimeout(() => {
      hasPannedRef.current = false
    }, 100)
  }

  const innerContent = (
    <>
      {!compact && coverArtUrl && (
        <Image
          src={coverArtUrl}
          alt={`${currentSong.title} Cover Art`}
          height={144}
          width={144}
          className="h-16 w-auto shrink-0 rounded-md object-cover"
          sizes="144px"
          draggable={false}
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
    </>
  )

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.25}
      dragSnapToOrigin
      dragMomentum={false}
      onDragStart={() => {
        hasPannedRef.current = true
      }}
      onDragEnd={handleDragEnd}
      className={cn(
        'flex items-center gap-2 overflow-x-clip',
        hasSlug && 'cursor-pointer',
        className,
      )}
    >
      {hasSlug ? (
        <Link
          href={`/music/${currentSong.slug}`}
          onClick={(e) => {
            if (hasPannedRef.current) e.preventDefault()
          }}
          className="flex w-full min-w-0 items-center gap-2 transition-transform hover:scale-105"
          draggable={false}
        >
          {innerContent}
        </Link>
      ) : (
        innerContent
      )}
    </motion.div>
  )
}
