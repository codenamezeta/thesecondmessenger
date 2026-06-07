/**
 * Map a BPM to a classical Italian tempo marking — turns the raw number
 * into a word everyone feels, used as the 4th "stat" on `SongCard`.
 *
 * Ranges follow common practice (boundaries are approximate by tradition,
 * which is fine for a flavor stat). Returns `null` when BPM is unknown so
 * the caller can fall back to a placeholder.
 */
export type TempoMarking = {
  /** Short label shown in the stat cell (e.g. "Allegro"). */
  label: string
  /** Mnemonic for screen readers / tooltip (e.g. "fast, bright"). */
  feel: string
}

export function tempoMarkingForBpm(
  bpm: number | null | undefined,
): TempoMarking | null {
  if (typeof bpm !== 'number' || !Number.isFinite(bpm) || bpm <= 0) return null
  if (bpm < 60) return { label: 'Largo', feel: 'very slow, broad' }
  if (bpm < 76) return { label: 'Adagio', feel: 'slow, stately' }
  if (bpm < 108) return { label: 'Andante', feel: 'walking pace' }
  if (bpm < 120) return { label: 'Moderato', feel: 'moderate' }
  if (bpm < 156) return { label: 'Allegro', feel: 'fast, bright' }
  if (bpm < 176) return { label: 'Vivace', feel: 'lively, brisk' }
  if (bpm < 200) return { label: 'Presto', feel: 'very fast' }
  return { label: 'Prestissimo', feel: 'as fast as possible' }
}
