import React from 'react'
import { cn } from '@/utilities/ui'

interface VideoBackgroundProps {
  /**
   * Path to the video file (e.g., '/vids/my-video.mp4')
   */
  src: string
  /**
   * If true, fixes the background to the viewport (good for full-page backgrounds).
   * If false, positions it absolutely within the nearest positioned parent.
   */
  fixed?: boolean
  /**
   * Opacity of the video (0 to 1). Default is 0.2.
   */
  opacity?: number
  /**
   * CSS mix-blend-mode.
   */
  blendMode?:
    | 'normal'
    | 'multiply'
    | 'screen'
    | 'overlay'
    | 'darken'
    | 'lighten'
    | 'color-dodge'
    | 'color-burn'
    | 'hard-light'
    | 'soft-light'
    | 'difference'
    | 'exclusion'
    | 'hue'
    | 'saturation'
    | 'color'
    | 'luminosity'
  /**
   * Optional poster image to display before the video starts streaming.
   * Strongly recommended when the video is large (~10 MB+) — it lets the
   * browser paint a still frame immediately while the MP4 downloads.
   */
  poster?: string
  /**
   * How aggressively the browser should fetch video bytes.
   *
   * - `'none'`   — don't fetch anything until the video starts playing.
   *                Best for decorative backgrounds; combine with `poster`.
   * - `'metadata'` — fetch just enough to know duration / dimensions.
   * - `'auto'`   — let the browser decide (usually full preload).
   *
   * Defaults to `'metadata'`. Set `'none'` for purely decorative backgrounds
   * to avoid downloading multi-MB MP4s before the user sees the page.
   */
  preload?: 'none' | 'metadata' | 'auto'
  className?: string
  children?: React.ReactNode
}

export const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  fixed = false,
  opacity = 0.2,
  blendMode = 'normal',
  poster,
  preload = 'metadata',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'pointer-events-none',
        fixed ? 'fixed inset-0' : 'absolute inset-0',
        '-z-10 overflow-hidden',
        className,
      )}
      style={{
        opacity: opacity,
        mixBlendMode: blendMode,
      }}
    >
      <video
        autoPlay
        loop
        muted
        playsInline
        preload={preload}
        poster={poster}
        className="object-cover w-full h-full"
      >
        <source src={src} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-background/0" />
    </div>
  )
}
