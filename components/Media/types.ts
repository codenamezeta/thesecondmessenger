import type { StaticImageData } from 'next/image'
import type { ElementType, Ref } from 'react'

import type { Media as MediaType } from '@/payload-types'

/**
 * Derivative size names exposed by the Media collection (see
 * `collections/Media.ts > upload.imageSizes`). Pass via `displaySize` to
 * render an optimized WebP/AVIF derivative instead of the full-resolution
 * master file.
 */
export type MediaDisplaySize = 'thumbnail' | 'card' | 'feature' | 'feature_avif'

export interface Props {
  alt?: string
  className?: string
  fill?: boolean // for NextImage only
  htmlElement?: ElementType | null
  pictureClassName?: string
  imgClassName?: string
  onClick?: () => void
  onLoad?: () => void
  loading?: 'lazy' | 'eager' // for NextImage only
  priority?: boolean // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>
  resource?: MediaType | string | number | null // for Payload media
  size?: string // for NextImage only
  src?: StaticImageData // for static media
  videoClassName?: string
  /**
   * Which generated derivative to display. Falls back to the original master
   * file if the named size is unavailable on this resource (e.g. for
   * uploads that pre-date the imageSizes config — run the backfill at
   * `/api/admin/regenerate-media-sizes` to populate them).
   *
   * Pick by intended layout:
   * - `thumbnail` (400) — chips, tiny avatars, list rows
   * - `card`      (800) — grid tiles, card hero, mobile feature
   * - `feature`   (1600) — desktop hero, full-bleed sections
   *
   * Omit entirely when you actually need the original (downloads, print).
   */
  displaySize?: MediaDisplaySize
}
