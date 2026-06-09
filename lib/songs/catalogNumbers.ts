import type { Payload, PayloadRequest } from 'payload'

/**
 * Context flag set on the internal `payload.update` calls this module
 * issues. The Songs collection's side-effecting `afterChange` hooks
 * (catalog recompute + audio-tag sync) early-return when they see it, so
 * re-ranking never recurses and never spams the audio-sync queue.
 */
export const CATALOG_UPDATE_CONTEXT = 'internalCatalogUpdate' as const

type SequencedSong = {
  id: number
  releaseDate?: string | null
  catalogSequence?: number | null
}

/**
 * Re-rank every song of a single composition type by release date
 * (oldest = 1) and persist the 1-based position into `catalogSequence`.
 *
 * Scoping the recompute to one composition type keeps the cascade bounded
 * (only that type's songs) while guaranteeing collision-free, contiguous
 * numbering even when a song is inserted, re-dated, or deleted out of
 * release order. Only rows whose value actually changes are written.
 */
export async function recomputeCatalogSequences(
  payload: Payload,
  compositionType: string | null | undefined,
  req?: PayloadRequest,
): Promise<void> {
  if (!compositionType) return

  const { docs } = await payload.find({
    collection: 'songs',
    where: { compositionType: { equals: compositionType } },
    depth: 0,
    limit: 0,
    pagination: false,
    req,
  })

  const songs = docs as SequencedSong[]
  songs.sort((a, b) => {
    const ad = a.releaseDate
      ? Date.parse(a.releaseDate)
      : Number.POSITIVE_INFINITY
    const bd = b.releaseDate
      ? Date.parse(b.releaseDate)
      : Number.POSITIVE_INFINITY
    if (ad !== bd) return ad - bd
    return a.id - b.id
  })

  for (let i = 0; i < songs.length; i++) {
    const sequence = i + 1
    if (songs[i].catalogSequence === sequence) continue
    await payload.update({
      collection: 'songs',
      id: songs[i].id,
      data: { catalogSequence: sequence },
      depth: 0,
      req,
      context: { [CATALOG_UPDATE_CONTEXT]: true },
    })
  }
}
