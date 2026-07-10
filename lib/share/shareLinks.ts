import { PRIMARY_ARTIST } from '@/lib/branding'
import type { ReactNode } from 'react'

export type SharePlatform =
  | 'x'
  | 'reddit'
  | 'whatsapp'
  | 'telegram'
  | 'sms'
  | 'email'
  | 'bluesky'
  | 'facebook'

export type ShareLinkTier = 'primary' | 'secondary'

export type ShareLink = {
  id: SharePlatform
  name: string
  href: string
  color: string
  tier: ShareLinkTier
}

type ShareCopy = {
  displayTitle: string
  redditTitle: string
  socialText: string
  sciFiText: string
}

function buildShareCopy(title?: string): ShareCopy {
  const displayTitle = title?.trim() || PRIMARY_ARTIST

  return {
    displayTitle,
    redditTitle: `${PRIMARY_ARTIST} — ${displayTitle}`,
    socialText: `Check out "${displayTitle}" by ${PRIMARY_ARTIST}`,
    sciFiText: `Receiving transmission: ${displayTitle}`,
  }
}

export function appendShareUtm(baseUrl: string, medium: SharePlatform): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('utm_source', 'share')
    url.searchParams.set('utm_medium', medium)
    url.searchParams.set('utm_campaign', 'song-page')
    return url.toString()
  } catch {
    return baseUrl
  }
}

export function buildShareLinks(baseUrl: string, title?: string): ShareLink[] {
  const copy = buildShareCopy(title)

  const withUtm = (medium: SharePlatform) =>
    encodeURIComponent(appendShareUtm(baseUrl, medium))

  const encodedRedditTitle = encodeURIComponent(copy.redditTitle)
  const encodedSocialText = encodeURIComponent(copy.socialText)
  const encodedSciFiText = encodeURIComponent(copy.sciFiText)
  const encodedEmailTitle = encodeURIComponent(copy.displayTitle)
  const encodedEmailBody = encodeURIComponent(
    `Hey! I think you'll love this song by ${PRIMARY_ARTIST}!\n\n`,
  )

  // Primary: public broadcast + high-intent personal. Secondary: more reach + trusted 1:1.
  return [
    {
      id: 'reddit',
      name: 'Reddit',
      href: `https://www.reddit.com/submit?url=${withUtm('reddit')}&title=${encodedRedditTitle}`,
      color: 'hover:text-orange-500 hover:border-orange-500/50',
      tier: 'primary',
    },
    {
      id: 'x',
      name: 'X',
      href: `https://x.com/intent/tweet?text=${encodedSocialText}&url=${withUtm('x')}`,
      color: 'hover:text-foreground hover:border-foreground/50',
      tier: 'primary',
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      href: `https://wa.me/?text=${encodedSocialText}%20${withUtm('whatsapp')}`,
      color: 'hover:text-green-500 hover:border-green-500/50',
      tier: 'primary',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${withUtm('facebook')}`,
      color: 'hover:text-blue-500 hover:border-blue-500/50',
      tier: 'secondary',
    },
    {
      id: 'sms',
      name: 'SMS',
      href: `sms:?body=${encodedSocialText}%20${withUtm('sms')}`,
      color: 'hover:text-primary hover:border-primary/50',
      tier: 'secondary',
    },
    {
      id: 'telegram',
      name: 'Telegram',
      href: `https://t.me/share/url?url=${withUtm('telegram')}&text=${encodedSocialText}`,
      color: 'hover:text-sky-400 hover:border-sky-400/50',
      tier: 'secondary',
    },
    {
      id: 'email',
      name: 'Email',
      href: `mailto:?subject=${encodedEmailTitle}&body=${encodedEmailBody}${withUtm('email')}`,
      color: 'hover:text-primary hover:border-primary/50',
      tier: 'secondary',
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      href: `https://bsky.app/intent/compose?text=${encodedSciFiText}%20${withUtm('bluesky')}`,
      color: 'hover:text-sky-500 hover:border-sky-500/50',
      tier: 'secondary',
    },
  ]
}

export type ShareLinkIconMap = Record<SharePlatform, ReactNode>
