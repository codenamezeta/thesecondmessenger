import type { Access } from 'payload'

const rankWeights = {
  ensign: 0,
  lieutenant: 1,
  commander: 2,
  captain: 3,
  admiral: 4,
} as const

type Rank = keyof typeof rankWeights

const weight = (rank: string): number =>
  rankWeights[rank as Rank] ?? -1

export const isLieutenantOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  return weight(user.crewRank) >= rankWeights.lieutenant
}

export const isCommanderOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  return weight(user.crewRank) >= rankWeights.commander
}

// Covers Captain (Tier 3) and Admiral — use this for Captain-gated content
export const isCaptainOrHigher: Access = ({ req: { user } }) => {
  if (!user) return false
  return weight(user.crewRank) >= rankWeights.captain
}

// Exact Admiral check — for internal/artist-only areas
export const isAdmiral: Access = ({ req: { user } }) => {
  if (!user) return false
  return user.crewRank === 'admiral'
}
