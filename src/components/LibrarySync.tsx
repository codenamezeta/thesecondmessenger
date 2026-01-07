'use client'

import React, { useState, useEffect } from 'react'
import { Check, Loader2, Save, Youtube, Music } from 'lucide-react'
import { cn } from '@/utilities/ui'
import { getSpotifyAuthUrl, likeYouTubeVideo, subscribeToChannel } from '@/actions/library-sync'
import { useRouter, useSearchParams } from 'next/navigation'

interface LibrarySyncProps {
  songId: string
  youtubeId?: string
  spotifyId?: string
  isReleased: boolean
  userAccessToken?: string
  initialIsSaved?: boolean // <--- Receive the DB check
}

export const LibrarySync = ({
  songId,
  youtubeId,
  spotifyId,
  isReleased,
  userAccessToken,
  initialIsSaved = false,
}: LibrarySyncProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'connected'>(
    initialIsSaved ? 'connected' : 'idle',
  )
  const [activePlatform, setActivePlatform] = useState<'spotify' | 'youtube' | null>(null)

  useEffect(() => {
    // 1. CHECK FOR IMMEDIATE SUCCESS (Redirected from API)
    if (searchParams.get('success') === 'true' && searchParams.get('action') === 'spotify') {
      setStatus('success')
    }
  }, [searchParams])

  // --- SPOTIFY HANDLER ---
  const handleSpotify = async () => {
    setStatus('loading')
    setActivePlatform('spotify')
    const url = await getSpotifyAuthUrl(songId)
    if (url) router.push(url)
  }

  // --- YOUTUBE HANDLER ---
  const handleYouTube = async () => {
    if (!userAccessToken || !youtubeId) {
      alert('Please sign in to YouTube first via the Comments section!')
      return
    }

    setStatus('loading')
    setActivePlatform('youtube')

    let result
    if (isReleased) {
      result = await likeYouTubeVideo(youtubeId, userAccessToken)
    } else {
      result = await subscribeToChannel('UC_YOUR_CHANNEL_ID', userAccessToken)
    }

    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('idle')
      alert('Failed to connect to YouTube.')
    }
  }

  // --- RENDER: SUCCESS FLASH ---
  if (status === 'success') {
    return (
      <div className="w-full bg-green-500/10 border border-green-500/50 rounded-lg p-4 flex items-center justify-center gap-3 animate-in fade-in zoom-in duration-300">
        <div className="p-2 bg-green-500 rounded-full text-black">
          <Check size={20} strokeWidth={3} />
        </div>
        <div>
          <h4 className="font-heading font-bold text-green-500 uppercase tracking-widest text-sm">
            {activePlatform === 'youtube' ? 'Signal Verified' : 'Success!'}
          </h4>
          <p className="text-[10px] font-mono text-green-400/80 text-wrap max-w-40">
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
      <div className="bg-surface/5 border border-primary/30 rounded-lg p-6 relative overflow-hidden">
        <h4 className="text-white font-heading uppercase tracking-widest mb-2 flex items-center gap-2 text-xs">
          <Check size={16} className="text-primary" />
          Status: {isReleased ? 'Link Active' : 'Pre-Save Active'}
        </h4>

        <p className="text-xs text-muted mb-4">
          {isReleased
            ? 'Your secure link is established. Click below to add this specific frequency to your collection.'
            : 'Your connection is secure. This transmission will be captured automatically upon arrival.'}
        </p>

        <button
          onClick={handleSpotify}
          className="w-full py-2 px-4 rounded border border-white/10 hover:bg-white/5 text-white text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-2"
        >
          <Save size={14} className="text-primary" />
          {isReleased ? 'Save Song to Library' : 'Re-Confirm Pre-Save'}
        </button>
      </div>
    )
  }

  // --- RENDER: DEFAULT ---
  return (
    <div className="bg-surface/5 border border-white/10 rounded-lg p-6 relative overflow-hidden group space-y-3">
      <h4 className="text-white font-heading uppercase tracking-widest mb-2 flex items-center gap-2 text-xs">
        <Save size={16} className="text-primary" />
        {isReleased ? 'Library Sync' : 'Pre-Save Protocol'}
      </h4>

      {/* Spotify Button */}
      <button
        onClick={handleSpotify}
        disabled={status === 'loading'}
        className={cn(
          'w-full py-3 px-4 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all',
          'bg-[#1DB954aa] hover:bg-[#1ed760] text-black',
        )}
      >
        {status === 'loading' && activePlatform === 'spotify' ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Music size={16} />
        )}
        {isReleased ? 'Save on Spotify' : 'Pre-Save on Spotify'}
      </button>

      {/* YouTube Button */}
      {youtubeId && (
        <button
          onClick={handleYouTube}
          disabled={status === 'loading'}
          className={cn(
            'w-full py-3 px-4 rounded font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all',
            'bg-[#FF0000] hover:bg-red-600 text-white',
          )}
        >
          {status === 'loading' && activePlatform === 'youtube' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Youtube size={16} />
          )}
          {isReleased ? 'Like on YouTube' : 'Subscribe on YouTube'}
        </button>
      )}

      <p className="text-[9px] text-muted/50 text-center uppercase tracking-widest">
        - Neural Link Secured -
      </p>
    </div>
  )
}
