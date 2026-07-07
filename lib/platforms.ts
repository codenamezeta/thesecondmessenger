export type PayoutTier = 'Direct' | 'High' | 'Medium' | 'Low' | 'Very Low'
export type SortMode = 'Optimized' | 'Support' | 'Popularity' | 'Alphabetical'

export interface PlatformConfig {
  id: string
  name: string
  baseUrl: string
  brandColor: string
  payoutTier: PayoutTier
  payoutRank: number
  ubiquityRank: number
  features: string[]
  description: string
}

export const PLATFORM_METADATA: Record<string, PlatformConfig> = {
  OfficialWebsite: {
    id: 'official',
    name: 'Official Website',
    baseUrl: 'https://thesecondmessenger.com',
    brandColor: 'primary',
    payoutTier: 'Direct',
    payoutRank: 1, // 10/10 Score
    ubiquityRank: 12, // ~0
    features: ['Best Overall', 'Hi-Fi Downloads', 'Pay What You Want'],
    description: 'Pay whatever you want. 100% of proceeds go directly to the artist. No intermediaries. The absolute best way to show support.',
  },
  BandCamp: {
    id: 'bandcamp',
    name: 'Bandcamp',
    baseUrl: 'https://thesecondmessenger.bandcamp.com',
    brandColor: '#629AA9',
    payoutTier: 'Direct',
    payoutRank: 2, // 9.5/10 Score
    ubiquityRank: 7, // ~3-5M
    features: ['Hi-Fi Downloads'],
    description: 'Bandcamp is the undisputed darling of the indie music community. It operates on a direct-to-fan model rather than per-stream payouts. Artists keep roughly 80-85% of their merchandise and digital music sales. While they do not have a traditional "subscriber base," their active buyers form a highly engaged ecosystem.',
  },
  Qobuz: {
    id: 'qobuz',
    name: 'Qobuz',
    baseUrl:
      'https://www.qobuz.com/us-en/interpreter/the-second-messenger/7784222',
    brandColor: '#ffffff',
    payoutTier: 'High',
    payoutRank: 3, // 9.0/10 Score
    ubiquityRank: 11, // <250k
    features: ['Hi-Fi Audio'],
    description: 'A highly specialized service for audiophiles, Qobuz pays the highest per-stream rate in the streaming industry (often over 4 cents per stream). However, its U.S. user base is microscopic compared to the giants. It is an incredibly supportive platform, but strictly a niche market.',
  },
  Tidal: {
    id: 'tidal',
    name: 'Tidal',
    baseUrl: 'https://tidal.com/artist/21016548',
    brandColor: '--foreground',
    payoutTier: 'High',
    payoutRank: 4, // 8.5/10 Score
    ubiquityRank: 8, // ~2M
    features: ['Hi-Fi Audio', 'High Payout'],
    description: 'Tidal was built on an artist-first ethos. With excellent high-resolution audio and no free tier to dilute the royalty pool, it pays significantly more per stream than Spotify (often double). It remains a favorite among artists and audiophiles, though its U.S. subscriber base hovers around a modest 2 million.',
  },
  Deezer: {
    id: 'deezer',
    name: 'Deezer',
    baseUrl: 'https://www.deezer.com/us/artist/104889592',
    brandColor: '#EF5466',
    payoutTier: 'High',
    payoutRank: 5, // 8.0/10 Score
    ubiquityRank: 10, // <1M
    features: ['Lossless'],
    description: 'Deezer has a massive footprint in Europe but a tiny one in the U.S. However, it holds a high reputation globally because it recently implemented an "Artist-Centric" payout model. This model actively penalizes "noise" (white noise, rain sounds) and algorithmically boosts payouts to professional, actively searched-for artists.',
  },
  AppleMusic: {
    id: 'apple',
    name: 'Apple Music',
    baseUrl:
      'https://music.apple.com/us/artist/the-second-messenger/1528822765',
    brandColor: '#FA243C',
    payoutTier: 'High',
    payoutRank: 6, // 7.5/10 Score
    ubiquityRank: 2, // ~33-35M
    features: ['Hi-Fi Audio'],
    description: 'Apple maintains a strong reputation in the industry by refusing to offer a permanent free ad-supported tier. Because every user is paying, the revenue pool is healthier, resulting in payouts nearly double those of Spotify (roughly $0.006 to $0.01 per stream). It offers an excellent balance of massive U.S. reach and reasonable compensation.',
  },
  SoundCloud: {
    id: 'soundcloud',
    name: 'SoundCloud',
    baseUrl: 'https://soundcloud.com/thesecondmessenger',
    brandColor: '#FF5500',
    payoutTier: 'Medium',
    payoutRank: 7, // 7.5/10 Score
    ubiquityRank: 9, // <2M (Paid)
    features: [],
    description: 'SoundCloud has tens of millions of free U.S. users, but its paid subscriber base is tiny. However, it earns a high reputation score because it pioneered "Fan-Powered Royalties." Instead of a massive communal pot, the subscription fee of a user goes directly to the artists that specific user listens to. It is highly respected by creators.',
  },
  AmazonMusic: {
    id: 'amazon',
    name: 'Amazon Music',
    baseUrl:
      'https://www.amazon.com/music/player/artists/B08GH5L2XF/the-second-messenger',
    brandColor: '#00A8E1',
    payoutTier: 'Medium',
    payoutRank: 8, // 7.0/10 Score
    ubiquityRank: 3, // ~25M
    features: ['Hi-Fi Audio'],
    description: 'Amazon Music\'s payouts sit comfortably in the middle of the pack. The industry views Amazon Music largely as a tech-ecosystem perk (tied to Alexa devices and Prime), rather than an organic music discovery hub. Still, its financial return to artists is respectable.',
  },
  Pandora: {
    id: 'pandora',
    name: 'Pandora',
    baseUrl: 'https://www.pandora.com/artist/the-2nd-messenger/ARq9ch556cPPjrV',
    brandColor: '#005483',
    payoutTier: 'Low',
    payoutRank: 9, // 5.0/10 Score
    ubiquityRank: 5, // ~6M (Paid)
    features: [],
    description: 'Pandora still boasts about 40 million active listeners in the U.S., but only a fraction pay for the premium, interactive tier. Because it operates largely as a non-interactive digital radio, it falls under different licensing laws (SoundExchange), resulting in notoriously low payouts per play.',
  },
  YouTubeMusic: {
    id: 'youtubemusic',
    name: 'YouTube Music',
    baseUrl: 'https://music.youtube.com/channel/UC7s-BDNomZ-sqKCecBIRrjQ',
    brandColor: '#FF0000',
    payoutTier: 'Low',
    payoutRank: 10, // 4.5/10 Score
    ubiquityRank: 4, // ~20M
    features: [],
    description: 'While YouTube\'s paid subscriber base is growing rapidly, its reputation among artists is mixed. Because YouTube is fundamentally driven by user-generated video content and a massive ad-supported free tier, the average payout per stream is historically very low. However, its value as an organic discovery engine is undeniable.',
  },
  Spotify: {
    id: 'spotify',
    name: 'Spotify',
    baseUrl: 'https://open.spotify.com/artist/44ueDtWuMKuBOqFE7CS7ax',
    brandColor: '#1DB954',
    payoutTier: 'Low',
    payoutRank: 11, // 4.0/10 Score
    ubiquityRank: 1, // ~45-50M
    features: [],
    description: 'The undisputed king of the U.S. streaming market is currently at odds with the independent music community. Despite leading in subscribers, its payout rate is famously low (~$0.003). Furthermore, a highly controversial 2024 policy change completely demonetized tracks with fewer than 1,000 annual streams, effectively shutting out emerging artists from the royalty pool. Spotify remains a necessary evil for artists: you cannot ignore 50 million U.S. subscribers, but making a living off them is nearly impossible.',
  },
  iHeart: {
    id: 'iheart',
    name: 'iHeartRadio',
    baseUrl: 'https://www.iheart.com/artist/the-second-messenger-34954605',
    brandColor: '#C6002B',
    payoutTier: 'Very Low',
    payoutRank: 12, // 4.0/10 Score
    ubiquityRank: 6, // <2M (Paid)
    features: [],
    description: 'Similar to Pandora, iHeartRadio is an aggressive digital port of a traditional broadcast radio conglomerate. Its premium subscription tier is tiny. Its reputation among artists is relatively low, as it relies on traditional radio royalty structures and is heavily gatekept by major labels, making it difficult for independent artists to find support or financial return here.',
  },
}

/** Payload CMS `streamingLinks.platform` select labels → metadata keys */
const PAYLOAD_PLATFORM_MAP: Record<string, keyof typeof PLATFORM_METADATA> = {
  Spotify: 'Spotify',
  'Apple Music': 'AppleMusic',
  'Amazon Music': 'AmazonMusic',
  Tidal: 'Tidal',
  Qobuz: 'Qobuz',
  Deezer: 'Deezer',
  Pandora: 'Pandora',
  SoundCloud: 'SoundCloud',
  Bandcamp: 'BandCamp',
  'YouTube Music': 'YouTubeMusic',
}

export function resolvePlatformFromPayload(
  platformLabel: string,
): PlatformConfig | null {
  const key = PAYLOAD_PLATFORM_MAP[platformLabel]
  if (!key) return null
  return PLATFORM_METADATA[key] ?? null
}

export function getAllPlatforms(): PlatformConfig[] {
  return Object.values(PLATFORM_METADATA)
}

function optimizedScore(platform: PlatformConfig): number {
  return platform.payoutRank + platform.ubiquityRank
}

export function sortPlatforms(
  platforms: PlatformConfig[],
  mode: SortMode,
): PlatformConfig[] {
  const sorted = [...platforms]

  switch (mode) {
    case 'Support':
      return sorted.sort(
        (a, b) =>
          a.payoutRank - b.payoutRank ||
          a.ubiquityRank - b.ubiquityRank ||
          a.name.localeCompare(b.name),
      )
    case 'Popularity':
      return sorted.sort(
        (a, b) =>
          a.ubiquityRank - b.ubiquityRank ||
          a.payoutRank - b.payoutRank ||
          a.name.localeCompare(b.name),
      )
    case 'Alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'Optimized':
    default:
      return sorted.sort(
        (a, b) =>
          optimizedScore(a) - optimizedScore(b) || a.name.localeCompare(b.name),
      )
  }
}

export type StreamingLinkInput = {
  id?: string | number | null
  platform: string
  url: string
  description?: string | null
}

export type EnrichedStreamingLink = StreamingLinkInput & {
  config: PlatformConfig | null
  displayName: string
}

export function enrichStreamingLinks(
  links: StreamingLinkInput[],
): EnrichedStreamingLink[] {
  return links.map((link) => {
    const config = resolvePlatformFromPayload(link.platform)
    return {
      ...link,
      config,
      displayName: config?.name ?? link.platform,
    }
  })
}

export function sortEnrichedStreamingLinks(
  links: EnrichedStreamingLink[],
): EnrichedStreamingLink[] {
  const withConfig = links.filter((l) => l.config)
  const withoutConfig = links.filter((l) => !l.config)
  const sortedConfigs = sortPlatforms(
    withConfig.map((l) => l.config!),
    'Optimized',
  )
  const order = new Map(sortedConfigs.map((c, i) => [c.id, i]))
  const sortedWith = [...withConfig].sort(
    (a, b) => (order.get(a.config!.id) ?? 99) - (order.get(b.config!.id) ?? 99),
  )
  return [...sortedWith, ...withoutConfig]
}

export const SORT_MODE_LABELS: Record<SortMode, string> = {
  Optimized: 'Optimized',
  Support: 'Artist Support',
  Popularity: 'Popularity',
  Alphabetical: 'A–Z',
}

export const SORT_MODE_DESCRIPTIONS: Record<SortMode, string> = {
  Optimized: 'Best balance of payout and reach',
  Support: 'Direct support and fair payouts first',
  Popularity: 'Most listeners first',
  Alphabetical: 'Alphabetical by name',
}
