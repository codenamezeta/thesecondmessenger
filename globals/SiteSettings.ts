import type { GlobalConfig } from 'payload'

import { after } from 'next/server'
import { revalidateTag } from 'next/cache'

import { anyone } from '@/access/anyone'
import { DEFAULT_THEME, THEME_SELECT_OPTIONS } from '@/lib/themes'

/** Cache tag for the cached `getDefaultTheme()` reader (see lib/getDefaultTheme.ts). */
export const SITE_SETTINGS_TAG = 'site-settings'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: anyone,
    update: ({ req: { user } }) => user?.role === 'admin',
  },
  admin: {
    description:
      'Site-wide presentation settings, including the featured theme that rotates with releases.',
  },
  hooks: {
    afterChange: [
      ({ req: { payload, context } }) => {
        if (context.disableRevalidate) return
        const invalidate = () => {
          try {
            // @ts-expect-error Next.js 16 types incorrectly require a second argument
            revalidateTag(SITE_SETTINGS_TAG)
          } catch (error) {
            payload.logger.error({
              msg: 'Error revalidating site settings',
              error,
            })
          }
        }
        try {
          after(invalidate)
        } catch {
          // `payload run` and other non-Next contexts have no request scope.
          invalidate()
        }
      },
    ],
  },
  fields: [
    {
      name: 'defaultTheme',
      type: 'select',
      defaultValue: DEFAULT_THEME,
      required: true,
      options: THEME_SELECT_OPTIONS,
      admin: {
        description:
          'Default color theme for visitors who have not picked their own. Flip this on release day to refresh the whole site — anyone "following the featured theme" updates automatically.',
      },
    },
  ],
}
