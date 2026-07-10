import type { YouTubePlayerRef } from '@/context/PlayerContext'

/** Default caption track when the user turns CC on in our custom player chrome. */
const DEFAULT_CAPTION_LANGUAGE = 'en'

/**
 * Show or hide YouTube closed captions on an IFrame API player instance.
 * Safe to call when the player is not ready — errors are swallowed.
 */
export function applyYouTubeCaptions(
  player: YouTubePlayerRef | null | undefined,
  enabled: boolean,
): void {
  if (!player) return

  try {
    if (enabled) {
      player.loadModule?.('captions')
      player.setOption?.('captions', 'track', {
        languageCode: DEFAULT_CAPTION_LANGUAGE,
      })
      return
    }

    player.unloadModule?.('captions')
  } catch {
    // YouTube may throw while the iframe is initializing.
  }
}
