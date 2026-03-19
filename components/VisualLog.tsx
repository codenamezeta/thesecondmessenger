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
  ArrowRight,
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
    id: string
    title: string
    slug: string
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
      <div className="p-12 border border-border/50 border-dashed rounded-md text-center text-muted-foreground">
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
    <div className="flex flex-col xl:flex-row gap-8 items-start">
      {/* --- LEFT: MASTER PLAYER --- */}
      <div className="w-full xl:w-[65%] space-y-6">
        {/* The Viewscreen */}
        <div className="relative p-3 aspect-video bg-primary/5 border border-primary/20 rounded-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] group z-10">
          {/* Using React-YouTube instead of iframe for control */}
          <YouTube
            videoId={activeVideo.youtubeId}
            className="w-full h-full border border-primary/10"
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
          <div className="absolute top-2 left-2 size-3 border-t border-l border-primary/50 pointer-events-none" />
          <div className="absolute top-2 right-2 size-3 border-t border-r border-primary/50 pointer-events-none" />
          <div className="absolute bottom-2 left-2 size-3 border-b border-l border-primary/50 pointer-events-none" />
          <div className="absolute bottom-2 right-2 size-3 border-b border-r border-primary/50 pointer-events-none" />
        </div>

        {/* Video Info Block */}
        <div className="bg-card/20 border border-border/50 rounded-md p-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {/* Category Badge */}
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              {activeVideo.category}
            </span>

            {/* Date */}
            <span className="text-[10px] font-mono text-card-foreground/80 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(activeVideo.publishedDate).toLocaleDateString()}
            </span>

            {/* LINKED SONG BADGE (If matched!) */}
            {activeVideo.linkedSong && (
              <Link
                href={`/songs/${activeVideo.linkedSong.slug}`}
                className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-card-foreground/80 bg-popover/20 px-2 py-0.5 rounded-md border border-border hover:bg-popover hover:text-popover-foreground transition-colors ml-auto"
              >
                <Music size={10} />
                Linked: {activeVideo.linkedSong.title}
                <LinkIcon size={8} />
              </Link>
            )}
          </div>

          <h2 className="text-2xl font-heading text-card-foreground uppercase tracking-wider mb-2">
            {activeVideo.title}
          </h2>
          <p
            className={cn(
              'text-sm text-card-foreground/80 max-w-2xl leading-relaxed whitespace-pre-wrap line-clamp-3 transition-all cursor-pointer',
              isExpanded ? 'line-clamp-none' : '',
            )}
          >
            {activeVideo.description}
          </p>
          <Button
            variant="ghost"
            size="full"
            className="uppercase text-xs tracking-widest py-3 mt-3"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Collapse' : 'Expand'}{' '}
            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </Button>
        </div>

        {/* INTEGRATED COMMS */}
        <div className="bg-card/20 border border-border/50 rounded-lg p-6">
          <CommentsYT videoId={activeVideo.youtubeId} />
        </div>
      </div>

      {/* --- RIGHT: THE ARCHIVE --- */}
      <div className="w-full xl:w-[35%] space-y-4">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
          <MonitorPlay size={18} className="text-primary" />
          <h3 className="font-heading text-foreground uppercase tracking-widest text-sm">
            Visual Database ({videos.length})
          </h3>
        </div>

        <div className="space-y-3 max-h-[875px] overflow-y-auto p-2 ">
          {videos.map((video) => {
            const isActive = activeVideo.id === video.id
            return (
              <button
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className={cn(
                  'w-full flex gap-4 p-3 rounded-lg border transition-all text-left group',
                  isActive
                    ? 'bg-card/50 border-primary/50 shadow-[0_0_15px_rgba(10,250,255,0.2)]'
                    : 'bg-card/20 border-border/50 hover:bg-card/5 hover:border-primary/30',
                )}
              >
                {/* Thumbnail */}
                <div className="relative w-32 aspect-video bg-background rounded-md overflow-hidden shrink-0 border border-border/50 group-hover:border-border transition-colors">
                  <Image
                    src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                    alt={video.title}
                    fill
                    className={cn(
                      'object-cover transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-60 group-hover:opacity-100',
                    )}
                  />
                  {/* Linked Indicator on Thumbnail */}
                  {video.linkedSong && (
                    <div className="absolute top-1 right-1 bg-background/80 p-1 rounded-sm border border-border/50">
                      <Music size={8} className="text-primary" />
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <div className="flex flex-col justify-center gap-1 min-w-0">
                  <h4
                    className={cn(
                      'font-bold text-sm uppercase tracking-wide transition-colors',
                      isActive
                        ? 'text-primary'
                        : 'text-card-foreground/80 group-hover:text-card-foreground',
                    )}
                  >
                    {video.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-card-foreground/80">
                    <span>{new Date(video.publishedDate).getFullYear()}</span>
                    {video.linkedSong && <span className="text-primary/70"> • [SONG_LINKED]</span>}
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
