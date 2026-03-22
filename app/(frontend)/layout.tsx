import { PlayerProvider } from '@/context/PlayerContext'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Nav } from '@/components/Nav'
import { Space_Grotesk, Fraunces, JetBrains_Mono } from 'next/font/google'
import './globals.css'

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
      <body className="font-body antialiased">
        <ThemeProvider>
          <Nav />
          <YouTubeAuthProvider>
            <PlayerProvider>
              {children}
              <GlobalPlayer />
            </PlayerProvider>
          </YouTubeAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
