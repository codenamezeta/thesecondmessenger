'use client'

import { useState } from 'react'
import type { GatedContent } from '@/payload-types'
import AudioFilePlayer from '@/components/AudioFilePlayer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getGatedContentDownloadUrl } from '@/utilities/getGatedContentDownloadUrl'
import { getGatedContentFileUrl } from '@/utilities/getGatedContentFileUrl'
import { gatedContentKindFromMimeType } from '@/utilities/gatedContentKindFromMimeType'
import { DownloadIcon } from 'lucide-react'

function DownloadAssetButton({ href, title }: { href: string; title: string }) {
  return (
    <div className="my-4">
      <Button
        asChild
        variant="secondary"
        className="hover:bg-accent/10 hover:text-accent"
      >
        <a href={href} download>
          <DownloadIcon className="size-4" />
          Download: {title}
        </a>
      </Button>
    </div>
  )
}

function GatedAssetRenderer({ gated }: { gated: GatedContent }) {
  const src = getGatedContentFileUrl(gated)
  const downloadUrl = getGatedContentDownloadUrl(gated)
  if (!src) {
    return (
      <p className="font-body text-sm text-muted-foreground">
        Sorry, this asset is not available with your current clearance.
      </p>
    )
  }

  const kind = gatedContentKindFromMimeType(gated.mimeType)

  if (kind === null) {
    return (
      <div className="space-y-3">
        <p className="font-body text-sm text-muted-foreground">
          This file type is not previewed in the Vault UI.
        </p>
        <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
      </div>
    )
  }

  switch (kind) {
    case 'audio':
      return (
        <>
          <AudioFilePlayer title={gated.title} src={src} />
          <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
        </>
      )
    case 'download':
      return <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
    case 'video':
      return (
        <>
          <video
            controls
            className="mt-4 w-full border border-border/50"
            src={src}
            preload="metadata"
          />
          <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
        </>
      )
    case 'image':
      return (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Gated assets use protected/signed CMS URLs; keep direct <img> request path instead of Next optimizer indirection. */}
          <img
            src={src}
            alt={gated.title}
            className="mt-4 max-h-[min(70vh,720px)] w-auto border border-border/50 object-contain"
          />
          <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
        </>
      )
    case 'pdf':
      return <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
    case 'text':
      return <DownloadAssetButton href={downloadUrl || src} title={gated.title} />
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function kindLabelForAsset(gated: GatedContent): string {
  const kind = gatedContentKindFromMimeType(gated.mimeType)

  switch (kind) {
    case 'audio':
      return 'Audio'
    case 'video':
      return 'Video'
    case 'image':
      return 'Image'
    case 'pdf':
      return 'PDF'
    case 'text':
      return 'Text'
    case 'download':
      return 'Download'
    case null:
      return 'File'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

function previewHintForAsset(gated: GatedContent): string {
  const kind = gatedContentKindFromMimeType(gated.mimeType)

  switch (kind) {
    case 'audio':
      return 'Load to preview in the browser player and enable download.'
    case 'video':
      return 'Load to watch in-browser and enable download.'
    case 'image':
      return 'Load to view the full image and enable download.'
    case 'pdf':
      return 'Load to reveal the secure download link.'
    case 'text':
      return 'Load to reveal the secure download link.'
    case 'download':
      return 'Load to reveal the secure download link.'
    case null:
      return 'Load to reveal available actions for this file.'
    default: {
      const _exhaustive: never = kind
      return _exhaustive
    }
  }
}

export function UnlockableGatedAsset({ gated }: { gated: GatedContent }) {
  const [isLoaded, setIsLoaded] = useState(false)
  const kindLabel = kindLabelForAsset(gated)
  const previewHint = previewHintForAsset(gated)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-heading text-lg tracking-wide text-foreground">
            {gated.title}
          </h4>
          <Badge
            variant="outline"
            className="ml-auto rounded-none border-special font-mono text-[10px] tracking-widest text-special uppercase"
          >
            {kindLabel}
          </Badge>
        </div>
        {gated.description ? (
          <p className="font-body text-sm text-muted-foreground">
            {gated.description}
          </p>
        ) : null}
      </div>

      {!isLoaded ? (
        <div className="rounded-sm border border-dashed border-border/60 bg-background/40 p-4">
          <p className="font-body text-sm text-muted-foreground">
            You have clearance for this asset. {previewHint}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsLoaded(true)}
            className="mt-3 rounded-none font-mono text-[10px] tracking-widest uppercase"
          >
            Load asset
          </Button>
        </div>
      ) : (
        <GatedAssetRenderer gated={gated} />
      )}
    </div>
  )
}
