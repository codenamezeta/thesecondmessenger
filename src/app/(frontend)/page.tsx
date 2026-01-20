import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { getChannelVideos } from '@/actions/youtube'
import { Button } from '@/components/ui/button'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { ArrowRight, Disc, Activity, Radio, ExternalLink, Music, Film } from 'lucide-react'
import { SongCard } from '@/components/SongCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

import { MusicGroupSchema } from '@/components/Schema/MusicGroup'

export const metadata = {
  title: 'Mission Control | The Second Messenger',
  description: 'Central command for audio transmissions and visual logs.',
}

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const [latestSongData, recentSongsData, rawVideos, allSongsForLinking] = await Promise.all([
    // A. Latest Release (Hero)
    payload.find({
      collection: 'songs',
      sort: '-releaseDate',
      limit: 1, // The very most recent song is the featured song.
    }),
    // B. Recent Logs (Grid)
    payload.find({
      collection: 'songs',
      sort: '-releaseDate',
      limit: 5, // Needs to be 5 to account for the featured song at index 0
      page: 1,
    }),
    // C. Videos
    getChannelVideos(3),
    // D. Songs for linking
    payload.find({
      collection: 'songs',
      where: { youtubeId: { exists: true } },
      limit: 100,
      select: { youtubeId: true, title: true, slug: true },
    }),
  ])

  const featuredSong = latestSongData.docs[0]
  // Filter out the featured song from the recent list so it doesn't duplicate
  const recentSongs = recentSongsData.docs.filter((s) => s.id !== featuredSong?.id).slice(0, 4) // Slice is redundant because payload fetch already limited.

  const songMap = new Map(allSongsForLinking.docs.map((s) => [s.youtubeId, s]))
  const videos = rawVideos.map((video: any) => ({
    ...video,
    linkedSong: songMap.get(video.youtubeId) || null,
  }))

  return (
    <div className="min-h-screen pb-20">
      <MusicGroupSchema />
      {/* --- HERO SECTION: ACTIVE TRANSMISSION --- */}
      <main className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-background border-b border-border/50 py-20">
        {/* Dynamic Background Blur (Adjusted to 2xl) */}
        {featuredSong && (featuredSong.coverArt as any)?.url && (
          <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none select-none">
            <Image
              src={(featuredSong.coverArt as any).url}
              alt="Background"
              fill
              className="object-cover blur-[2px] scale-125"
              priority
            />
          </div>
        )}

        {/* Texture Overlay (Using Inline Style) */}
        <div
          className="absolute inset-0 opacity-0 pointer-events-none z-10 mix-blend-overlay"
          style={{
            backgroundImage: "url('/imgs/scanlines.png')",
            // backgroundSize: '4px 4px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 z-10" />

        <div className="container relative z-20 flex flex-col md:flex-row items-center gap-12 lg:gap-24">
          {/* Left: Text Content */}
          <div className="flex-1 text-center md:text-left space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-mono uppercase tracking-widest animate-pulse">
              <Radio size={12} />
              Incoming Transmission
            </div>

            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-heading text-foreground uppercase tracking-widest leading-none drop-shadow-xl">
                {featuredSong ? featuredSong.title : 'NO SIGNAL'}
              </h1>
              <p className="text-xl md:text-2xl text-foreground/75 font-heading uppercase tracking-widest">
                {featuredSong?.tagline || 'System waiting for input...'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-4">
              {featuredSong && (
                <Button
                  size="lg"
                  asChild
                  className="uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                  <Link href={`/songs/${featuredSong.slug}`}>
                    <Disc className="mr-2 h-4 w-4" />
                    Initiate Playback
                  </Link>
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                asChild
                className="uppercase tracking-widest text-xs bg-background/50 backdrop-blur-sm border-primary/30 hover:border-primary"
              >
                <Link href="/music">Access The Archive</Link>
              </Button>
            </div>
          </div>

          {/* Right: The "Physical" Artifact */}
          <div className="flex-1 relative w-full max-w-md aspect-square flex items-center justify-center">
            {/* Glowing Ring */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-[80px] animate-pulse" />

            {/* The Cover Art Card */}
            {featuredSong && (featuredSong.coverArt as any)?.url ? (
              <div className="relative w-72 h-72 md:w-[400px] md:h-[400px] bg-card border border-border/50 rounded-lg shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700 ease-out group">
                <Image
                  src={(featuredSong.coverArt as any).url}
                  alt={featuredSong.title}
                  fill
                  className="object-cover rounded-lg border border-primary/10"
                />
                {/* Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none duration-500" />
              </div>
            ) : (
              <div className="w-64 h-64 border border-dashed border-border flex items-center justify-center rounded-lg bg-card/50">
                <Disc size={48} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- SECTION 2: THE DATA STREAM (Recent Songs) --- */}
      <section className="py-24 container">
        <div className="flex items-center justify-between mb-8 border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Activity className="text-primary" />
            <h2 className="text-2xl font-heading uppercase tracking-widest text-foreground">
              Recent Logs
            </h2>
          </div>
          <Button
            variant="ghost"
            asChild
            className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
          >
            <Link href="/music">
              View Full Database <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentSongs.map((song) => (
            <SongCard key={song.id} song={song} className="h-full" />
          ))}
        </div>
      </section>

      {/* --- SECTION 3: VISUAL FEED & NEWSLETTER --- */}
      <section className="py-24 bg-card/10 border-y border-border/50 relative overflow-hidden">
        {/* Background Texture (Inline Style) */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "url('/imgs/scanlines.png')",
            backgroundSize: '4px 4px',
          }}
        />

        <div className="container grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
          {/* Visual Feed */}
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <h2 className="text-2xl font-heading uppercase tracking-widest text-foreground flex items-center gap-3">
                <Film className="text-primary" /> Visual Feed
              </h2>
              <Button
                variant="ghost"
                asChild
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary"
              >
                <Link href="/videos">
                  All Visuals <ArrowRight className="ml-2 h-3 w-3" />
                </Link>
              </Button>
            </div>

            <div className="space-y-4">
              {videos.slice(0, 3).map((video: any) => (
                <Card
                  key={video.id}
                  className="bg-card/40 hover:bg-card/80 transition-colors border-border/50 hover:border-primary/30 group"
                >
                  <div className="flex gap-4 p-4 items-center">
                    {/* Thumbnail */}
                    <div className="relative w-32 aspect-video bg-background rounded-sm overflow-hidden border border-border/50 shrink-0 group-hover:border-primary/50 transition-colors">
                      <Image
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
                        alt={video.title}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-background/50">
                        <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                          <ExternalLink size={14} className="text-primary-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-foreground/75">
                          {new Date(video.publishedDate).toLocaleDateString()}
                        </span>
                        {video.linkedSong && (
                          <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                            <Music size={8} /> Linked
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-sm uppercase tracking-wide text-foreground truncate group-hover:text-primary transition-colors">
                        {video.title}
                      </h3>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                      className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Link href="/videos">
                        <ArrowRight size={16} />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Newsletter Terminal */}
          <div className="flex flex-col justify-center">
            <Card className="bg-card border-border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="uppercase tracking-widest text-primary font-heading text-xl">
                    Establish Secure Link
                  </CardTitle>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent/20" />
                    <div className="w-2 h-2 rounded-full bg-secondary/50" />
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                </div>
                <CardDescription className="font-mono text-xs text-card-foreground border-l-2 border-primary/20 pl-3">
                  Join the encrypted network to receive early transmission logs, tour data, and
                  classified audio drops.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NewsletterSignup />
              </CardContent>
            </Card>

            {/* Decorative Terminal Text below */}
            <div className="mt-4 font-mono text-[10px] text-muted-foreground/50 text-right uppercase tracking-widest">
              // End of Transmission
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
