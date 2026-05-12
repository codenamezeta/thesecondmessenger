'use client'

import dynamic from 'next/dynamic'

/**
 * Client-side, lazy-loaded wrapper around the persistent audio/video player.
 *
 * Why this exists:
 *   - The full GlobalPlayer pulls in `react-youtube`, multiple drawer UIs,
 *     and the YouTube IFrame API loader. Bundling that into the initial JS
 *     of every page makes Lighthouse TBT noticeably worse, especially on
 *     pages where the visitor never opens the player.
 *   - `next/dynamic` with `ssr: false` ships an empty placeholder during
 *     SSR + hydration, then fetches the real player chunk in the
 *     background. The player's first paint is invisible (it's a fixed
 *     bottom bar), so the lazy mount is unnoticeable.
 *
 * Required because the original `<GlobalPlayer />` is mounted in the
 * server-rendered root layout. `next/dynamic({ ssr: false })` is a
 * client-only API and must be called from a 'use client' module.
 */
const GlobalPlayerLazy = dynamic(
  () => import('./index').then((mod) => mod.GlobalPlayer),
  {
    ssr: false,
    loading: () => null,
  },
)

export const DynamicGlobalPlayer = () => <GlobalPlayerLazy />
