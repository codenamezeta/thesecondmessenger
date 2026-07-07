import type { IconType } from 'react-icons'
import {
  SiApplemusic,
  SiBandcamp,
  SiIheartradio,
  SiPandora,
  SiSoundcloud,
  SiSpotify,
  SiTidal,
  SiYoutube,
  SiYoutubemusic,
  SiDeezer,
} from 'react-icons/si'
import { FaAmazon } from "react-icons/fa";
import { Disc3, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

const PLATFORM_ICONS: Record<string, IconType> = {
  official: Globe,
  spotify: SiSpotify,
  apple: SiApplemusic,
  bandcamp: SiBandcamp,
  youtube: SiYoutube,
  youtubemusic: SiYoutubemusic,
  tidal: SiTidal,
  soundcloud: SiSoundcloud,
  pandora: SiPandora,
  iheart: SiIheartradio,
  amazon: FaAmazon,
  deezer: SiDeezer,
}

type PlatformIconProps = {
  platformId: string
  className?: string
  style?: React.CSSProperties
}

export function PlatformIcon({
  platformId,
  className,
  style,
}: PlatformIconProps) {
  const Icon = PLATFORM_ICONS[platformId] ?? Disc3

  return (
    <Icon
      aria-hidden
      className={cn('size-5 shrink-0', className)}
      style={style}
    />
  )
}
