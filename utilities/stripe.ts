import Stripe from 'stripe'

export const PAID_CREW_RANKS = ['lieutenant', 'commander', 'captain'] as const

export type PaidCrewRank = (typeof PAID_CREW_RANKS)[number]

const STRIPE_API_VERSION = '2026-04-22.dahlia'

let stripeClient: Stripe | null = null

function requireEnvVar(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

export function getStripeClient(): Stripe {
  if (stripeClient) return stripeClient
  stripeClient = new Stripe(requireEnvVar('STRIPE_SECRET_KEY'), {
    apiVersion: STRIPE_API_VERSION,
  })
  return stripeClient
}

export function getStripeWebhookSecret(): string {
  return requireEnvVar('STRIPE_WEBHOOK_SECRET')
}

export function parsePaidCrewRank(value: string | null): PaidCrewRank | null {
  if (!value) return null
  if (PAID_CREW_RANKS.includes(value as PaidCrewRank)) {
    return value as PaidCrewRank
  }
  return null
}

export function getPriceIdForRank(rank: PaidCrewRank): string {
  switch (rank) {
    case 'lieutenant':
      return requireEnvVar('STRIPE_PRICE_LIEUTENANT')
    case 'commander':
      return requireEnvVar('STRIPE_PRICE_COMMANDER')
    case 'captain':
      return requireEnvVar('STRIPE_PRICE_CAPTAIN')
    default: {
      const exhaustiveCheck: never = rank
      throw new Error(`Unsupported rank: ${String(exhaustiveCheck)}`)
    }
  }
}

export function getRankForPriceId(priceId: string | null | undefined): PaidCrewRank | null {
  if (!priceId) return null

  const entries: Array<[PaidCrewRank, string]> = [
    ['lieutenant', process.env.STRIPE_PRICE_LIEUTENANT || ''],
    ['commander', process.env.STRIPE_PRICE_COMMANDER || ''],
    ['captain', process.env.STRIPE_PRICE_CAPTAIN || ''],
  ]

  const match = entries.find(([, configuredPriceId]) => configuredPriceId === priceId)
  return match ? match[0] : null
}
