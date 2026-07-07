/**
 * Shared release-date helpers for player gating, presave UI, and cron fulfillment.
 */

export type SongReleaseFields = {
  releaseDate?: string | null
  premiereAt?: string | null
}

/**
 * Instant the song goes live. `premiereAt` wins when set; otherwise `releaseDate`
 * at UTC midnight (legacy date-only field behavior).
 */
export function resolveSongReleaseMs(
  releaseDate?: string | null,
  premiereAt?: string | null,
): number | null {
  if (premiereAt) {
    const ms = new Date(premiereAt).getTime()
    return Number.isNaN(ms) ? null : ms
  }
  if (releaseDate) {
    const ms = new Date(releaseDate).getTime()
    return Number.isNaN(ms) ? null : ms
  }
  return null
}

export function resolveSongReleaseInstant(
  fields: SongReleaseFields,
): Date | null {
  const ms = resolveSongReleaseMs(fields.releaseDate, fields.premiereAt)
  return ms === null ? null : new Date(ms)
}

export function isSongReleased(
  releaseDate?: string | null,
  premiereAtOrNow?: string | null | Date,
  now: Date = new Date(),
): boolean {
  let premiereAt: string | null | undefined
  let resolvedNow = now

  if (premiereAtOrNow instanceof Date) {
    premiereAt = undefined
    resolvedNow = premiereAtOrNow
  } else {
    premiereAt = premiereAtOrNow ?? undefined
  }

  const ms = resolveSongReleaseMs(releaseDate, premiereAt)
  if (ms === null) return false
  return ms <= resolvedNow.getTime()
}

export function isSongReleasedFields(
  fields: SongReleaseFields,
  now: Date = new Date(),
): boolean {
  return isSongReleased(fields.releaseDate, fields.premiereAt, now)
}

/**
 * A song is playable in the Global Player when it has been released.
 * Premiere videos use a static embed on the song page instead.
 */
export function isSongPlayable(
  releaseDate?: string | null,
  premiereAt?: string | null,
  now: Date = new Date(),
): boolean {
  return isSongReleased(releaseDate, premiereAt, now)
}

export function isSongPlayableFields(
  fields: SongReleaseFields,
  now: Date = new Date(),
): boolean {
  return isSongReleasedFields(fields, now)
}

export function formatPremiereDate(
  releaseDate?: string | null,
  premiereAt?: string | null,
  locale = 'en-US',
): string | null {
  if (premiereAt) {
    return new Date(premiereAt).toLocaleString(locale, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  }
  if (!releaseDate) return null
  return new Date(releaseDate).toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
