import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { BlogArchive } from '@/components/BlogArchive'
import type { Category } from '@/payload-types'
// import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      _status: { equals: 'published' },
    },
  })

  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    overrideAccess: false,
  })

  const categories = (categoriesResult.docs as Category[]).map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
  }))

  return (
    <main className="min-h-screen">
      {/* <PageClient /> */}

      {/* Page Header */}
      <div className="relative overflow-hidden border-b border-border/50 bg-background">
        {/* Corner brackets */}
        <div
          className="pointer-events-none absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2 border-primary/30"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2 border-primary/30"
          aria-hidden
        />

        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, hsl(var(--primary) / 0.2) 0%, transparent 70%)',
          }}
          aria-hidden
        />

        <div className="relative z-10 container pt-32 pb-12">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px w-8 bg-primary/60" />
            <span className="font-mono text-[11px] tracking-[0.25em] text-primary uppercase">
              {'// ACCESSING TRANSMISSION ARCHIVE'}
            </span>
          </div>
          <h1 className="mb-4 font-heading text-5xl font-bold tracking-tight text-foreground uppercase md:text-7xl">
            Transmissions
          </h1>
          <p className="max-w-xl font-mono text-sm text-muted-foreground">
            Field reports, production logs, and dispatches from deep inside The
            Second Messenger universe.
          </p>

          {posts.totalDocs > 0 && (
            <div className="mt-6 flex items-center gap-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              <div className="flex items-center gap-2">
                <span className="text-primary">{posts.totalDocs}</span>
                <span>total entries</span>
              </div>
              <div className="h-4 w-px bg-border/50" />
              <div className="flex items-center gap-2">
                <span className="text-primary">{categories.length}</span>
                <span>categories</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom glow line */}
        <div className="absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container py-12">
        <BlogArchive initialPosts={posts.docs} categories={categories} />
      </div>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Transmissions | The Second Messenger',
    description:
      'Field reports, production logs, and dispatches from deep inside The Second Messenger universe.',
  }
}
