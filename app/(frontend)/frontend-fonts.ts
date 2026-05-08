import { JetBrains_Mono, Science_Gothic, Space_Grotesk } from 'next/font/google'

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  // variable: '--font-heading-source',
  variable: '--font-body-source',
  display: 'swap',
})

export const scienceGothic = Science_Gothic({
  subsets: ['latin'],
  // variable: '--font-body-source',
  variable: '--font-heading-source',
  display: 'swap',
})

export const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-source',
  display: 'swap',
})

export const frontendFontVariableClassName = `${spaceGrotesk.variable} ${scienceGothic.variable} ${jetBrainsMono.variable}`
