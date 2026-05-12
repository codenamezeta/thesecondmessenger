'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from '@/components/ui/card'
import { Check, Disc3, Loader2, Save, Youtube } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { useYouTubeAuth } from '@/context/YouTubeAuthContext'
import { likeVideo, subscribeToChannel } from '@/lib/youtube/client'
import { getSpotifyAuthUrl } from '@/actions/library-sync'
import { useRouter, useSearchParams } from 'next/navigation'

const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

// import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'

interface LibrarySyncProps {
  songId: string
  youtubeId?: string
  spotifyId?: string
  isReleased: boolean
  initialIsSaved?: boolean // <--- Receive the DB check
}

export const LibrarySync = ({
  songId,
  youtubeId,
  // spotifyId,
  isReleased,
  initialIsSaved = false,
}: LibrarySyncProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ensureToken } = useYouTubeAuth()

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'connected'
  >(() => {
    if (initialIsSaved) return 'connected'
    if (
      searchParams.get('success') === 'true' &&
      searchParams.get('action') === 'spotify'
    )
      return 'success'
    return 'idle'
  })
  const [activePlatform, setActivePlatform] = useState<
    'spotify' | 'youtube' | null
  >(null)

  // --- SPOTIFY HANDLER ---
  const handleSpotify = async () => {
    setStatus('loading')
    setActivePlatform('spotify')
    const url = await getSpotifyAuthUrl(songId)
    if (url) router.push(url)
  }

  // --- YOUTUBE HANDLER ---
  const handleYouTube = async () => {
    if (!youtubeId && isReleased) return

    setStatus('loading')
    setActivePlatform('youtube')

    try {
      const token = await ensureToken({ interactive: true })
      if (!token) {
        setStatus('idle')
        return
      }

      if (isReleased && youtubeId) {
        await likeVideo(youtubeId, token)
      } else {
        if (!YOUTUBE_CHANNEL_ID) {
          throw new Error('Channel ID not configured')
        }
        await subscribeToChannel(YOUTUBE_CHANNEL_ID, token)
      }

      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('idle')
      alert(
        err instanceof Error ? err.message : 'Failed to connect to YouTube.',
      )
    }
  }

  // --- RENDER: SUCCESS FLASH ---
  if (status === 'success') {
    return (
      <div className="flex w-full animate-in items-center justify-center gap-3 rounded-lg border border-green-500/50 bg-green-500/10 p-4 duration-300 fade-in zoom-in">
        <div className="rounded-full bg-green-500 p-2 text-black">
          <Check size={20} strokeWidth={3} />
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold tracking-widest text-green-500 uppercase">
            {activePlatform === 'youtube' ? 'Signal Verified' : 'Success!'}
          </h4>
          <p className="max-w-40 font-mono text-[10px] text-wrap text-green-400/80">
            {
              activePlatform === 'youtube'
                ? isReleased
                  ? 'Video Liked'
                  : 'Subscribed to Channel'
                : isReleased
                  ? 'Added to Spotify Library'
                  : 'Check your Spotify Library on Release Day!' // <--- FIXED
            }
          </p>
        </div>
      </div>
    )
  }

  // --- RENDER: ALREADY CONNECTED ---
  if (status === 'connected') {
    return (
      <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-muted/5 p-6">
        <h4 className="mb-2 flex items-center gap-2 font-heading text-xs tracking-widest text-white uppercase">
          <Check size={16} className="text-primary" />
          Status: {isReleased ? 'Link Active' : 'Pre-Save Active'}
        </h4>

        <p className="mb-4 text-xs text-muted">
          {isReleased
            ? 'Your secure link is established. Click below to add this specific frequency to your collection.'
            : 'Your connection is secure. This transmission will be captured automatically upon arrival.'}
        </p>

        <button
          onClick={handleSpotify}
          className="flex w-full items-center justify-center gap-2 rounded border border-white/10 px-4 py-2 text-[10px] font-bold tracking-widest text-white uppercase transition-colors hover:bg-white/5"
        >
          <Save size={14} className="text-primary" />
          {isReleased ? 'Save Song to Library' : 'Re-Confirm Pre-Save'}
        </button>
      </div>
    )
  }

  // --- RENDER: DEFAULT ---
  return (
    <Card className="group bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-body text-xl font-bold tracking-widest uppercase">
          <Save size={24} className="text-primary" />
          {isReleased ? 'Library Sync' : 'Pre-Save Protocol'}
        </CardTitle>
        <CardDescription className="font-mono text-sm tracking-wider text-muted-foreground">
          Save this release and connect your platforms.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ButtonGroup orientation="vertical" className="w-full">
          <Button
            onClick={handleSpotify}
            disabled={status === 'loading'}
            className={cn(
              'flex w-full items-center justify-center gap-2 py-6 font-heading tracking-wider',
              'border border-primary/20 bg-background text-foreground hover:bg-[#1ed760] hover:text-black',
            )}
          >
            {status === 'loading' && activePlatform === 'spotify' ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Disc3 size={20} />
            )}
            {isReleased ? 'Save on Spotify' : 'Pre-Save on Spotify'}
          </Button>
          {youtubeId && (
            <Button
              onClick={handleYouTube}
              disabled={status === 'loading'}
              className={cn(
                'flex w-full items-center justify-center gap-2 py-6 font-heading tracking-wider',
                'border border-primary/20 bg-background text-foreground hover:bg-[#FF0000] hover:text-white',
              )}
            >
              {status === 'loading' && activePlatform === 'youtube' ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Youtube size={20} />
              )}
              {isReleased ? 'Like on YouTube' : 'Subscribe on YouTube'}
            </Button>
          )}
        </ButtonGroup>
      </CardContent>
      <CardFooter className="flex items-center justify-center text-center text-[9px] tracking-widest text-muted-foreground uppercase">
        - Neural Link Secured -
      </CardFooter>
    </Card>
  )
}
