'use client'

import type { PayloadAdminBarProps, PayloadMeUser } from '@payloadcms/admin-bar'
import { PayloadAdminBar } from '@payloadcms/admin-bar'
import { useSelectedLayoutSegments } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/utilities/ui'
import { getClientSideURL } from '@/utilities/getURL'

const collectionLabels = {
  songs: { plural: 'Songs', singular: 'Song' },
  releases: { plural: 'Releases', singular: 'Release' },
  projects: { plural: 'Playlists', singular: 'Playlist' },
  posts: { plural: 'Posts', singular: 'Post' },
}

const Title: React.FC = () => (
  <span className="font-bold text-white">Dashboard</span>
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
        'fixed top-0 z-40 h-[var(--admin-bar-height,36px)] w-full items-center border-b border-white/10 bg-background/85 text-white backdrop-blur-3xl',
        {
          flex: show,
          hidden: !show,
        },
      )}
    >
      <div className="container">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
          }}
          cmsURL={getClientSideURL()}
          collectionSlug={collection}
          collectionLabels={{
            plural: collectionLabels[collection]?.plural || 'Pages',
            singular: collectionLabels[collection]?.singular || 'Page',
          }}
          logo={<Title />}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
              router.push('/')
              router.refresh()
            })
          }}
          style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
          }}
        />
      </div>
    </div>
  )
}
