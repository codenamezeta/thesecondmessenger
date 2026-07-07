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
import { getSpotifyAuthUrl, saveSpotifyTrackNow } from '@/actions/library-sync'
import { recordYouTubePresave } from '@/actions/youtube-presave'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from './ui/button'
import { ButtonGroup } from './ui/button-group'

const YOUTUBE_CHANNEL_ID = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID

interface LibrarySyncProps {
  songId: string
  youtubeId?: string
  spotifyId?: string
  isReleased: boolean
  initialSpotifySaved?: boolean
  initialYoutubeSaved?: boolean
  variant?: 'sidebar' | 'featured'
}

export const LibrarySync = ({
  songId,
  youtubeId,
  spotifyId,
  isReleased,
  initialSpotifySaved = false,
  initialYoutubeSaved = false,
  variant = 'sidebar',
}: LibrarySyncProps) => {
  const isFeatured = variant === 'featured'
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ensureToken } = useYouTubeAuth()

  const [spotifyLinked, setSpotifyLinked] = useState(initialSpotifySaved)
  const [youtubeLinked, setYoutubeLinked] = useState(initialYoutubeSaved)

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >(() => {
    if (
      searchParams.get('success') === 'true' &&
      searchParams.get('action') === 'spotify'
    )
      return 'success'
    if (
      searchParams.get('error') === 'spotify' &&
      searchParams.get('action') === 'spotify'
    )
      return 'error'
    return 'idle'
  })
  const [activePlatform, setActivePlatform] = useState<
    'spotify' | 'youtube' | null
  >(() => (searchParams.get('action') === 'spotify' ? 'spotify' : null))
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    if (searchParams.get('error') !== 'spotify') return null
    const reason = searchParams.get('reason')
    if (reason === 'access_denied') {
      return 'Spotify authorization was cancelled.'
    }
    return 'Could not connect to Spotify. Please try again.'
  })

  const handleSpotify = async () => {
    setStatus('loading')
    setActivePlatform('spotify')
    setErrorMessage(null)

    try {
      if (isReleased && spotifyId && spotifyLinked) {
        const result = await saveSpotifyTrackNow(songId)
        if (result.success) {
          setStatus('success')
          setTimeout(() => setStatus('idle'), 3000)
          return
        }
      }

      if (isReleased && spotifyId && !spotifyLinked) {
        const result = await saveSpotifyTrackNow(songId)
        if (result.success) {
          setSpotifyLinked(true)
          setStatus('success')
          setTimeout(() => setStatus('idle'), 3000)
          return
        }
      }

      const url = await getSpotifyAuthUrl(songId)
      router.push(url)
    } catch (err) {
      setStatus('error')
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Spotify is not configured on this server.',
      )
    }
  }

  const handleYouTube = async () => {
    if (!youtubeId) return

    setStatus('loading')
    setActivePlatform('youtube')

    try {
      const token = await ensureToken({ interactive: true })
      if (!token) {
        setStatus('idle')
        return
      }

      if (!YOUTUBE_CHANNEL_ID) {
        throw new Error('Channel ID not configured')
      }

      await subscribeToChannel(YOUTUBE_CHANNEL_ID, token)

      let likeSucceeded = false
      try {
        await likeVideo(youtubeId, token)
        likeSucceeded = true
      } catch {
        likeSucceeded = false
      }

      await recordYouTubePresave(songId, {
        likeAttempted: true,
        likeSucceeded,
      })

      setYoutubeLinked(true)
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('idle')
      alert(
        err instanceof Error ? err.message : 'Failed to connect to YouTube.',
      )
    }
  }

  const spotifySuccessMessage = isReleased
    ? 'Following artist — added to your library.'
    : 'Following artist — track saves on release day.'

  const youtubeSuccessMessage = (() => {
    if (isReleased) return 'Subscribed — video liked.'
    if (youtubeId) return 'Subscribed — video will be liked at premiere.'
    return 'Subscribed to channel.'
  })()

  const flashClass = cn(
    'flex w-full animate-in items-center justify-center gap-3 rounded-lg border p-4 duration-300 fade-in zoom-in',
    isFeatured && 'py-5',
  )

  if (status === 'error') {
    return (
      <div
        className={cn(
          'flex w-full flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4',
          isFeatured && 'border-destructive/60 p-5',
        )}
      >
        <div>
          <h4 className="font-heading text-sm font-bold tracking-widest text-destructive uppercase">
            Link Failed
          </h4>
          <p className="mt-1 font-mono text-[10px] text-wrap text-destructive/80">
            {errorMessage ??
              'Could not connect to Spotify. Please try again in a moment.'}
          </p>
        </div>
        <button
          onClick={handleSpotify}
          className="flex w-full items-center justify-center gap-2 rounded border border-destructive/30 px-4 py-2 text-[10px] font-bold tracking-widest text-destructive uppercase transition-colors hover:bg-destructive/10"
        >
          <Disc3 size={14} />
          Retry Spotify Link
        </button>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div
        className={cn(
          flashClass,
          'border-green-500/50 bg-green-500/10',
        )}
      >
        <div className="rounded-full bg-green-500 p-2 text-black">
          <Check size={20} strokeWidth={3} />
        </div>
        <div>
          <h4 className="font-heading text-sm font-bold tracking-widest text-green-500 uppercase">
            {activePlatform === 'youtube' ? 'Signal Verified' : 'Success!'}
          </h4>
          <p
            className={cn(
              'max-w-48 font-mono text-[10px] text-wrap text-green-400/80',
              isFeatured && 'max-w-none text-xs',
            )}
          >
            {activePlatform === 'youtube'
              ? youtubeSuccessMessage
              : spotifySuccessMessage}
          </p>
        </div>
      </div>
    )
  }

  if (spotifyLinked && !youtubeId) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-lg border border-primary/30 bg-muted/5 p-6',
          isFeatured && 'border-primary/40 bg-primary/5 p-5',
        )}
      >
        <h4 className="mb-2 flex items-center gap-2 font-heading text-xs tracking-widest text-white uppercase">
          <Check size={16} className="text-primary" />
          Status: {isReleased ? 'Link Active' : 'Pre-Save Active'}
        </h4>
        <p className="mb-4 text-xs text-muted">
          {isReleased
            ? 'Your Spotify link is ready. Tap below to save this track.'
            : 'You are following the artist. This track saves automatically on release day.'}
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

  const buttonRow = (
    <>
      <Button
        onClick={handleSpotify}
        disabled={status === 'loading'}
        className={cn(
          'flex w-full items-center justify-center gap-2 font-heading tracking-wider',
          'border border-primary/20 bg-background text-foreground hover:bg-[#1ed760] hover:text-black',
          spotifyLinked && 'border-[#1ed760]/40',
          isFeatured ? 'py-6 text-base' : 'py-6',
        )}
      >
        {status === 'loading' && activePlatform === 'spotify' ? (
          <Loader2 size={isFeatured ? 20 : 16} className="animate-spin" />
        ) : spotifyLinked ? (
          <Check size={isFeatured ? 22 : 20} />
        ) : (
          <Disc3 size={isFeatured ? 22 : 20} />
        )}
        {spotifyLinked
          ? isReleased
            ? 'Save on Spotify'
            : 'Pre-Saved on Spotify'
          : isReleased
            ? 'Save on Spotify'
            : 'Pre-Save on Spotify'}
      </Button>
      {youtubeId && (
        <Button
          onClick={handleYouTube}
          disabled={status === 'loading'}
          className={cn(
            'flex w-full items-center justify-center gap-2 font-heading tracking-wider',
            'border border-primary/20 bg-background text-foreground hover:bg-[#FF0000] hover:text-white',
            youtubeLinked && 'border-[#FF0000]/40',
            isFeatured ? 'py-6 text-base' : 'py-6',
          )}
        >
          {status === 'loading' && activePlatform === 'youtube' ? (
            <Loader2 size={isFeatured ? 20 : 16} className="animate-spin" />
          ) : youtubeLinked ? (
            <Check size={isFeatured ? 22 : 20} />
          ) : (
            <Youtube size={isFeatured ? 22 : 20} />
          )}
          {youtubeLinked
            ? 'YouTube Linked'
            : isReleased
              ? 'Like on YouTube'
              : 'Pre-Save on YouTube'}
        </Button>
      )}
    </>
  )

  if (isFeatured) {
    return (
      <div className="w-full space-y-3">
        <div className="space-y-1 text-center md:text-left">
          <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
            {'// Pre-Save Protocol'}
          </p>
          <p className="font-body text-sm text-muted-foreground">
            Follow the artist and auto-save on release day.
          </p>
        </div>
        {(spotifyLinked || youtubeLinked) && (
          <div className="rounded border border-primary/25 bg-primary/10 px-3 py-2 font-mono text-[10px] tracking-wider text-muted-foreground">
            {spotifyLinked && (
              <p>Spotify: {isReleased ? 'linked' : 'pre-saved'}</p>
            )}
            {youtubeLinked && <p>YouTube: subscribed</p>}
          </div>
        )}
        <div className="flex flex-col gap-3">{buttonRow}</div>
      </div>
    )
  }

  return (
    <Card className="group bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-body text-xl font-bold tracking-widest uppercase">
          <Save size={24} className="text-primary" />
          {isReleased ? 'Library Sync' : 'Pre-Save Protocol'}
        </CardTitle>
        <CardDescription className="font-mono text-sm tracking-wider text-muted-foreground">
          {isReleased
            ? 'Save this release to your libraries.'
            : 'Follow the artist and auto-save on release day.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {(spotifyLinked || youtubeLinked) && (
          <div className="rounded border border-primary/20 bg-primary/5 px-3 py-2 font-mono text-[10px] tracking-wider text-muted-foreground">
            {spotifyLinked && (
              <p>Spotify: {isReleased ? 'linked' : 'pre-saved'}</p>
            )}
            {youtubeLinked && <p>YouTube: subscribed</p>}
          </div>
        )}
        <ButtonGroup orientation="vertical" className="w-full">
          {buttonRow}
        </ButtonGroup>
      </CardContent>
      <CardFooter className="flex items-center justify-center text-center text-[9px] tracking-widest text-muted-foreground uppercase">
        - Neural Link Secured -
      </CardFooter>
    </Card>
  )
}
