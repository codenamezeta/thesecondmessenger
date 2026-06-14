import { cache } from 'react'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ChevronLeft } from 'lucide-react'

import { Header } from '@/components/Header'
import { SongCard } from '@/components/SongCard'
import RichText from '@/components/RichText'
import { CATEGORY_TO_FIELD } from '@/lib/songs/tagFields'
import {
  TAG_CATEGORIES,
  isTagCategory,
  tagLandingEyebrow,
  tagLandingMetaDescription,
  tagLandingTitle,
} from '@/lib/music/tagLanding'
import { pickCanonicalTag, queryTagsBySlug } from '@/lib/routing/slugLookups'
import { ARTIST_HOMEPAGE, PRIMARY_ARTIST } from '@/lib/branding'
import {
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
} from '@/lib/seo/breadcrumbJsonLd'
import type { Media, Song, Tag } from '@/payload-types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

interface TagRouteParams {
  params: Promise<{
    segments?: string[]
  }>
}

// Tag landing pages don't change often (a tag is renamed, songs are
// added/removed). 10-minute ISR gives static-fast loads with a sane
// staleness window. `generateStaticParams` pre-renders the full set
// at build time so most visits never hit revalidation.
export const revalidate = 600

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const tags = await payload.find({
    collection: 'tags',
    limit: 1000,
    depth: 0,
    where: {
      slug: { exists: true },
    },
  })
  return tags.docs
    .filter((t): t is Tag & { slug: string } => Boolean(t.slug))
    .map((t) => ({ segments: [t.category, t.slug] }))
}

const queryTagWithSongs = cache(async (category: string, slug: string) => {
  if (!isTagCategory(category)) return null

  const payload = await getPayload({ config: configPromise })

  const tagResult = await payload.find({
    collection: 'tags',
    where: {
      and: [{ category: { equals: category } }, { slug: { equals: slug } }],
    },
    limit: 1,
    depth: 1,
  })
  const tag = tagResult.docs[0]
  if (!tag) return null

  const songField = CATEGORY_TO_FIELD[category]
  const songsResult = await payload.find({
    collection: 'songs',
    where: {
      and: [
        { [songField]: { in: [tag.id] } },
        { releaseDate: { exists: true } },
        { releaseDate: { not_equals: null } },
      ],
    },
    sort: '-releaseDate',
    limit: 100,
    depth: 1,
  })

  return { tag, category, songs: songsResult.docs }
})

async function resolveTagRoute(
  segments: string[],
): Promise<
  | { kind: 'landing'; category: string; slug: string }
  | { kind: 'redirect'; destination: string }
  | null
> {
  if (segments.length === 2) {
    const [category, slug] = segments
    const result = await queryTagWithSongs(category, slug)
    if (result) {
      return { kind: 'landing', category, slug }
    }
    return null
  }

  if (segments.length === 1) {
    const [tagSlug] = segments
    const tags = await queryTagsBySlug(tagSlug)
    if (tags.length === 0) return null

    const tag = pickCanonicalTag(tags)
    if (!tag.category || !tag.slug) return null

    return {
      kind: 'redirect',
      destination: `/music/tag/${tag.category}/${tag.slug}`,
    }
  }

  return null
}

export async function generateMetadata({
  params,
}: TagRouteParams): Promise<Metadata> {
  const { segments = [] } = await params
  if (segments.length !== 2) return {}

  const [category, slug] = segments
  const result = await queryTagWithSongs(category, slug)
  if (!result) return {}

  const { tag, category: cat, songs } = result
  const title = tagLandingTitle(cat, tag.name)
  const description = tagLandingMetaDescription(cat, tag.name, songs.length)

  const cover = (tag.featuredImage as Media | null | undefined)?.url
  const heroImage = cover
    ? cover.startsWith('/')
      ? `${ARTIST_HOMEPAGE}${cover}`
      : cover
    : `${ARTIST_HOMEPAGE}/imgs/michael-today.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: `${ARTIST_HOMEPAGE}/music/tag/${cat}/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${ARTIST_HOMEPAGE}/music/tag/${cat}/${slug}`,
      images: [{ url: heroImage }],
    },
    twitter: {
      title,
      description,
      images: [{ url: heroImage }],
    },
  }
}

export default async function TagRoutePage({ params }: TagRouteParams) {
  const { segments = [] } = await params
  const resolved = await resolveTagRoute(segments)

  if (!resolved) notFound()

  if (resolved.kind === 'redirect') {
    redirect(resolved.destination)
  }

  const result = await queryTagWithSongs(resolved.category, resolved.slug)
  if (!result) notFound()

  const { tag, category: cat, songs } = result

  const title = tagLandingTitle(cat, tag.name)
  const eyebrow = tagLandingEyebrow(cat)
  const description = tagLandingMetaDescription(cat, tag.name, songs.length)
  const heroImage = (tag.featuredImage as Media | null | undefined) ?? null
  const heroUrl = heroImage?.url ?? null

  const jsonLd = buildTagCollectionJsonLd({ tag, category: cat, songs })

  return (
    <article className="space-y-12 bg-transparent">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container py-8">
        <Link
          href="/music"
          className="inline-flex items-center gap-1 font-mono text-[11px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
        >
          <ChevronLeft className="size-3" aria-hidden />
          All music
        </Link>
      </div>

      {heroUrl ? (
        <div
          className="relative h-48 w-full overflow-hidden border-y border-border/40 md:h-64"
          aria-hidden
        >
          <Image
            src={heroUrl}
            fill
            alt={`An image that represents the ${tag.name} tag`}
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/70 to-background" />
        </div>
      ) : null}

      <Header
        eyebrow={`// ${eyebrow.toUpperCase()} \u2013 ${tag.name.toUpperCase()}`}
        title={title}
        description={description}
        highlightStat={{
          value: songs.length,
          label: songs.length === 1 ? 'Track in archive' : 'Tracks in archive',
        }}
      />

      <main className="container space-y-10 pb-16">
        {tag.description ? (
          <section className="prose-music max-w-3xl">
            <RichText data={tag.description as DefaultTypedEditorState} />
          </section>
        ) : null}

        {songs.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-20 text-center">
            <h2 className="font-heading text-xl tracking-widest text-secondary uppercase">
              No tracks tagged yet
            </h2>
            <p className="mt-2 text-sm text-foreground/75">
              This tag is on the radar but no released tracks carry it yet.
              Check back as the catalog grows.
            </p>
          </div>
        ) : (
          <ol className="my-0 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {songs.map((song) => (
              <li key={song.id} className="h-full">
                <SongCard song={song} />
              </li>
            ))}
          </ol>
        )}
      </main>
    </article>
  )
}

function buildTagCollectionJsonLd(args: {
  tag: Tag
  category: NonNullable<Tag['category']>
  songs: Song[]
}): Record<string, unknown> {
  const { tag, category, songs } = args
  const url = `${ARTIST_HOMEPAGE}/music/tag/${category}/${tag.slug}`
  const musicUrl = `${ARTIST_HOMEPAGE}/music`

  return buildJsonLdGraph([
    {
      '@type': 'CollectionPage',
      name: tagLandingTitle(category, tag.name),
      description: tagLandingMetaDescription(category, tag.name, songs.length),
      url,
      isPartOf: {
        '@type': 'WebSite',
        name: PRIMARY_ARTIST,
        url: ARTIST_HOMEPAGE,
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: songs.length,
        itemListElement: songs.map((song, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'MusicRecording',
            name: song.title,
            url: song.slug ? `${ARTIST_HOMEPAGE}/music/${song.slug}` : undefined,
            byArtist: {
              '@type': 'MusicGroup',
              name: PRIMARY_ARTIST,
              url: ARTIST_HOMEPAGE,
            },
          },
        })),
      },
    },
    buildBreadcrumbListJsonLd([
      { name: PRIMARY_ARTIST, item: ARTIST_HOMEPAGE },
      { name: 'Music', item: musicUrl },
      {
        name: `${tagLandingEyebrow(category)} \u2013 ${tag.name}`,
        item: url,
      },
    ]),
  ])
}

// Re-export for `generateStaticParams` callers in layouts.
export { TAG_CATEGORIES }
