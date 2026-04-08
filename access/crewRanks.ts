import type { Access } from 'payload'
import type { User } from '@/payload-types'

const rankWeights = {
  ensign: 0,
  lieutenant: 1,
  commander: 2,
  captain: 3,
  admiral: 4,
} as const

/** Matches `GatedContent.tierRequired` — not all crew ranks. */
const gatedTierWeights = {
  lieutenant: 1,
  commander: 2,
  captain: 3,
} as const

export type GatedTierRequired = keyof typeof gatedTierWeights

/** Whether the user may view a gated upload (per-asset tier on `GatedContent`). */
export function userMeetsGatedTier(
  user: User | null | undefined,
  required: GatedTierRequired,
): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= gatedTierWeights[required]
}

/** Server / route use: Vault and Lieutenant-tier gated pages. */
export function userHasLieutenantOrHigher(
  user: User | null | undefined,
): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.lieutenant
}

export const isLieutenantOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false

  // 2. Allow admins total access
  if (user.role === 'admin') return true

  // 3. Check the crew rank weight
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0

  return userRankWeight >= rankWeights.lieutenant
}

export const isCommanderOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false

  // 2. Allow admins total access
  if (user.role === 'admin') return true

  // 3. Check the crew rank weight
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0

  return userRankWeight >= rankWeights.commander
}

// Covers Captain (Tier 3) and Admiral — use this for Captain-gated content
export const isCaptainOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false

  // 2. Allow admins total access
  if (user.role === 'admin') return true

  // 3. Check the crew rank weight
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0

  return userRankWeight >= rankWeights.captain
}

// Exact Admiral check — for internal/artist-only areas
export const isAdmiral: Access = ({ req: { user } }) => {
  if (!user) return false

  // 2. Allow admins total access
  if (user.role === 'admin') return true

  // 3. Check the crew rank weight
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0

  return userRankWeight >= rankWeights.admiral
}
