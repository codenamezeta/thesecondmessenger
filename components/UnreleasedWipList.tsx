import Link from 'next/link'
import type { Song } from '@/payload-types'

export type UnreleasedWipSong = Pick<
  Song,
  'id' | 'title' | 'slug' | 'updatedAt'
>

function formatUpdatedAt(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

export function UnreleasedWipList({ songs }: { songs: UnreleasedWipSong[] }) {
  if (songs.length === 0) {
    return (
      <p className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
        No active works in progress in the archive.
      </p>
    )
  }

  return (
    <ul className="list-none divide-y divide-border/50 rounded-none border border-border/50 p-0">
      {songs.map((song) => {
        const href = song.slug ? `/music/${song.slug}` : null
        const inner = (
          <>
            <span className="font-heading text-base tracking-wide text-foreground md:text-lg">
              {song.title}
            </span>
            <span className="mt-1 block font-mono text-[10px] tracking-widest text-primary uppercase">
              Last updated: {formatUpdatedAt(song.updatedAt)}
            </span>
          </>
        )

        if (!href) {
          return (
            <li
              key={song.id}
              className="bg-card/5 px-4 py-4 opacity-70"
              aria-label={song.title}
            >
              {inner}
            </li>
          )
        }

        return (
          <li key={song.id}>
            <Link
              href={href}
              className="block px-4 py-4 transition-colors hover:bg-card/10 hover:text-primary focus-visible:ring-1 focus-visible:ring-primary focus-visible:outline-none"
            >
              {inner}
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
