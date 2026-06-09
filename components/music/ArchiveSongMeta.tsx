import { cn } from '@/utilities/ui'
import type { Song } from '@/payload-types'
import formatTime from '@/utilities/formatTime'

interface ArchiveSongMetaProps {
  song: Song
  className?: string
  align?: 'left' | 'right'
}

export function ArchiveSongMeta({
  song,
  className,
  align = 'left',
}: ArchiveSongMetaProps) {
  const items: string[] = []

  if (typeof song.duration === 'number' && song.duration > 0) {
    items.push(formatTime(song.duration))
  }

  if (typeof song.bpm === 'number' && song.bpm > 0) {
    items.push(
      song.changesTempo && song.bpmEnd
        ? `${song.bpm}→${song.bpmEnd} BPM`
        : `${song.bpm} BPM`,
    )
  }

  if (song.isExplicit) {
    items.push('Explicit')
  }

  if (items.length === 0) return null

  return (
    <p
      className={cn(
        'mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      {items.map((item) => (
        <span
          key={item}
          className={cn(item === 'Explicit' && 'text-destructive/70')}
        >
          {item}
        </span>
      ))}
    </p>
  )
}
