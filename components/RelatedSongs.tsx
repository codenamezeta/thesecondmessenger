import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Sparkles } from 'lucide-react'
import type { Song } from '@/payload-types'
import { SongCard } from './SongCard'
import { pickRelatedSongs } from '@/lib/music/relatedSongs'

interface RelatedSongsProps {
  song: Song
  /** Max related songs to show. Default 4. */
  limit?: number
  /**
   * Max candidates to fetch from Payload before scoring. Higher = better
   * matches at the cost of one larger DB query. Default 60 — enough to
   * cover a healthy catalog without ballooning the page payload.
   */
  candidatePoolSize?: number
}

/**
 * Server component that ranks the catalog by weighted tag-overlap with
 * `song` and renders the top matches as a `SongCard` grid.
 *
 * Scoring weights live in `lib/music/relatedSongs.ts`. Sub-genre and
 * activity matches dominate (the highest-fidelity "what kind of song
 * is this" signals); broad genre matches are weighted lowest because
 * nearly every song shares a genre.
 */
export const RelatedSongs = async ({
  song,
  limit = 6,
  candidatePoolSize = 60,
}: RelatedSongsProps) => {
  const payload = await getPayload({ config: configPromise })
  const candidates = await payload.find({
    collection: 'songs',
    where: {
      and: [
        { id: { not_equals: song.id } },
        { releaseDate: { exists: true } },
        { releaseDate: { not_equals: null } },
      ],
    },
    sort: '-releaseDate',
    limit: candidatePoolSize,
    depth: 1,
  })

  const related = pickRelatedSongs(song, candidates.docs, limit)
  if (related.length === 0) return null

  return (
    <section className="mt-12 space-y-6 border-t border-border/40 pt-8">
      <header className="flex items-center gap-3">
        <Sparkles className="size-4 text-primary" aria-hidden />
        <h2 className="font-heading text-2xl tracking-wider uppercase">
          Convergent Signals
        </h2>
      </header>
      <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
        {`If you liked ${song.title}, you'll probably also like these songs.`}
      </p>
      <ol className="my-0 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {related.map((s) => (
          <li key={s.id} className="h-full">
            <SongCard song={s} />
          </li>
        ))}
      </ol>
    </section>
  )
}
