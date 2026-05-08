import { PlayerProvider } from '@/context/PlayerContext'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Footer } from '@/components/Footer'
import { frontendFontVariableClassName } from './frontend-fonts'

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
              <GlobalPlayer />
            </PlayerProvider>
          </ThemeProvider>
        </YouTubeAuthProvider>
      </body>
    </html>
  )
}
