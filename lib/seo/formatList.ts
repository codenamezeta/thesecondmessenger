/**
 * Grammatical list formatter with Oxford-comma support.
 *
 * Examples:
 *   formatList(['Rock'])                       // 'Rock'
 *   formatList(['Rock', 'Pop'])                // 'Rock and Pop'
 *   formatList(['Dark', 'Sad', 'Cinematic'])   // 'Dark, Sad, and Cinematic'
 *   formatList([], { fallback: 'Music' })       // 'Music'
 *
 * Used by the song meta description and any other place we surface tag
 * arrays in natural-language copy. Centralized here so the JSON-LD
 * generator and the meta-description builder agree on tone.
 */

export type FormatListType = 'conjunction' | 'disjunction' | 'unit'

export type FormatListOptions = {
  /** Returned when items is empty. Defaults to ''. */
  fallback?: string
  /**
   * 'conjunction' uses "A, B, and C" (default — joins).
   * 'disjunction' uses "A, B, or C".
   * 'unit' uses no conjunction (raw comma list).
   */
  type?: FormatListType
}

const formatterCache = new Map<FormatListType, Intl.ListFormat>()

function getFormatter(type: FormatListType): Intl.ListFormat {
  let f = formatterCache.get(type)
  if (!f) {
    f = new Intl.ListFormat('en', { style: 'long', type })
    formatterCache.set(type, f)
  }
  return f
}

export function formatList(
  items: ReadonlyArray<string | null | undefined>,
  options: FormatListOptions = {},
): string {
  const cleaned = items.filter(
    (item): item is string => typeof item === 'string' && item.trim().length > 0,
  )
  if (cleaned.length === 0) return options.fallback ?? ''
  return getFormatter(options.type ?? 'conjunction').format(cleaned)
}
