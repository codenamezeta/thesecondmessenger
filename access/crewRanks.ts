import type { Access } from 'payload'
import type { User } from '@/payload-types'

const rankWeights = {
  ensign: 0,
  lieutenant: 1,
  commander: 2,
  captain: 3,
  admiral: 4,
} as const

/** Paid vault tiers only (not ensign / admiral). */
const gatedTierWeights = {
  lieutenant: 1,
  commander: 2,
  captain: 3,
} as const

/** Matches `GatedContent.tierRequired`. */
export type GatedTierRequired = keyof typeof gatedTierWeights

export function gatedAssetTier(
  tier: GatedTierRequired | null | undefined,
): GatedTierRequired {
  return tier ?? 'lieutenant'
}

/** Whether the user may access a gated upload at the required tier. */
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

/** Lieutenant+ floor for the Vault; Ensign has no access. */
export function userMeetsVaultFloor(user: User | null | undefined): boolean {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.lieutenant
}

/** Vault file URL + API access: Lieutenant+ and meets the asset tier. */
export function userMeetsGatedFileAccess(
  user: User | null | undefined,
  tier: GatedTierRequired | null | undefined,
): boolean {
  if (!userMeetsVaultFloor(user)) return false
  return userMeetsGatedTier(user, gatedAssetTier(tier))
}

export function userHasLieutenantOrHigher(
  user: User | null | undefined,
): boolean {
  return userMeetsVaultFloor(user)
}

export const isLieutenantOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.lieutenant
}

export const isCommanderOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.commander
}

export const isCaptainOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.captain
}

export const isAdmiral: Access = ({ req: { user } }) => {
  if (!user) return false
  if (user.role === 'admin') return true
  const userRankWeight =
    rankWeights[user.crewRank as keyof typeof rankWeights] || 0
  return userRankWeight >= rankWeights.admiral
}
