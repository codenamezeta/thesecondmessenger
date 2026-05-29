import React from 'react'
import { cn } from '@/utilities/ui'

export type EmbedBlockProps = {
  code: string
  blockType: 'embed'
}

type Props = {
  className?: string
} & EmbedBlockProps

export const EmbedBlock: React.FC<Props> = ({ className, code }) => {
  if (!code) return null

  return (
    <div
      className={cn(
        'col-start-2 mx-auto w-full my-8 overflow-hidden rounded-md flex justify-center not-prose',
        className
      )}
      dangerouslySetInnerHTML={{ __html: code }}
    />
  )
}
