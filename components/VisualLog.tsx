'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import YouTube from 'react-youtube' // <--- The Package
import {
  MonitorPlay,
  Calendar,
  Music,
  Link as LinkIcon,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { cn } from '@/utilities/ui'
import CommentsYT from '@/components/CommentsYT'
import { usePlayer } from '@/context/PlayerContext' // <--- Your Global Player Context
import { Button } from '@/components/ui/button'

// Define the type (including the new linkedSong)
type Video = {
  id: string
  title: string
  youtubeId: string
  publishedDate: string
  category: string
  description?: string
  linkedSong?: {
    id: number
    title: string
    slug?: string | null
  } | null
}

interface VisualLogProps {
  videos: Video[]
}

export const VisualLog = ({ videos }: VisualLogProps) => {
  const [activeVideo, setActiveVideo] = useState<Video>(videos[0])
  const { setIsPlaying } = usePlayer() // <--- Needed to pause the global player
  const [isExpanded, setIsExpanded] = useState(false)

  if (!videos || videos.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-border/50 p-12 text-center text-muted-foreground">
        <AlertCircle className="mx-auto mb-4" />
        No transmission signal detected.
      </div>
    )
  }

  // Handle Audio Conflict
  const onVideoPlay = () => {
    // When the user plays THIS video, we pause the Global Player
    console.log('Video Play Detected: Pausing Global Player...')
    setIsPlaying(false)
  }

  return (
    <div className="flex flex-col items-start gap-8 xl:flex-row">
      {/* --- LEFT: MASTER PLAYER --- */}
      <div className="w-full space-y-6 xl:w-[65%]">
        {/* The Viewscreen */}
        <div className="group relative z-10 aspect-video overflow-hidden rounded-md border border-primary/20 bg-primary/5 p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
          {/* Using React-YouTube instead of iframe for control */}
          <YouTube
            videoId={activeVideo.youtubeId}
            className="h-full w-full border border-primary/10"
            iframeClassName="w-full h-full"
            onPlay={onVideoPlay} // <--- THE MAGIC HOOK
            opts={{
              width: '100%',
              height: '100%',
              playerVars: {
                autoplay: 0,
                rel: 0,
                modestbranding: 1,
              },
            }}
          />

          {/* Corner Decor */}
          <div className="pointer-events-none absolute top-2 left-2 size-3 border-t border-l border-primary/50" />
          <div className="pointer-events-none absolute top-2 right-2 size-3 border-t border-r border-primary/50" />
          <div className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-primary/50" />
          <div className="pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b border-primary/50" />
        </div>

        {/* Video Info Block */}
        <div className="rounded-md border border-border/50 bg-card/20 p-6">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            {/* Category Badge */}
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-primary uppercase">
              {activeVideo.category}
            </span>

            {/* Date */}
            <span className="flex items-center gap-1 font-mono text-[10px] text-card-foreground/80">
              <Calendar size={10} />
              {new Date(activeVideo.publishedDate).toLocaleDateString()}
            </span>

            {/* LINKED SONG BADGE (If matched!) */}
            {activeVideo.linkedSong && (
              <Link
                href={`/music/${activeVideo.linkedSong.slug}`}
                className="ml-auto flex items-center gap-1 rounded-md border border-border bg-popover/20 px-2 py-0.5 font-mono text-[10px] tracking-widest text-card-foreground/80 uppercase transition-colors hover:bg-popover hover:text-popover-foreground"
              >
                <Music size={10} />
                Linked: {activeVideo.linkedSong.title}
                <LinkIcon size={8} />
              </Link>
            )}
          </div>

          <h2 className="mb-2 font-heading text-2xl tracking-wider text-card-foreground uppercase">
            {activeVideo.title}
          </h2>
          <p
            className={cn(
              'line-clamp-3 max-w-2xl cursor-pointer text-sm leading-relaxed whitespace-pre-wrap text-card-foreground/80 transition-all',
              isExpanded ? 'line-clamp-none' : '',
            )}
          >
            {activeVideo.description}
          </p>
          <Button
            variant="ghost"
            size="icon-lg"
            className="mt-3 py-3 text-xs tracking-widest uppercase"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}{' '}
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Button>
        </div>

        {/* INTEGRATED COMMS */}
        <div className="rounded-lg border border-border/50 bg-card/20 p-6">
          <CommentsYT videoId={activeVideo.youtubeId} />
        </div>
      </div>

      {/* --- RIGHT: THE ARCHIVE --- */}
      <div className="w-full space-y-4 xl:w-[35%]">
        <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-4">
          <MonitorPlay size={18} className="text-primary" />
          <h3 className="font-heading text-sm tracking-widest text-foreground uppercase">
            Visual Database ({videos.length})
          </h3>
        </div>

        <div className="max-h-[875px] space-y-3 overflow-y-auto p-2">
          {videos.map((video) => {
            const isActive = activeVideo.id === video.id
            return (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={cn(
                  'group flex w-full gap-4 rounded-lg border p-3 text-left transition-all',
                  isActive
                    ? 'border-primary/50 bg-card/50 shadow-[0_0_15px_rgba(10,250,255,0.2)]'
                    : 'border-border/50 bg-card/20 hover:border-primary/30 hover:bg-card/5',
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-32 shrink-0 overflow-hidden rounded-md border border-border/50 bg-background transition-colors group-hover:border-border">
                  <Image
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    fill
                    className={cn(
                      'object-cover transition-opacity',
                      isActive
                        ? 'opacity-100'
                        : 'opacity-60 group-hover:opacity-100',
                    )}
                  />
                  {/* Linked Indicator on Thumbnail */}
                  {video.linkedSong && (
                    <div className="absolute top-1 right-1 rounded-sm border border-border/50 bg-background/80 p-1">
                      <Music size={8} className="text-primary" />
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex min-w-0 flex-col justify-center gap-1">
                  <h4
                    className={cn(
                      'text-sm font-bold tracking-wide uppercase transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-card-foreground/80 group-hover:text-card-foreground',
                    )}
                  >
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-card-foreground/80">
                    <span>{new Date(video.publishedDate).getFullYear()}</span>
                    {video.linkedSong && (
                      <span className="text-primary/70"> • [SONG_LINKED]</span>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
