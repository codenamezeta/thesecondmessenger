import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Header } from '@/components/Header'
import { MusicArchive } from '@/components/MusicArchive'
import { StreamingPlatformDirectory } from '@/components/music/StreamingPlatformDirectory'
import { parseSearchParams } from '@/lib/music/filterState'
import DotField from '@/components/DotField'
import { ARTIST_HOMEPAGE, PRIMARY_ARTIST } from '@/lib/branding'
import {
  buildBreadcrumbListJsonLd,
  buildJsonLdGraph,
} from '@/lib/seo/breadcrumbJsonLd'
import type { Song } from '@/payload-types'

export const revalidate = 600

const RELEASED_SONG_WHERE = {
  and: [
    { releaseDate: { exists: true } },
    { releaseDate: { not_equals: null } },
  ],
}

const MUSIC_ARCHIVE_DESCRIPTION =
  'Browse every released track by The Second Messenger — rock, pop-punk, synthwave, acoustic, and more. Filter by mood, activity, theme, and instrument.'

export async function generateMetadata(): Promise<Metadata> {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.find({
    collection: 'songs',
    where: RELEASED_SONG_WHERE,
    limit: 0,
  })

  const title = `Music by ${PRIMARY_ARTIST}`
  const description = `${MUSIC_ARCHIVE_DESCRIPTION} ${totalDocs} tracks in the archive.`
  const canonicalUrl = `${ARTIST_HOMEPAGE}/music`
  const ogImage = `${ARTIST_HOMEPAGE}/imgs/michael-today.jpg`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: PRIMARY_ARTIST,
      locale: 'en_US',
      type: 'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

interface MusicPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildMusicArchiveJsonLd(songs: Song[]): Record<string, unknown> {
  const url = `${ARTIST_HOMEPAGE}/music`
  const description = `${MUSIC_ARCHIVE_DESCRIPTION} ${songs.length} tracks in the archive.`

  return buildJsonLdGraph([
    {
      '@type': 'CollectionPage',
      name: `Music by ${PRIMARY_ARTIST}`,
      description,
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
      { name: 'Music', item: url },
    ]),
  ])
}

export default async function MusicPage({ searchParams }: MusicPageProps) {
  const payload = await getPayload({ config: configPromise })

  const resolvedSearchParams = await searchParams
  const initialFilters = parseSearchParams(resolvedSearchParams)

  const songs = await payload.find({
    collection: 'songs',
    where: RELEASED_SONG_WHERE,
    sort: '-releaseDate',
    limit: 100,
    depth: 1,
  })

  const jsonLd = buildMusicArchiveJsonLd(songs.docs)

  return (
    <article className="bg-linear-to-br from-primary/10 via-transparent to-accent/15 pb-24">
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed inset-0 -z-10 bg-background">
        <DotField
          dotRadius={1}
          dotSpacing={20}
          bulgeStrength={20}
          glowRadius={200}
          waveAmplitude={1}
          cursorRadius={100}
          cursorForce={0.18}
          gradientFrom="#55f7e6"
          gradientTo="#cd5d1a"
          glowColor="#181e1e"
        />
      </div>

      <Header
        eyebrow="// ACCESSING AUDIO ARCHIVE"
        title="Music"
        description="Accessing complete music archive. Select a song to initiate playback or retrieve song data."
        highlightStat={{
          value: songs.docs.length,
          label: 'Songs Released... so far',
        }}
      />
      <main className="container">
        <MusicArchive
          initialSongs={songs.docs}
          initialFilters={initialFilters}
        />
        <StreamingPlatformDirectory />
      </main>
    </article>
  )
}
