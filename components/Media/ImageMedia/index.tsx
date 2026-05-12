'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps, MediaDisplaySize } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

const breakpoints = {
  '3xl': 1920,
  '2xl': 1536,
  xl: 1280,
  lg: 1024,
  md: 768,
  sm: 640,
}

/**
 * Tiny shape of a single derivative entry on a Payload Media doc. Payload
 * generates this at upload time when `imageSizes` is configured. We narrow
 * here rather than relying on the generated type so the component stays
 * resilient when `payload generate:types` hasn't been re-run yet.
 */
type MediaSizeEntry = {
  url?: string | null
  width?: number | null
  height?: number | null
  filename?: string | null
}

type ResourceWithSizes = {
  url?: string | null
  width?: number | null
  height?: number | null
  alt?: string | null
  updatedAt?: string | null
  sizes?: Partial<Record<MediaDisplaySize, MediaSizeEntry | null>> | null
}

const placeholderBlur =
  'data:image/png;base64,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'

/**
 * Pick the right URL + intrinsic dimensions for the requested derivative
 * size. Falls back to the master file when:
 *   1. No `displaySize` was passed, or
 *   2. The requested derivative is missing on this resource (typical for
 *      uploads that pre-date the `imageSizes` config — run the backfill at
 *      `/api/admin/regenerate-media-sizes`).
 */
const pickSource = (
  resource: ResourceWithSizes,
  displaySize: MediaDisplaySize | undefined,
): { url: string; width?: number; height?: number } => {
  if (displaySize) {
    const entry = resource.sizes?.[displaySize]
    if (entry?.url) {
      return {
        url: entry.url,
        width: entry.width ?? undefined,
        height: entry.height ?? undefined,
      }
    }
  }
  return {
    url: resource.url ?? '',
    width: resource.width ?? undefined,
    height: resource.height ?? undefined,
  }
}

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    displaySize,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''

  if (!src && resource && typeof resource === 'object') {
    const typedResource = resource as ResourceWithSizes
    const picked = pickSource(typedResource, displaySize)

    width = picked.width
    height = picked.height
    alt = typedResource.alt ?? ''

    const cacheTag = typedResource.updatedAt ?? undefined

    if (picked.url.startsWith('/')) {
      src = cacheTag ? `${picked.url}?${cacheTag}` : picked.url
    } else {
      src = getMediaUrl(picked.url, cacheTag)
    }
  }

  // Strip the dev-server origin and any query string from string sources so
  // next/image's optimizer accepts them. (Originally added to work around
  // "Private IP" / "localPatterns" errors when serving Vercel Blob URLs that
  // had been re-prefixed with NEXT_PUBLIC_SERVER_URL.)
  if (typeof src === 'string') {
    const serverUrl =
      process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    if (src.startsWith(serverUrl)) {
      src = src.replace(serverUrl, '')
    }

    if (src.includes('?')) {
      src = src.split('?')[0]
    }
  }

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  const sizes = sizeFromProps
    ? sizeFromProps
    : Object.entries(breakpoints)
        .map(([, value]) => `(max-width: ${value}px) ${value * 2}w`)
        .join(', ')

  return (
    <picture className={cn(pictureClassName)}>
      <NextImage
        alt={alt || ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder="blur"
        blurDataURL={placeholderBlur}
        priority={priority}
        // Lowered from 100. Payload generates derivatives at q78–82 already;
        // anything above ~80 here is paying bytes for sub-perceptual gain.
        quality={80}
        loading={loading}
        sizes={sizes}
        src={src}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
