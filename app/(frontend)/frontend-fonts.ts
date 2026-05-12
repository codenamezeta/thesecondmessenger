import localFont from 'next/font/local'

/**
 * Self-hosted variable fonts (WOFF2), latin subset — same faces as the old
 * `next/font/google` setup, without a runtime request to fonts.googleapis.com.
 *
 * Files live under `public/fonts/<Family>/` so they are versioned with the
 * repo. The Google Fonts desktop ZIP ships `.ttf` only; for the web you want
 * `.woff2` (smaller). The checked-in files were pulled from the official
 * `fonts.gstatic.com` variable-font endpoints (latin unicode-range).
 *
 * To refresh or add subsets (e.g. latin-ext):
 *   1. Open the CSS preview for your family + axes on Google Fonts.
 *   2. Copy the `src: url(...woff2)` link for the subset you need.
 *   3. `curl -o public/fonts/...` that URL, add a second `src` entry or merge
 *      via a single family with multiple `localFont` `src` objects if needed.
 *
 * Folder layout (OFL + README from Google’s ZIP can stay alongside):
 *   public/fonts/Space_Grotesk/space-grotesk-latin.woff2
 *   public/fonts/Science_Gothic/science-gothic-latin.woff2
 *   public/fonts/JetBrains_Mono/jetbrains-mono-latin.woff2
 *   public/fonts/JetBrains_Mono/jetbrains-mono-latin-italic.woff2
 */
export const spaceGrotesk = localFont({
  src: '../../public/fonts/Space_Grotesk/space-grotesk-latin.woff2',
  variable: '--font-body-source',
  display: 'swap',
  weight: '300 700',
})

export const scienceGothic = localFont({
  src: '../../public/fonts/Science_Gothic/science-gothic-latin.woff2',
  variable: '--font-heading-source',
  display: 'swap',
  weight: '100 900',
})

export const jetBrainsMono = localFont({
  src: [
    {
      path: '../../public/fonts/JetBrains_Mono/jetbrains-mono-latin.woff2',
      weight: '100 800',
      style: 'normal',
    },
    {
      path: '../../public/fonts/JetBrains_Mono/jetbrains-mono-latin-italic.woff2',
      weight: '100 800',
      style: 'italic',
    },
  ],
  variable: '--font-mono-source',
  display: 'swap',
})

export const frontendFontVariableClassName = `${spaceGrotesk.variable} ${scienceGothic.variable} ${jetBrainsMono.variable}`
