import type { Metadata } from 'next'
import { PlayerProvider } from '@/context/PlayerContext'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'
import { DynamicGlobalPlayer } from '@/components/GlobalPlayer/DynamicGlobalPlayer'
import { CollapseTheaterOnRouteChange } from '@/components/GlobalPlayer/CollapseTheaterOnRouteChange'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Footer } from '@/components/Footer'
import { frontendFontVariableClassName } from './frontend-fonts'
import { getDefaultTheme } from '@/lib/getDefaultTheme'
import { DARK_THEME_IDS, THEME_IDS, type ThemeId } from '@/lib/themes'

/**
 * Blocking init script: applies the user's saved theme (or the site default)
 * to <html> before first paint to avoid a flash of the wrong theme.
 */
function themeInitScript(siteDefault: ThemeId) {
  return `(function(){try{var d=${JSON.stringify(siteDefault)};var ids=${JSON.stringify(
    THEME_IDS,
  )};var dark=${JSON.stringify(
    DARK_THEME_IDS,
  )};var s=localStorage.getItem('theme');var t=ids.indexOf(s)>-1?s:d;var e=document.documentElement;e.setAttribute('data-theme',t);var isDark=dark.indexOf(t)>-1;e.classList.toggle('dark',isDark);e.style.colorScheme=isDark?'dark':'light';}catch(e){}})()`
}

const siteUrl = (
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
).replace(/\/$/, '')

/** Resolves relative Open Graph / Twitter image URLs across the app. */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  icons: {
    icon: [
      { url: '/imgs/favicons/favicon.ico' },
      {
        url: '/imgs/favicons/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/imgs/favicons/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: '/imgs/favicons/apple-touch-icon.png',
  },
  manifest: '/imgs/favicons/site.webmanifest',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  const siteDefault = await getDefaultTheme()
  return (
    <html
      lang="en"
      className={frontendFontVariableClassName}
      data-theme={siteDefault}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-body antialiased">
        <script
          dangerouslySetInnerHTML={{ __html: themeInitScript(siteDefault) }}
        />
        <Analytics />
        <SpeedInsights />
        <YouTubeAuthProvider>
          <ThemeProvider siteDefault={siteDefault}>
            <PlayerProvider>
              <CollapseTheaterOnRouteChange />
              <Nav />
              {children}
              <Footer />
              <DynamicGlobalPlayer />
            </PlayerProvider>
          </ThemeProvider>
        </YouTubeAuthProvider>
      </body>
    </html>
  )
}
