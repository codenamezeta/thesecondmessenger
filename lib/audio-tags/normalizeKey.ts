/**
 * Normalize a free-form musical key string to the ≤3-char form expected
 * by the TKEY ID3 frame and the INITIALKEY Vorbis comment.
 *
 * Examples:
 *   'A# minor'  → 'A#m'
 *   'A#m'       → 'A#m'
 *   'a#m'       → 'A#m'
 *   'Bb major'  → 'Bb'
 *   'C'         → 'C'
 *   'Cm'        → 'Cm'
 *   'F# Minor'  → 'F#m'
 *
 * Returns `null` if the input cannot be parsed as a key.
 */
export function normalizeKey(input: string | null | undefined): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (!trimmed) return null

  // Match optional note letter [A-G] + optional accidental (#/b)
  const noteMatch = trimmed.match(/^([A-Ga-g])([#b])?/)
  if (!noteMatch) return null

  const [, letter, accidental] = noteMatch
  const note = letter.toUpperCase() + (accidental ?? '')

  // Anything after the note that hints at minor → append 'm'
  const rest = trimmed.slice(noteMatch[0].length).toLowerCase()
  const isMinor = /\bm(in(or)?)?\b/.test(rest) || rest.startsWith('m')

  return isMinor ? `${note}m` : note
}
