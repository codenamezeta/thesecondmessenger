import { createHash } from 'crypto'
import type { TagSpec } from './types'

/**
 * Stable hash of a TagSpec, used as a "have we already synced this?" check.
 * Cover art bytes are excluded from the hash for performance — we hash the
 * cover MIME type and length instead, which is sufficient because the source
 * of truth (the CMS coverArt media) is referenced by ID elsewhere.
 *
 * Returns the first 16 hex chars of a SHA-256 digest. Plenty of collision
 * resistance for our scale, and short enough to store as a small text field.
 */
export function hashTagSpec(spec: TagSpec, extra?: string): string {
  const cleaned: Record<string, unknown> = { ...spec }
  if (spec.coverArt) {
    cleaned.coverArt = {
      mimeType: spec.coverArt.mimeType,
      length: spec.coverArt.data.length,
    }
  }
  // `extra` lets callers bust the cache when something outside the TagSpec
  // changes — e.g. a new FLAC master is attached that must also be tagged.
  if (extra) cleaned.__extra = extra
  const json = JSON.stringify(cleaned, Object.keys(cleaned).sort())
  return createHash('sha256').update(json).digest('hex').slice(0, 16)
}
