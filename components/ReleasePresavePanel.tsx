'use client'

import { ReleaseCountdown } from '@/components/ReleaseCountdown'
import { LibrarySync } from '@/components/LibrarySync'
import { cn } from '@/utilities/ui'

export type ReleasePresavePanelProps = {
  releaseDate?: string | null
  premiereAt?: string | null
  songId: string
  youtubeId?: string
  spotifyId?: string
  initialSpotifySaved: boolean
  initialYoutubeSaved: boolean
  className?: string
}

/**
 * Full-width pre-release panel: featured countdown + library sync.
 * Sits between the song hero and main content so it can use the page width.
 */
export function ReleasePresavePanel({
  releaseDate,
  premiereAt,
  songId,
  youtubeId,
  spotifyId,
  initialSpotifySaved,
  initialYoutubeSaved,
  className,
}: ReleasePresavePanelProps) {
  return (
    <section className={cn('container py-6 md:py-8', className)}>
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-primary/40',
          'bg-linear-to-br from-primary/15 via-background/95 to-background',
          'p-5 shadow-[0_0_50px_hsl(var(--primary)/0.18)] md:p-8 lg:p-10',
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.14),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-2 left-2 size-3 border-t border-l border-primary/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-2 right-2 size-3 border-t border-r border-primary/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-primary/50"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b border-primary/50"
        />

        <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10 xl:gap-14">
          <div className="lg:col-span-7 xl:col-span-8">
            <ReleaseCountdown
              releaseDate={releaseDate}
              premiereAt={premiereAt}
              variant="featured"
              embedded
            />
          </div>

          <div className="lg:col-span-5 xl:col-span-4">
            <div className="rounded-lg border border-primary/20 bg-background/40 p-4 backdrop-blur-sm md:p-5">
              <LibrarySync
                songId={songId}
                youtubeId={youtubeId}
                spotifyId={spotifyId}
                isReleased={false}
                initialSpotifySaved={initialSpotifySaved}
                initialYoutubeSaved={initialYoutubeSaved}
                variant="featured"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
