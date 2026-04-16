'use client'

import { motion, useDragControls, type PanInfo } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/utilities/ui'

/**
 * A mobile bottom-sheet-style container that can be dismissed by swiping
 * the drag handle downward.
 *
 * - The handle (the iOS-style pill at the top) is the ONLY element that
 *   initiates a drag gesture. This keeps scrollable children (queue lists,
 *   lyrics, etc.) scrolling normally — if we listened for drags anywhere
 *   on the drawer, every list-scroll would read as a dismiss attempt.
 * - Elastic resistance on the downward axis gives the user visual feedback
 *   while they drag. On release, framer-motion snaps back to origin via
 *   `dragSnapToOrigin` unless the offset or velocity crossed the close
 *   threshold, in which case `onClose` fires and the caller animates the
 *   drawer shut (normally via a `max-height` transition on a parent).
 */

interface SwipeableDrawerProps {
  onClose: () => void
  /**
   * Whether the drag handle pill is rendered. Set to `false` for drawers
   * that have an always-visible tab bar in a collapsed state (e.g. the
   * InfoDrawer) — otherwise the handle would consume vertical space when
   * the drawer is closed and hide/crop the tab bar. When `false`, the
   * swipe gesture is also disabled, since there's nothing for users to
   * grab.
   */
  showHandle?: boolean
  className?: string
  children: ReactNode
}

const SWIPE_DISTANCE_PX = 80
const SWIPE_VELOCITY_PX_PER_S = 500

export const SwipeableDrawer = ({
  onClose,
  showHandle = true,
  className,
  children,
}: SwipeableDrawerProps) => {
  const controls = useDragControls()

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (
      info.offset.y > SWIPE_DISTANCE_PX ||
      info.velocity.y > SWIPE_VELOCITY_PX_PER_S
    ) {
      onClose()
    }
  }

  return (
    <motion.div
      drag={showHandle ? 'y' : false}
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.4 }}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      className={cn('flex h-full flex-col', className)}
    >
      {showHandle && (
        <div
          onPointerDown={(e) => controls.start(e)}
          role="button"
          tabIndex={-1}
          aria-label="Drag handle — swipe down to close"
          className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center active:cursor-grabbing md:hidden"
        >
          <div className="h-1 w-10 rounded-full bg-muted-foreground/40" />
        </div>
      )}
      <div className="min-h-0 flex-1">{children}</div>
    </motion.div>
  )
}
