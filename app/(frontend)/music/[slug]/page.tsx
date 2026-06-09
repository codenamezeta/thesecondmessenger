import { cache } from 'react'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { RelatedSongs } from '@/components/RelatedSongs'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SongHero } from '@/components/SongHero'
import { SongInlineVideoFrame } from '@/components/SongInlineVideoFrame'
import { Share } from '@/components/Share'
import { LibrarySync } from '@/components/LibrarySync'
import CommentsYT from '@/components/CommentsYT'
import { YouTubeLikeButton } from '@/components/YouTube/LikeButton'
import { YouTubeSubscribeButton } from '@/components/YouTube/SubscribeButton'
import RichText from '@/components/RichText'
import {
  Users,
  Disc,
  YoutubeIcon,
  ThumbsUpIcon,
  Info,
  CalendarClock,
} from 'lucide-react'
import { StreamingLinksCard } from '@/components/music/StreamingLinksCard'
import type { GatedContent, Media, Release } from '@/payload-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { MusicRecordingSchema } from '@/schema/MusicRecording'
import { generateMeta } from '@/utilities/generateMeta'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import { buildSongMetaDescription, buildSongPageTitle } from '@/lib/seo/songToMetaDescription'
import { ARTIST_HOMEPAGE } from '@/lib/branding'
import {
  FIELD_TO_CATEGORY,
  getResolvedTags,
  type SongTagField,
} from '@/lib/songs/tagFields'
import { tagLandingHref } from '@/lib/music/filterState'
import { getMeUser } from '@/utilities/getMeUser'
import { SongGatedBonusSection } from '@/components/SongGatedBonusSection'
import { userMeetsGatedFileAccess } from '@/access/crewRanks'

// --- Types ---
type Args = {
  params: Promise<{
    slug: string
  }>
}

type SongDoc = NonNullable<Awaited<ReturnType<typeof querySongBySlug>>>
type TagLike = { name?: string } | string | number | null | undefined
type IdLike = { id: number | string } | number | string
type CreditRole = { role: string }
type CreditItem = {
  id: string | number
  name: string
  category: string
  roles: CreditRole[]
}
type PlaylistItem = { id: string | number; slug: string; title: string }
type ReleaseDoc = Release

// --- Data Fetching ---
const querySongBySlug = cache(async (slug: string) => {
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'songs',
    where: { slug: { equals: slug } },
    depth: 2, // Vital: We need the Tag names, not just IDs
  })
  return result.docs[0] || null
})

// --- Metadata & SEO ---

// Formatter is shared via `lib/seo/formatList.ts`; the meta-description
// generator lives in `lib/seo/songToMetaDescription.ts`.

// --- HELPER: Safety Check for Relations ---
const resolveTags = (field: TagLike[] | null | undefined): string[] => {
  if (!field || !Array.isArray(field)) return []
  return field
    .map((tag) => (typeof tag === 'object' && tag?.name ? tag.name : null))
    .filter((name): name is string => Boolean(name))
}

const resolveId = (item: IdLike): number | string => {
  if (typeof item === 'object') return item.id
  return item
}

function SidebarCard({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <Card className="border-border/70 bg-transparent backdrop-blur-sm">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 font-body text-xl font-bold tracking-widest uppercase">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="font-mono text-sm tracking-wider text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function CreditsCard({ song }: { song: SongDoc }) {
  const credits = (song.credits as CreditItem[] | null | undefined) ?? []
  if (credits.length === 0) return null

  return (
    <SidebarCard
      icon={<Users size={16} className="text-primary" />}
      title="Credits"
      description="The people who made this song possible."
    >
      <ul className="space-y-4">
        {credits.map((credit, index: number) => (
          <li key={credit.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-sm text-foreground">
                {credit.name}
              </p>
              <Badge
                variant="outline"
                className="shrink-0 rounded-sm p-3 font-mono text-[10px] tracking-widest uppercase"
              >
                {credit.category}
              </Badge>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {credit.roles.map((role) => role.role).join(', ')}
            </p>
            {index < credits.length - 1 && <Separator className="mt-3" />}
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

function FeaturedInCard({ song }: { song: SongDoc }) {
  if (!song.inPlaylists?.docs || song.inPlaylists.docs.length === 0) return null

  return (
    <SidebarCard
      title="Featured In"
      icon={<Disc size={16} className="text-primary" />}
    >
      <div className="flex flex-wrap gap-2">
        {(song.inPlaylists.docs as PlaylistItem[]).map((playlist) => (
          <Badge
            key={playlist.id}
            variant="outline"
            asChild
            className="h-7 px-3"
          >
            <Link href={`/playlists/${playlist.slug}`}>{playlist.title}</Link>
          </Badge>
        ))}
      </div>
    </SidebarCard>
  )
}

function formatReleaseDate(value: string | null | undefined): string | null {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsed)
}

function SongMetadataCard({ song }: { song: SongDoc }) {
  const keyValue =
    song.changesKey && song.key && song.keyEnd
      ? `${song.key} -> ${song.keyEnd}`
      : song.key
  const bpmValue =
    song.changesTempo && song.bpm && song.bpmEnd
      ? `${song.bpm} -> ${song.bpmEnd}`
      : song.bpm?.toString()

  const termsOfUseLabel =
    song.termsOfUse === 'all-rights'
      ? 'All rights reserved'
      : song.termsOfUse === 'cc-attrib-nc'
        ? 'Free non-commercial use with attribution'
        : song.termsOfUse === 'custom'
          ? song.termsOfUseCustom || 'Custom terms'
          : null

  const detailRows: Array<{ label: string; value?: string | null }> = [
    { label: 'Key', value: keyValue },
    { label: 'BPM', value: bpmValue },
    { label: 'Composition', value: song.compositionType },
    { label: 'Recording', value: song.recordingType },
    { label: 'ISRC', value: song.isrc },
    { label: 'ISWC', value: song.iswc },
    { label: 'Publisher', value: song.publisher },
    { label: 'Phonogram (P)', value: song.phonogramCopyrightOwner },
    { label: 'Composition (C)', value: song.compositionCopyrightOwner },
    { label: 'Terms', value: termsOfUseLabel },
  ].filter((row) => Boolean(row.value))

  const tagGroups = [
    { label: 'Genres', field: 'genres' as SongTagField, tags: getResolvedTags(song.genres).slice(0, 3) },
    {
      label: 'Sub-genres',
      field: 'subGenres' as SongTagField,
      tags: getResolvedTags(song.subGenres).slice(0, 3),
    },
    {
      label: 'Activities',
      field: 'activities' as SongTagField,
      tags: getResolvedTags(song.activities).slice(0, 3),
    },
    { label: 'Themes', field: 'themes' as SongTagField, tags: getResolvedTags(song.themes).slice(0, 3) },
    { label: 'Moods', field: 'moods' as SongTagField, tags: getResolvedTags(song.moods).slice(0, 3) },
    {
      label: 'Production',
      field: 'production' as SongTagField,
      tags: getResolvedTags(song.production).slice(0, 3),
    },
    {
      label: 'Instruments',
      field: 'instruments' as SongTagField,
      tags: getResolvedTags(song.instruments).slice(0, 3),
    },
    { label: 'Gear', field: 'gear' as SongTagField, tags: getResolvedTags(song.gear).slice(0, 3) },
    {
      label: 'Arrangements',
      field: 'arrangements' as SongTagField,
      tags: getResolvedTags(song.arrangements).slice(0, 3),
    },
    {
      label: 'Influences',
      field: 'influences' as SongTagField,
      tags: getResolvedTags(song.influences).slice(0, 3),
    },
    {
      label: 'Other',
      field: 'otherTags' as SongTagField,
      tags: getResolvedTags(song.otherTags).slice(0, 3),
    },
  ].filter((group) => group.tags.length > 0)

  if (detailRows.length === 0 && tagGroups.length === 0) return null

  return (
    <SidebarCard
      icon={<Info size={16} className="text-primary" />}
      title="Song Metadata"
      description="Technical, publishing, and sonic profile."
    >
      <div className="space-y-4">
        {detailRows.length > 0 && (
          <dl className="space-y-2">
            {detailRows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-3 text-sm"
              >
                <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {row.label}
                </dt>
                <dd className="text-right font-body text-foreground">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {detailRows.length > 0 && tagGroups.length > 0 && <Separator />}

        {tagGroups.length > 0 && (
          <div className="space-y-3">
            {tagGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                  {group.label}
                </p>
                <div className="flex flex-wrap gap-2">
                  {group.tags.map((tag) => {
                    const category = FIELD_TO_CATEGORY[group.field]
                    const href =
                      tag.slug && category
                        ? tagLandingHref(category, tag.slug)
                        : null
                    const badge = (
                      <Badge
                        variant="outline"
                        className="h-7 rounded-sm px-2 font-mono text-[10px] tracking-widest uppercase"
                      >
                        {tag.name}
                      </Badge>
                    )
                    return href ? (
                      <Link
                        key={`${group.label}-${tag.id}`}
                        href={href}
                        aria-label={`Browse ${group.label}: ${tag.name}`}
                      >
                        {badge}
                      </Link>
                    ) : (
                      <span key={`${group.label}-${tag.id}`}>{badge}</span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SidebarCard>
  )
}

function ReleaseDetailsCard({ song }: { song: SongDoc }) {
  const fromPrimaryRelease =
    song.primaryRelease && typeof song.primaryRelease === 'object'
      ? (song.primaryRelease as ReleaseDoc)
      : null
  const fromRelatedRelease =
    song.relatedReleases?.docs?.find(
      (doc): doc is ReleaseDoc => typeof doc === 'object',
    ) ?? null
  const release = fromPrimaryRelease ?? fromRelatedRelease

  if (!release && !song.releaseDate) return null

  const rows: Array<{ label: string; value?: string | null }> = [
    { label: 'Title', value: release?.title },
    {
      label: 'Release Date',
      value: formatReleaseDate(release?.releaseDate ?? song.releaseDate),
    },
    { label: 'Type', value: release?.type },
    { label: 'Distribution', value: release?.distribution },
    { label: 'UPC', value: release?.upc },
  ].filter((row) => Boolean(row.value))

  if (rows.length === 0) return null

  return (
    <SidebarCard
      icon={<CalendarClock size={16} className="text-primary" />}
      title="Release"
      description="Primary release context for this track."
    >
      <dl className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 text-sm"
          >
            <dt className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
              {row.label}
            </dt>
            <dd className="text-right font-body text-foreground">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </SidebarCard>
  )
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const song = await querySongBySlug(slug)

  if (!song) return generateMeta({ doc: null })

  const featuredArtistNames =
    song.featuredArtists
      ?.map((entry) => entry.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? []

  const pageTitle = buildSongPageTitle(song.title, featuredArtistNames)
  const canonicalUrl = `${ARTIST_HOMEPAGE}/music/${slug}`

  // 1. DESCRIPTION — built from the 11-layer Sonic Tag Ontology by the
  //    canonical generator. See `lib/seo/songToMetaDescription.ts`.
  const finalDescription = buildSongMetaDescription({
    title: song.title,
    featuredArtists: featuredArtistNames,
    genres: resolveTags(song.genres),
    subGenres: resolveTags(song.subGenres),
    moods: resolveTags(song.moods),
    themes: resolveTags(song.themes),
    instruments: resolveTags(song.instruments),
    activities: resolveTags(song.activities),
    influences: resolveTags(song.influences),
    production: resolveTags(song.production),
    arrangements: resolveTags(song.arrangements),
    bpm: song.bpm,
    key: song.key,
  })

  // 2. KEYWORDS — every layer dumped flat for crawlers + internal search.
  //    Production, gear, and arrangements live here rather than in the
  //    sentence because they read awkwardly inside grammatical copy.
  const allKeywords = [
    song.title,
    'The Second Messenger',
    ...resolveTags(song.genres),
    ...resolveTags(song.subGenres),
    ...resolveTags(song.activities),
    ...resolveTags(song.themes),
    ...resolveTags(song.moods),
    ...resolveTags(song.production),
    ...resolveTags(song.instruments),
    ...resolveTags(song.gear),
    ...resolveTags(song.arrangements),
    ...resolveTags(song.influences),
  ].join(', ')

  const coverUrl = (song.coverArt as Media | null | undefined)?.url || undefined
  const ogImage = coverUrl
    ? coverUrl.startsWith('/')
      ? `${ARTIST_HOMEPAGE}${coverUrl}`
      : coverUrl
    : `${ARTIST_HOMEPAGE}/imgs/michael-today.jpg`

  return {
    title: pageTitle,
    description: finalDescription,
    keywords: allKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: mergeOpenGraph({
      title: pageTitle,
      description: finalDescription,
      url: canonicalUrl,
      images: [{ url: ogImage }],
      type: 'music.song',
    }),
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: finalDescription,
      images: [ogImage],
    },
  }
}

export default async function SongPage({ params }: Args) {
  const { slug } = await params
  const initialSong = await querySongBySlug(slug)

  if (!initialSong) return notFound()

  const payload = await getPayload({ config: configPromise })

  // --- FETCH THE USER (vault tiers checked in SongGatedBonusSection) ---
  const { user } = await getMeUser()

  // Fetch a request-scoped copy for page rendering so auth-sensitive fields
  // like vaultAudio are not affected by the shared slug cache.
  const songResult = await payload.find({
    collection: 'songs',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    overrideAccess: true,
  })
  const song = (songResult.docs[0] as SongDoc | undefined) ?? initialSong

  // --- CHECK SAVED STATUS ---
  let isSaved = false
  const cookieStore = await cookies()
  const userId = cookieStore.get('tsm_user_id')?.value

  if (userId) {
    try {
      const userPresave = await payload.findByID({
        collection: 'presaves',
        id: userId,
      })

      // Check if THIS song ID exists in their campaigns array
      if (userPresave && userPresave.campaigns) {
        const savedIds = userPresave.campaigns.map((campaign) =>
          resolveId(campaign as IdLike),
        )
        if (savedIds.includes(song.id)) {
          isSaved = true
        }
      }
    } catch {
      // Cookie might be invalid or user deleted, fail gracefully
    }
  }

  // Related Songs are now derived by weighted tag-overlap across all
  // 11 ontology layers — see `<RelatedSongs />` below. The component
  // is a server-rendered island that runs its own narrowed `find`,
  // so we no longer need to compute the candidate list here.

  const linkedBySongRelation = await payload.find({
    collection: 'gated-content',
    where: { relatedSong: { equals: song.id } },
    depth: 0,
    limit: 100,
    overrideAccess: true,
  })

  const fromSongJoin =
    song.linkedGatedContent?.docs?.flatMap((doc) => {
      if (!doc || typeof doc !== 'object') return []
      const asset = doc as GatedContent
      return [{ rowId: `join-${asset.id}`, asset }]
    }) ?? []

  const fromRelatedSong = linkedBySongRelation.docs.map((asset) => ({
    rowId: `related-${asset.id}`,
    asset: asset as GatedContent,
  }))

  const mergedById = new Map<number, { rowId: string; asset: GatedContent }>()
  for (const row of [...fromSongJoin, ...fromRelatedSong]) {
    mergedById.set(row.asset.id, row)
  }

  const gatedBonusRows = Array.from(mergedById.values()).map((row) => {
    const asset = row.asset
    const canExposeUrl = userMeetsGatedFileAccess(user, asset.tierRequired)
    const publicAsset: GatedContent = canExposeUrl
      ? asset
      : { ...asset, url: '' }
    return { ...row, asset: publicAsset }
  })

  return (
    <article className="min-h-screen bg-transparent pb-12">
      <MusicRecordingSchema song={song} />
      <PayloadRedirects disableNotFound url={`/music/${slug}`} />
      <SongHero song={song} />

      <div className="container bg-transparent py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <main className="space-y-10 lg:col-span-8">
            {song.youtubeId && (
              <section>
                {/* The Viewscreen — hosts either a standby thumbnail + play button
              (SongInlineVideoFrame) or, when this song is the one currently
              playing in the Global Player AND video is disabled, the Global
              Player's VideoStage lays its iframe over the frame via fixed
              positioning. The overlay respects the `p-3` inset and matches
              the frame's `rounded-sm` corners. */}
                <div className="group relative z-10 aspect-video overflow-hidden rounded-md border border-primary/20 bg-primary/5 p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
                  <SongInlineVideoFrame song={song} />

                  {/* Corner Decor */}
                  <div className="pointer-events-none absolute top-2 left-2 size-3 border-t border-l border-primary/50" />
                  <div className="pointer-events-none absolute top-2 right-2 size-3 border-t border-r border-primary/50" />
                  <div className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-primary/50" />
                  <div className="pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b border-primary/50" />
                </div>
              </section>
            )}

            {song.youtubeId && (
              <section className="mt-6 px-3 lg:col-span-8">
                <div className="mb-3 flex w-full flex-col items-center justify-center gap-2 md:flex-row">
                  <YouTubeLikeButton
                    videoId={song.youtubeId}
                    className="flex w-full items-center justify-center gap-2 bg-secondary text-pretty text-foreground hover:bg-[#FF0000] hover:text-white md:w-1/2"
                  >
                    <ThumbsUpIcon size={20} />
                    Like this video on YouTube
                  </YouTubeLikeButton>

                  <YouTubeSubscribeButton className="flex w-full items-center justify-center gap-2 bg-secondary text-pretty text-foreground hover:bg-[#FF0000] hover:text-white md:w-1/2">
                    <YoutubeIcon size={20} />
                    Subscribe to YouTube Channel
                  </YouTubeSubscribeButton>
                </div>
                {/* <Separator className="mb-8" /> */}
                <CommentsYT videoId={song.youtubeId} />
              </section>
            )}
            {song.about && (
              <section className="space-y-3 rounded-sm border border-border/60 bg-background/80 p-6 shadow-xs backdrop-blur-sm md:p-8">
                {/* <div className="space-y-1"> */}
                <p className="font-mono text-xs tracking-widest text-primary uppercase">
                  {'// Transmission Log'}
                </p>
                <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
                  Liner Notes
                </h2>
                {/* </div> */}
                <Separator />
                <RichText data={song.about} />
              </section>
            )}

            <SongGatedBonusSection
              items={gatedBonusRows}
              user={user}
              returnPath={`/music/${slug}`}
            />

            {song.lyrics && (
              <section className="space-y-3 rounded-sm border border-border/60 bg-muted/20 p-6 shadow-xs backdrop-blur-sm md:p-8">
                {/* <div className="space-y-1"> */}
                <p className="font-mono text-xs tracking-widest text-primary uppercase">
                  {'// Vocal Data'}
                </p>
                <h2 className="font-heading text-2xl tracking-tight md:text-3xl">
                  Lyrics
                </h2>
                {/* </div> */}
                <Separator />
                <pre className="font-mono text-xs leading-relaxed whitespace-pre-wrap text-muted-foreground">
                  {song.lyrics}
                </pre>
              </section>
            )}
          </main>

          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--main-nav-bar-height)+var(--admin-bar-height)+0.5rem)] lg:col-span-4 lg:self-start">
            <Share
              title={song.title}
              url={`${process.env.NEXT_PUBLIC_SERVER_URL}/music/${song.slug}`}
            />

            {song.releaseDate && (
              <LibrarySync
                songId={String(song.id)}
                youtubeId={song.youtubeId || undefined}
                spotifyId={song.spotifyId || undefined}
                isReleased={
                  song.relatedReleases?.docs?.some(
                    (doc) =>
                      typeof doc === 'object' &&
                      doc.releaseDate &&
                      new Date(doc.releaseDate) <= new Date(),
                  ) ?? false
                }
                initialIsSaved={isSaved}
              />
            )}

            {song.streamingLinks && song.streamingLinks.length > 0 && (
              <StreamingLinksCard streamingLinks={song.streamingLinks} />
            )}
            <SongMetadataCard song={song} />
            <ReleaseDetailsCard song={song} />
            <CreditsCard song={song} />
            <FeaturedInCard song={song} />
          </aside>
        </div>

        <RelatedSongs song={song} />
      </div>
    </article>
  )
}
