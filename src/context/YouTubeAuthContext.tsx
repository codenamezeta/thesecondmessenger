'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import Script from 'next/script'

interface YouTubeUser {
  displayName: string
  profileImageUrl: string
  accessToken: string
}

interface YouTubeAuthContextType {
  user: YouTubeUser | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

const YouTubeAuthContext = createContext<YouTubeAuthContextType | undefined>(undefined)

export const YouTubeAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<YouTubeUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [tokenClient, setTokenClient] = useState<any>(null)

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

  const fetchProfile = useCallback(
    async (accessToken: string) => {
      if (!API_KEY) return

      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${API_KEY}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
        )

        if (!res.ok) {
          // If token is invalid/expired
          if (res.status === 401 || res.status === 403) {
            throw new Error('Token invalid')
          }
          return
        }

        const data = await res.json()
        if (data.items?.[0]) {
          const snippet = data.items[0].snippet
          setUser({
            displayName: snippet.title,
            profileImageUrl: snippet.thumbnails?.default?.url,
            accessToken,
          })
          localStorage.setItem('yt_access_token', accessToken)
        }
      } catch (e) {
        console.error('Failed to fetch user profile', e)
        localStorage.removeItem('yt_access_token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    },
    [API_KEY],
  )

  // Initialize: Check Local Storage
  useEffect(() => {
    const token = localStorage.getItem('yt_access_token')
    if (token) {
      fetchProfile(token)
    } else {
      setIsLoading(false)
    }
  }, [fetchProfile])

  // Initialize: Google Identity Services
  const handleGsiLoad = useCallback(() => {
    if (!CLIENT_ID || typeof window === 'undefined' || !(window as any).google) return

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          fetchProfile(tokenResponse.access_token)
        }
      },
    })
    setTokenClient(client)
  }, [CLIENT_ID, fetchProfile])

  // Ensure Script is loaded or check if already present
  useEffect(() => {
    if ((window as any).google && !tokenClient) {
      handleGsiLoad()
    }
  }, [tokenClient, handleGsiLoad])

  const login = useCallback(() => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    } else {
      console.warn('Google Sign-In not initialized')
      // Try initializing again just in case
      if ((window as any).google) handleGsiLoad()
      else alert('Google Sign-In is initializing... please try again in a moment.')
    }
  }, [tokenClient, handleGsiLoad])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('yt_access_token')
    if ((window as any).google) {
      ;(window as any).google.accounts.oauth2.revoke(user?.accessToken, () => {
        console.log('Revoked')
      })
    }
  }, [user?.accessToken])

  return (
    <YouTubeAuthContext.Provider value={{ user, isLoading, login, logout }}>
      <Script src="https://accounts.google.com/gsi/client" onLoad={handleGsiLoad} />
      {children}
    </YouTubeAuthContext.Provider>
  )
}

export const useYouTubeAuth = () => {
  const context = useContext(YouTubeAuthContext)
  if (context === undefined) {
    throw new Error('useYouTubeAuth must be used within a YouTubeAuthProvider')
  }
  return context
}
