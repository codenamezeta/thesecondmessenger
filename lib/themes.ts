/**
 * Theme registry — single source of truth for the site's color themes.
 *
 * Each theme is a complete palette defined as a `[data-theme="<id>"]` block in
 * `app/(frontend)/globals.css` (except `dark`, which lives in `:root` as the
 * default). The `mode` flag drives the `.dark` class + `color-scheme` so the
 * handful of shadcn `dark:` utilities keep working without per-component edits.
 *
 * This registry feeds: the footer selector UI, the FOUC init script, the
 * Payload `users.themePreference` field options, and the `site-settings`
 * global's `defaultTheme` options. Add a theme here + a matching CSS block and
 * it propagates everywhere.
 */

export type ThemeMode = 'light' | 'dark'

export type ThemeDef = {
  /** Stable id used in `data-theme`, localStorage, and Payload options. */
  id: string
  /** Human label shown in the selector. */
  label: string
  /** Short flavor line for the selector. */
  blurb: string
  /** Drives the `.dark` class + `color-scheme`. */
  mode: ThemeMode
  /** A representative color (the theme's primary) for the selector swatch. */
  swatch: string
}

export const THEMES = [
  {
    id: 'dark',
    label: 'Deep Space',
    blurb: 'The signature near-black terminal.',
    mode: 'dark',
    swatch: 'oklch(0.77 0.13 170)',
  },
  {
    id: 'light',
    label: 'Daybreak',
    blurb: 'Clean light mode for bright rooms.',
    mode: 'light',
    swatch: 'oklch(0.511 0.096 186.391)',
  },
  {
    id: 'interstellar',
    label: 'Interstellar',
    blurb: 'Deep blue void, lime signal.',
    mode: 'dark',
    swatch: 'oklch(0.87 0.21 128)',
  },
  {
    id: 'kelly_come_home',
    label: 'Kelly Come Home',
    blurb: 'Warm paper and burnt sienna.',
    mode: 'light',
    swatch: 'oklch(0.45 0.11 38)',
  },
  {
    id: 'nebula',
    label: 'Nebula',
    blurb: 'Violet haze with a cyan edge.',
    mode: 'dark',
    swatch: 'oklch(0.72 0.18 320)',
  },
  {
    id: 'distress',
    label: 'Distress Signal',
    blurb: 'Amber alert against the dark.',
    mode: 'dark',
    swatch: 'oklch(0.78 0.16 70)',
  },
] as const satisfies readonly ThemeDef[]

export type ThemeId = (typeof THEMES)[number]['id']

/** Ultimate fallback when nothing else resolves. */
export const DEFAULT_THEME: ThemeId = 'dark'

export const THEME_IDS = THEMES.map((t) => t.id) as ThemeId[]

/** Ids of themes whose `mode` is `dark` — used by the inline FOUC script. */
export const DARK_THEME_IDS = THEMES.filter((t) => t.mode === 'dark').map(
  (t) => t.id,
) as ThemeId[]

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as string[]).includes(value)
}

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function getThemeMode(id: ThemeId): ThemeMode {
  return getTheme(id).mode
}

/** `{ label, value }[]` shaped for Payload `select` field options. */
export const THEME_SELECT_OPTIONS = THEMES.map((t) => ({
  label: t.label,
  value: t.id,
}))

/** localStorage key holding the user's explicit theme choice (if any). */
export const THEME_STORAGE_KEY = 'theme'
