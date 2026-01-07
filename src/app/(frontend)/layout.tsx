import type { Metadata } from 'next'
import { cn } from '@/utilities/ui'
// import { GeistMono } from 'geist/font/mono'
// import { GeistSans } from 'geist/font/sans'
import React from 'react'

import { AdminBar } from '@/components/AdminBar'
import { Footer } from '@/Footer/Component'
import { Header } from '@/Header/Component'
import { Providers } from '@/providers'
import { InitTheme } from '@/providers/Theme/InitTheme'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { draftMode } from 'next/headers'

import { PlayerProvider } from '@/context/PlayerContext'
import { GlobalPlayer } from '@/components/GlobalPlayer'

import { Rajdhani, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { getServerSideURL } from '@/utilities/getURL'

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: [
    '300',
    // '400',
    '500',
    // '600',
    '700',
  ],
  variable: '--font-heading',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
})

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-mono',
})

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled } = await draftMode()

  return (
    <html
      className={cn(`${rajdhani.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`)}
      lang="en"
      data-scroll-behavior="smooth"
      data-theme="system"
      suppressHydrationWarning
    >
      <head>
        <InitTheme />
        <link href="/favicon.ico" rel="icon" sizes="32x32" />
        <link href="/favicon.svg" rel="icon" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <AdminBar
            adminBarProps={{
              preview: isEnabled,
            }}
          />

          <Header />

          {/* Wrap App in PlayerProvider */}
          <PlayerProvider>
            {children}

            {/* RENDER THE NEW PLAYER */}
            <GlobalPlayer />
          </PlayerProvider>

          <Footer />
        </Providers>
      </body>
    </html>
  )
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  openGraph: mergeOpenGraph(),
  twitter: {
    card: 'summary_large_image',
    creator: '@codenamezeta',
  },
}
