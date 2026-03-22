import Script from 'next/script'
import type { Song, Media, Release } from '@/payload-types'

export const MusicRecordingSchema = ({ song }: { song: Song }) => {
  const coverUrl = (song.coverArt as Media)?.url
    ? `${process.env.NEXT_PUBLIC_SERVER_URL}${(song.coverArt as Media).url}`
    : `${process.env.NEXT_PUBLIC_SERVER_URL}/website-template-OG.webp`

  // FIX: specific logic to handle the "docs" array safely
  let albumInfo = undefined
  if (song.relatedReleases?.docs && song.relatedReleases.docs.length > 0) {
    const release = song.relatedReleases.docs[0] as Release
    if (typeof release === 'object' && release.title) {
      albumInfo = {
        '@type': 'MusicAlbum',
        name: release.title,
      }
    }
  }

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'MusicRecording',
    name: song.title,
    url: `${process.env.NEXT_PUBLIC_SERVER_URL}/songs/${song.slug}`,
    image: coverUrl,
    duration: song.duration
      ? `PT${Math.floor(song.duration / 60)}M${song.duration % 60}S`
      : undefined,
    datePublished: song.releaseDate,
    isrcCode: song.isrc || undefined,
    byArtist: [
      {
        '@type': 'MusicGroup',
        name: 'The Second Messenger',
        url: process.env.NEXT_PUBLIC_SERVER_URL,
      },
    ],
    inAlbum: albumInfo,
  }

  return (
    <Script
      id={`music-schema-${song.id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
