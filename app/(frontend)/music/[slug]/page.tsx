import { cache } from 'react'
import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { SongCard } from '@/components/SongCard'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SongHero } from '@/components/SongHero'
import { Share } from '@/components/Share'
import { LibrarySync } from '@/components/LibrarySync'
import CommentsYT from '@/components/CommentsYT'
import RichText from '@/components/RichText'
import { Users, Disc, ExternalLink } from 'lucide-react'
import type { GatedContent, Media } from '@/payload-types'
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
type StreamingLink = { id: string | number; platform: string; url: string }
type CreditRole = { role: string }
type CreditItem = {
  id: string | number
  name: string
  category: string
  roles: CreditRole[]
}
type PlaylistItem = { id: string | number; slug: string; title: string }

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

// --- HELPER 1: Smart List Formatting (Oxford Comma support) ---
const formatList = (items: string[]) => {
  if (!items || items.length === 0) return ''
  // "Dark, Sad, and Cinematic"
  const listFormatter = new Intl.ListFormat('en', {
    style: 'long',
    type: 'conjunction',
  })
  return listFormatter.format(items)
}

// --- HELPER 2: Safety Check for Relations ---
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
    <Card className="border-border/70 bg-card/80 backdrop-blur-sm">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 font-heading tracking-wider uppercase">
          {icon}
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="font-body">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

function StreamingLinksCard({ song }: { song: SongDoc }) {
  if (!song.streamingLinks || song.streamingLinks.length === 0) return null

  return (
    <SidebarCard
      icon={<Disc size={24} className="text-primary" />}
      title="Stream Now"
      description="Open official platform links."
    >
      <div className="space-y-2">
        {(song.streamingLinks as StreamingLink[]).map((link) => (
          <Button
            key={link.id}
            asChild
            variant="secondary"
            className="h-12 w-full justify-between px-4 text-left"
          >
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
            >
              <span className="truncate font-body text-sm">
                {link.platform}
              </span>
              <ExternalLink size={14} aria-hidden />
            </a>
          </Button>
        ))}
      </div>
    </SidebarCard>
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
              <p className="font-body text-sm text-foreground">{credit.name}</p>
              <Badge variant="outline" className="shrink-0">
                {credit.category}
              </Badge>
            </div>
            <p className="font-body text-xs text-muted-foreground">
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

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const song = await querySongBySlug(slug)

  if (!song) return generateMeta({ doc: null })

  // 1. EXTRACT & CURATE DATA
  // We limit the number of tags used in the sentence to prevent "Keyword Stuffing"
  const moods = resolveTags(song.moods)
    .slice(0, 2)
    .map((s) => s.toLowerCase())
  const genres = resolveTags(song.genres).slice(0, 2)
  const themes = resolveTags(song.themes)
    .slice(0, 3)
    .map((s) => s.toLowerCase())

  // 2. CONSTRUCT "ROBOT CONTEXT" SENTENCE
  // Pattern: "A [Mood] and [Mood] [Genre] track by The Second Messenger..."
  let generatedContext = ''

  const moodString = moods.length > 0 ? `${formatList(moods)} ` : ''
  const genreString = genres.length > 0 ? formatList(genres) : 'Rock' // Default fallback

  generatedContext = `A ${moodString}${genreString} track by The Second Messenger`

  // "...exploring themes of [Theme], [Theme], and [Theme]."
  if (themes.length > 0) {
    generatedContext += `, exploring themes of ${formatList(themes)}`
  }

  generatedContext += '.'

  // 3. HYBRID DESCRIPTION
  let finalDescription = ''
  if (song.tagline) {
    // Option A: Human Hook + Robot Context
    finalDescription = `${song.tagline} ${generatedContext}`
  } else {
    // Option B: Full Robot
    finalDescription = `${song.title} is ${generatedContext.toLowerCase()}`
  }

  // 4. KEYWORDS META (Dump everything here for internal search/crawlers)
  const allKeywords = [
    song.title,
    'The Second Messenger',
    ...resolveTags(song.genres),
    ...resolveTags(song.moods),
    ...resolveTags(song.themes),
    ...resolveTags(song.instruments),
    ...resolveTags(song.styles),
    ...resolveTags(song.production),
    ...resolveTags((song as SongDoc & { artists?: TagLike[] | null }).artists),
  ].join(', ')

  const coverUrl = (song.coverArt as Media | null | undefined)?.url || undefined

  return {
    title: `${song.title} | The Second Messenger`,
    description: finalDescription,
    keywords: allKeywords,
    openGraph: mergeOpenGraph({
      title: `${song.title} | The Second Messenger`,
      description: finalDescription,
      url: `/songs/${slug}`,
      images: coverUrl ? [{ url: coverUrl }] : undefined,
      type: 'music.song',
    }),
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

  // Related Songs

  const moodIds =
    (song.moods as IdLike[] | null | undefined)?.map(resolveId) || []
  const genreIds =
    (song.genres as IdLike[] | null | undefined)?.map(resolveId) || []

  const relatedSongs = await payload.find({
    collection: 'songs',
    limit: 3,
    where: {
      and: [
        { id: { not_equals: song.id } }, // Exclude current song
        {
          or: [{ moods: { in: moodIds } }, { genres: { in: genreIds } }],
        },
      ],
    },
  })

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
    <article className="min-h-screen pb-12">
      <MusicRecordingSchema song={song} />
      <PayloadRedirects disableNotFound url={`/music/${slug}`} />
      <SongHero song={song} />

      <div className="container py-10 md:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-8">
            {/* The Viewscreen */}
            <div className="group relative z-10 aspect-video overflow-hidden rounded-md border border-primary/20 bg-primary/5 p-3 shadow-[0_0_50px_rgba(0,0,0,0.9)]">
              {/* VIDEO HERE */}

              {/* Corner Decor */}
              <div className="pointer-events-none absolute top-2 left-2 size-3 border-t border-l border-primary/50" />
              <div className="pointer-events-none absolute top-2 right-2 size-3 border-t border-r border-primary/50" />
              <div className="pointer-events-none absolute bottom-2 left-2 size-3 border-b border-l border-primary/50" />
              <div className="pointer-events-none absolute right-2 bottom-2 size-3 border-r border-b border-primary/50" />
            </div>
          </div>

          {song.youtubeId && (
            <section className="mt-12 lg:col-span-8">
              {/* <Separator className="mb-8" /> */}
              <CommentsYT videoId={song.youtubeId} />
            </section>
          )}

          <section className="space-y-10 lg:col-span-8">
            {song.about && (
              <main className="space-y-3 rounded-sm border border-border/60 bg-background/80 p-6 shadow-xs backdrop-blur-sm md:p-8">
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
              </main>
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
          </section>

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

            <StreamingLinksCard song={song} />
            <CreditsCard song={song} />
            <FeaturedInCard song={song} />
          </aside>
        </div>

        {relatedSongs.docs.length > 0 && (
          <aside className="mt-12">
            <Separator className="mb-8" />
            <h2 className="mb-8 font-heading text-2xl tracking-wider uppercase">
              Convergent Signals
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {relatedSongs.docs.map((s) => (
                <SongCard key={s.id} song={s} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </article>
  )
}
