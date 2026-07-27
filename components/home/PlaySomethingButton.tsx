'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Play } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { usePlayer } from '@/context/PlayerContext'
import { PLAY_CATEGORIES, type PlayCategory } from '@/lib/home/playCategories'
import type { SongPreview } from './homeSectionTypes'

const ROTATE_INTERVAL_MS = 2400

/**
 * The hero/final-CTA primary action (LOCKED behavior per spec):
 * "Play something..." with a category token cycling Catchy → Upbeat →
 * Ambient → Mellow → Heavy → Recent. Clicking starts playback of the current
 * category immediately; users can also pick a category first, which stops
 * the rotation. Rotation also pauses on hover and under reduced motion.
 */
export function PlaySomethingButton({
  songs,
  queues,
  className,
}: {
  songs: SongPreview[]
  queues: Record<PlayCategory, Array<string | number>>
  className?: string
}) {
  const { playPlaylist } = usePlayer()
  const [category, setCategory] = useState<PlayCategory>(PLAY_CATEGORIES[0])
  const [locked, setLocked] = useState(false)
  const [hovered, setHovered] = useState(false)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
  }, [])

  useEffect(() => {
    if (locked || hovered) return
    const timer = setInterval(() => {
      if (reducedMotion.current) return
      setCategory(
        (prev) =>
          PLAY_CATEGORIES[
            (PLAY_CATEGORIES.indexOf(prev) + 1) % PLAY_CATEGORIES.length
          ],
      )
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [locked, hovered])

  const songsById = useMemo(() => {
    const map = new Map<string, SongPreview>()
    for (const song of songs) map.set(String(song.id), song)
    return map
  }, [songs])

  const handlePlay = () => {
    const queue = (queues[category] ?? [])
      .map((id) => songsById.get(String(id)))
      .filter((song): song is SongPreview => Boolean(song?.youtubeId))
    if (queue.length === 0) return
    playPlaylist(queue as Parameters<typeof playPlaylist>[0], 0)
  }

  return (
    <div
      className={cn('inline-flex flex-col items-stretch gap-2', className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        type="button"
        onClick={handlePlay}
        aria-label={`Play something ${category}`}
        className="group relative inline-flex min-h-14 items-center justify-between gap-4 border border-primary bg-primary/10 px-6 py-4 font-heading text-xs font-semibold tracking-[0.2em] text-primary uppercase transition-all duration-300 hover:bg-primary hover:text-background focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
        style={{
          boxShadow:
            '0 0 40px color-mix(in oklch, var(--primary) 25%, transparent)',
        }}
      >
        <span className="inline-flex items-center gap-3">
          <Play className="size-5 fill-current" />
          Play something...
        </span>
        {/* Rotating category token */}
        <span className="relative inline-flex h-5 min-w-[7ch] items-center justify-center overflow-hidden border border-current/40 px-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={category}
              initial={{ y: '110%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '-110%', opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
              className="block text-[10px] leading-none font-bold tracking-[0.2em]"
            >
              {category}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>

      {/* Category picker — selecting stops the rotation */}
      <div
        className="flex flex-wrap justify-center gap-px border border-border/30 bg-border/20"
        role="group"
        aria-label="Pick a category"
      >
        {PLAY_CATEGORIES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={category === option}
            onClick={() => {
              setCategory(option)
              setLocked(true)
            }}
            className={cn(
              'flex-1 bg-background px-2 py-1.5 font-mono text-[9px] tracking-[0.15em] uppercase transition-colors duration-200',
              category === option
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground/60 hover:bg-card/40 hover:text-foreground',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
