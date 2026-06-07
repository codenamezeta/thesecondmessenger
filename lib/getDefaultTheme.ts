import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { DEFAULT_THEME, isThemeId, type ThemeId } from '@/lib/themes'
import { SITE_SETTINGS_TAG } from '@/globals/SiteSettings'

/**
 * Reads the site-wide featured/default theme from the `site-settings` global.
 *
 * Cached + tagged so the root layout stays static; the global's `afterChange`
 * hook calls `revalidateTag(SITE_SETTINGS_TAG)` so admin changes propagate
 * without a deploy. Falls back to {@link DEFAULT_THEME} if the global is unset
 * or unreadable.
 */
export const getDefaultTheme = unstable_cache(
  async (): Promise<ThemeId> => {
    try {
      const payload = await getPayload({ config: configPromise })
      const settings = await payload.findGlobal({ slug: 'site-settings' })
      const value = (settings as { defaultTheme?: unknown }).defaultTheme
      return isThemeId(value) ? value : DEFAULT_THEME
    } catch {
      return DEFAULT_THEME
    }
  },
  ['site-settings-default-theme'],
  { tags: [SITE_SETTINGS_TAG] },
)
