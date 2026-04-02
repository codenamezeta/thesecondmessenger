import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'

import type { MediaBlock as MediaBlockProps } from '@/payload-types'

import { Media } from '@/components/Media'

type Props = MediaBlockProps & {
  breakout?: boolean
  className?: string
  imgClassName?: string
  staticImage?: StaticImageData
}

export const MediaBlock: React.FC<Props> = (props) => {
  const {
    className,
    imgClassName,
    media,
    staticImage,
  } = props

  return (
    <div className={cn('', className)}>
      {(media || staticImage) && (
        <Media
          imgClassName={cn(
            'rounded-[0.8rem] border border-border',
            imgClassName,
          )}
          resource={media}
          src={staticImage}
        />
      )}
    </div>
  )
}
