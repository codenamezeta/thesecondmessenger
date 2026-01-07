import { cookies } from 'next/headers'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { SongHero } from '@/components/SongHero'
import { Share } from '@/components/Share'
import { LibrarySync } from '@/components/LibrarySync'
import CommentsYT from '@/components/CommentsYT'
import RichText from '@/components/RichText'
import {
  Layers,
  Users,
  Disc,
  ExternalLink,
  Download,
  FileAudio,
  Image as ImageIcon,
} from 'lucide-react'
import type { Media, Release } from '@/payload-types'

// --- 1. Types ---
type Args = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const songs = await payload.find({
    collection: 'songs',
    where: { slug: { equals: slug } },
  })
  const song = songs.docs[0]

  if (!song) return { title: '404 - Not Found' }

  return {
    title: `${song.title} | The Second Messenger`,
    description: song.tagline || `Listen to ${song.title} by The Second Messenger.`,
  }
}

export default async function SongPage({ params }: Args) {
  const { slug } = await params
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'songs',
    where: { slug: { equals: slug } },
    depth: 2, // Ensure we get depth for credits/media
  })

  const song = docs[0]

  if (!song) return notFound()

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
        const savedIds = userPresave.campaigns.map((c: any) => (typeof c === 'object' ? c.id : c))
        if (savedIds.includes(song.id)) {
          isSaved = true
        }
      }
    } catch (e) {
      // Cookie might be invalid or user deleted, fail gracefully
    }
  }
  // --------------------------

  return (
    <article className="min-h-screen pb-20">
      {/* HERO */}
      <SongHero song={song} />

      {/* GRID */}
      <div className="container py-12 md:py-20 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-12">
        {/* === LEFT COLUMN: Content === */}
        <section className="space-y-16">
          {/* About / Story */}
          {song.about && (
            <main>
              <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <div className="p-2 bg-primary/10 rounded text-primary">
                  <FileAudio size={20} />
                </div>
                <h3 className="text-2xl font-heading text-white uppercase tracking-widest">
                  Transmission Log
                </h3>
              </div>
              <RichText data={song.about} className="rich-text" />
            </main>
          )}
          {/* Lyrics */}
          {song.lyrics && (
            <section className="bg-surface/5 border border-white/5 rounded p-8">
              <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl font-heading text-white uppercase tracking-wider">
                  Vocal Data
                </h3>
                <span className="text-xs font-mono text-muted uppercase tracking-widest">
                  Lyrics
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed tracking-widest text-muted">
                {song.lyrics}
              </pre>
            </section>
          )}
        </section>

        {/* === RIGHT COLUMN: Sidebar === */}
        <aside className="space-y-8 flex flex-col gap-2">
          {/* 1. LIBRARY SYNC (Spotify/YouTube) */}
          <LibrarySync
            songId={String(song.id)}
            youtubeId={song.youtubeId || undefined}
            spotifyId={song.spotifyId || undefined}
            // Check if release date is in past
            isReleased={
              song.relatedReleases?.docs?.some(
                (doc) =>
                  typeof doc === 'object' &&
                  doc.releaseDate &&
                  new Date(doc.releaseDate) <= new Date(),
              ) ?? false
            }
            initialIsSaved={isSaved} // <--- Pass the DB check result
          />
          {/* We pass the full URL string manually if we want SSR, 
      or let the component calculate it on the client. 
      Passing title helps the social links pre-fill text. */}
          <Share
            title={song.title}
            url={`${process.env.NEXT_PUBLIC_SERVER_URL}/songs/${song.slug}`} // Optional: ensures correct domain
          />
          {/* 1. Streaming Links */}
          {song.streamingLinks && song.streamingLinks.length > 0 && (
            <div className="bg-surface/5 border border-white/10 rounded-lg p-6">
              <h4 className="text-primary font-heading uppercase tracking-widest mb-4 flex items-center gap-2">
                <Disc size={18} /> Stream Now
              </h4>
              <div className="space-y-2">
                {song.streamingLinks.map((link: any) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded bg-black/40 hover:bg-primary/20 border border-white/5 hover:border-primary/50 transition-all group"
                  >
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white">
                      {link.platform}
                    </span>
                    <ExternalLink size={14} className="text-muted group-hover:text-primary" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* 2. Credits */}
          {song.credits && song.credits.length > 0 && (
            <div className="bg-black/40 border border-white/10 rounded-lg p-6">
              <h4 className="text-primary font-heading uppercase tracking-widest mb-6 flex items-center gap-2">
                <Users size={18} /> Personnel
              </h4>
              <ul className="space-y-4 text-sm">
                {song.credits.map((credit: any) => (
                  <li
                    key={credit.id}
                    className="flex flex-col gap-1 border-b border-white/5 pb-3 last:border-0"
                  >
                    <div className="flex justify-between items-baseline">
                      <span className="text-white font-bold">{credit.name}</span>
                      <span className="text-xs text-primary/70 uppercase tracking-wider">
                        {credit.category}
                      </span>
                    </div>
                    {/* Map Roles */}
                    <div className="text-xs text-muted">
                      {credit.roles.map((r: any) => r.role).join(', ')}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 3. Downloads / Bonus Content */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-6">
            <h4 className="text-primary font-heading uppercase tracking-widest mb-4 flex items-center gap-2">
              <Layers size={18} /> Data Cache
            </h4>

            <div className="space-y-3">
              {/* Master Audio */}
              {song.masterAudio && (
                <a
                  href={(song.masterAudio as Media).url || '#'}
                  download
                  className="flex items-center gap-3 p-3 rounded bg-black/60 hover:bg-primary text-white border border-primary/30 transition-all group"
                >
                  <div className="p-2 bg-primary/20 rounded text-primary group-hover:bg-white group-hover:text-black transition-colors">
                    <FileAudio size={18} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold uppercase tracking-wider">Master Audio</p>
                    <p className="text-[10px] text-muted group-hover:text-white/80 font-mono truncate">
                      High Fidelity MP3
                    </p>
                  </div>
                  <Download size={16} />
                </a>
              )}

              {/* Bonus Content Loop */}
              {song.bonusContent &&
                song.bonusContent.map((item: any) => {
                  const fileUrl = (item.file as Media)?.url
                  if (!fileUrl) return null

                  return (
                    <a
                      key={item.id}
                      href={fileUrl}
                      download
                      className="flex items-center gap-3 p-3 rounded bg-black/60 hover:bg-white/10 text-white border border-white/10 transition-all group"
                    >
                      <div className="p-2 bg-white/5 rounded text-muted group-hover:text-white transition-colors">
                        {item.type === 'Artwork' ? (
                          <ImageIcon size={18} />
                        ) : (
                          <FileAudio size={18} />
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold uppercase tracking-wider">{item.label}</p>
                        <p className="text-[10px] text-muted font-mono truncate">{item.type}</p>
                      </div>
                      <Download size={16} className="text-muted group-hover:text-white" />
                    </a>
                  )
                })}
            </div>
          </div>

          {/* 4. Featured In (Playlists/Releases) */}
          {song.inPlaylists?.docs && song.inPlaylists.docs.length > 0 && (
            <div className="p-6 border border-white/10 rounded-lg bg-surface/5">
              <h4 className="text-muted font-heading uppercase tracking-widest mb-4 text-xs">
                Featured In
              </h4>
              <div className="flex flex-wrap gap-2">
                {song.inPlaylists.docs.map((pl: any) => (
                  <Link
                    key={pl.id}
                    href={`/playlists/${pl.slug}`}
                    className="px-3 py-1 bg-black/50 border border-white/10 rounded text-xs text-white hover:border-primary hover:text-primary transition-colors"
                  >
                    {pl.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* Comments */}
        {song.youtubeId && <CommentsYT videoId={song.youtubeId} />}
      </div>
    </article>
  )
}
