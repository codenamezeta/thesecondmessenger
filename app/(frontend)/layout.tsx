import type { Metadata } from 'next'
import { PlayerProvider } from '@/context/PlayerContext'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'
import { DynamicGlobalPlayer } from '@/components/GlobalPlayer/DynamicGlobalPlayer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Footer } from '@/components/Footer'
import { frontendFontVariableClassName } from './frontend-fonts'

const siteUrl =
  (process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000').replace(
    /\/$/,
    '',
  )

/** Resolves relative Open Graph / Twitter image URLs across the app. */
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html
      lang="en"
      className={frontendFontVariableClassName}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-body antialiased">
        <Analytics />
        <SpeedInsights />
        <YouTubeAuthProvider>
          <ThemeProvider>
            <PlayerProvider>
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
