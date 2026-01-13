import React from 'react'

import { HeaderThemeProvider } from './HeaderTheme'
import { ThemeProvider } from './Theme'
import { YouTubeAuthProvider } from '@/context/YouTubeAuthContext'

export const Providers: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <ThemeProvider>
      <HeaderThemeProvider>
        <YouTubeAuthProvider>{children}</YouTubeAuthProvider>
      </HeaderThemeProvider>
    </ThemeProvider>
  )
}
