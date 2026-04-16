import { PlayerProvider } from '@/context/PlayerContext'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { Space_Grotesk, Fraunces, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Footer } from '@/components/Footer'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading-source',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-body-source',
  display: 'swap',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-source',
  display: 'swap',
})

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${fraunces.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col font-body antialiased">
        <Analytics />
        <SpeedInsights />
        <ThemeProvider>
          <YouTubeAuthProvider>
            <PlayerProvider>
              <Nav />
              {children}
              <Footer />
              <GlobalPlayer />
            </PlayerProvider>
          </YouTubeAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
