import { sendGAEvent } from '@next/third-parties/google'

/**
 * Content-focused GA4 events (disclosure-only; no consent gate).
 *
 * Register these as event-scoped custom dimensions in GA4 Admin → Custom definitions:
 *   song_slug, song_title, content_type, platform, percent, location, link_url
 *
 * Mark as key events: select_content, listen_progress
 */

const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()

function canTrack(): boolean {
  return Boolean(gaMeasurementId) && typeof window !== 'undefined'
}

export type ListenPercent = 25 | 50 | 75 | 100

export const LISTEN_PROGRESS_MILESTONES: readonly ListenPercent[] = [
  25, 50, 75, 100,
]

type SongPlayParams = {
  song_id?: string
  song_slug?: string
  song_title?: string
}

type ListenProgressParams = {
  song_slug?: string
  percent: ListenPercent
}

type OutboundStreamParams = {
  platform: string
  link_url: string
  song_slug?: string
}

type JoinCrewClickParams = {
  location: string
}

export function trackSongPlay(params: SongPlayParams): void {
  if (!canTrack()) return
  sendGAEvent('event', 'select_content', {
    content_type: 'song',
    content_id: params.song_id,
    song_slug: params.song_slug,
    song_title: params.song_title,
  })
}

export function trackListenProgress(params: ListenProgressParams): void {
  if (!canTrack()) return
  sendGAEvent('event', 'listen_progress', {
    song_slug: params.song_slug,
    percent: params.percent,
  })
}

export function trackOutboundStream(params: OutboundStreamParams): void {
  if (!canTrack()) return
  sendGAEvent('event', 'select_content', {
    content_type: 'streaming_link',
    platform: params.platform,
    song_slug: params.song_slug,
    link_url: params.link_url,
    outbound: true,
  })
}

export function trackJoinCrewClick(params: JoinCrewClickParams): void {
  if (!canTrack()) return
  sendGAEvent('event', 'select_content', {
    content_type: 'join_crew_cta',
    location: params.location,
  })
}
