'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useSelectedLayoutSegments } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { getClientSideURL } from '@/utilities/getURL'

// We don't need the SCSS import anymore if we use Tailwind
// import './index.scss'

const collectionLabels = {
  pages: { plural: 'Pages', singular: 'Page' },
  posts: { plural: 'Posts', singular: 'Post' },
  projects: { plural: 'Playlists', singular: 'Playlist' },
  releases: { plural: 'Releases', singular: 'Release' },
  songs: { plural: 'Songs', singular: 'Song' }, // Added your new collections
}

const Title: React.FC = () => (
  <span className="font-bold text-foreground">Dashboard</span>
)

export const AdminBar: React.FC<{
  adminBarProps?: PayloadAdminBarProps
}> = (props) => {
  const { adminBarProps } = props || {}
  const segments = useSelectedLayoutSegments()
  const [show, setShow] = useState(false)

  // Determine which collection we are viewing for the "Edit" button
  const collection = (
    collectionLabels[segments?.[1] as keyof typeof collectionLabels]
      ? segments[1]
      : 'posts'
  ) as keyof typeof collectionLabels

  const router = useRouter()

  const onAuthChange = React.useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id))
  }, [])

  // --- THE LOGIC TO PUSH THE NAV DOWN ---
  useEffect(() => {
    if (show) {
      // 1. Set the variable so Nav moves down
      document.documentElement.style.setProperty('--admin-bar-height', '36px')
    } else {
      // 2. Cleanup if logged out
      document.documentElement.style.removeProperty('--admin-bar-height')
    }
  }, [show])

  return (
    <div
      className={cn(
        'h-(--admin-bar-height,36px) w-full items-center border-b border-white/10 bg-background/85 text-foreground backdrop-blur-3xl',
        {
          flex: show,
          hidden: !show,
        },
      )}
    >
      <PayloadAdminBar
        {...adminBarProps}
        className="container text-foreground"
        classNames={{
          controls: 'font-medium text-foreground',
          logo: 'text-foreground',
          user: 'text-foreground',
        }}
        cmsURL={getClientSideURL()}
        collectionSlug={collection}
        collectionLabels={{
          plural: collectionLabels[collection]?.plural || 'Pages',
          singular: collectionLabels[collection]?.singular || 'Page',
        }}
        logo={<Title />}
        onAuthChange={onAuthChange}
        style={{
          backgroundColor: 'transparent',
          padding: 0,
          position: 'relative',
          zIndex: 'unset',
        }}
      />
    </div>
  )
}
