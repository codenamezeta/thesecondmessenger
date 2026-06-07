import type { Song } from '@/payload-types'

/**
 * Trading-card rarity model for `SongCard`.
 *
 * Hybrid scheme (see chat design spec):
 *   - Intrinsic song traits set a FLOOR finish:
 *       · linked Vault / gated content → `secret`
 *       · interactive stems            → `holo` (Deluxe finish)
 *       · Live / Demo / non-Original   → `uncommon` (Alternate Art)
 *   - The curated `popularity` score (0–1000) raises rarity along the
 *     Common → Uncommon → Rare → Holo spectrum.
 *   - Final tier = the strongest of the two.
 *
 * A `variant` rides alongside the tier purely to flavor the rarity GEM
 * (color/shape) — there are no text labels on the card, per the design
 * decision, so the variant only ever drives visuals.
 *
 * Pure / deterministic — safe to call during SSR for every card.
 */

export type RarityTier = 'common' | 'uncommon' | 'rare' | 'holo' | 'secret'

/** What made the card special — drives the gem's color/shape only. */
export type RarityVariant = 'standard' | 'alt' | 'deluxe' | 'vault'

export type CardRarity = {
  tier: RarityTier
  variant: RarityVariant
  /** 0-based rank of `tier` in `RARITY_ORDER`. Handy for comparisons/finishes. */
  level: number
  /** True for tiers that get the pointer-reactive holographic foil. */
  isFoil: boolean
}

export const RARITY_ORDER: readonly RarityTier[] = [
  'common',
  'uncommon',
  'rare',
  'holo',
  'secret',
]

function rank(tier: RarityTier): number {
  return RARITY_ORDER.indexOf(tier)
}

function maxTier(a: RarityTier, b: RarityTier): RarityTier {
  return rank(a) >= rank(b) ? a : b
}

/** Map the curated popularity score onto the base rarity spectrum. */
function popularityTier(popularity: number | null | undefined): RarityTier {
  const p = typeof popularity === 'number' ? popularity : 0
  if (p >= 850) return 'holo'
  if (p >= 600) return 'rare'
  if (p >= 350) return 'uncommon'
  return 'common'
}

function hasStems(song: Song): boolean {
  return Array.isArray(song.stems) && song.stems.length > 0
}

/**
 * Whether the song has at least one linked Vault / gated-content file.
 * `linkedGatedContent` is a Payload `join`, populated by default in find
 * queries; we read defensively in case a caller disabled joins.
 */
function hasVaultContent(song: Song): boolean {
  const docs = song.linkedGatedContent?.docs
  return Array.isArray(docs) && docs.length > 0
}

function isAlternateCut(song: Song): boolean {
  return (
    song.recordingType === 'Live' ||
    song.recordingType === 'Demo' ||
    (song.compositionType !== 'Original' &&
      song.compositionType !== 'Public Domain')
  )
}

export function getCardRarity(song: Song): CardRarity {
  let tier = popularityTier(song.popularity)
  let variant: RarityVariant = 'standard'

  // Intrinsic floors, applied weakest → strongest so the strongest wins
  // both the tier and the gem variant.
  if (isAlternateCut(song)) {
    tier = maxTier(tier, 'uncommon')
    variant = 'alt'
  }
  if (hasStems(song)) {
    tier = maxTier(tier, 'holo')
    variant = 'deluxe'
  }
  if (hasVaultContent(song)) {
    tier = 'secret'
    variant = 'vault'
  }

  const level = rank(tier)
  return {
    tier,
    variant,
    level,
    isFoil: level >= rank('holo'),
  }
}
