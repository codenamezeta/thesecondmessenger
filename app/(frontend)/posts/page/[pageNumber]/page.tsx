import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PostCard } from '@/components/PostCard'
import type { Category } from '@/payload-types'
// import PageClient from './page.client'

export const revalidate = 600

const POSTS_PER_PAGE = 12

type Args = {
  params: Promise<{
    pageNumber: string
  }>
}

export default async function PostsPageN({ params: paramsPromise }: Args) {
  const { pageNumber } = await paramsPromise
  const sanitizedPage = Number(pageNumber)

  if (!Number.isInteger(sanitizedPage) || sanitizedPage < 1) notFound()

  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: POSTS_PER_PAGE,
    page: sanitizedPage,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      _status: { equals: 'published' },
    },
  })

  if (sanitizedPage > posts.totalPages) notFound()

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
        <div
          className="pointer-events-none absolute top-6 left-6 h-8 w-8 border-t-2 border-l-2 border-primary/30"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-6 right-6 h-8 w-8 border-t-2 border-r-2 border-primary/30"
          aria-hidden
        />
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
          <p className="font-mono text-sm text-muted-foreground">
            Page {sanitizedPage} of {posts.totalPages} — showing entries{' '}
            {(sanitizedPage - 1) * POSTS_PER_PAGE + 1}–
            {Math.min(sanitizedPage * POSTS_PER_PAGE, posts.totalDocs)} of{' '}
            {posts.totalDocs}
          </p>

          {categories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/posts?category=${cat.slug}`}
                  className="border border-border/50 bg-card/10 px-3 py-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="absolute right-0 bottom-0 left-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />
      </div>

      <div className="container py-12">
        {/* Post grid */}
        <ol className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.docs.map((post) => (
            <li key={post.id} className="h-full">
              <PostCard post={post} />
            </li>
          ))}
        </ol>

        {/* Pagination */}
        {posts.totalPages > 1 && (
          <nav
            className="mt-12 flex items-center justify-between border-t border-border/50 pt-8"
            aria-label="Pagination"
          >
            <div>
              {posts.hasPrevPage && (
                <Link
                  href={
                    sanitizedPage === 2
                      ? '/posts'
                      : `/posts/page/${sanitizedPage - 1}`
                  }
                  className="flex items-center gap-2 border border-border/50 bg-card/10 px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
                >
                  <ChevronLeft size={14} />
                  Prev Page
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              {Array.from({ length: posts.totalPages }, (_, i) => i + 1).map(
                (p) => (
                  <Link
                    key={p}
                    href={p === 1 ? '/posts' : `/posts/page/${p}`}
                    className={
                      p === sanitizedPage
                        ? 'border border-primary/60 bg-primary/10 px-3 py-1.5 text-primary'
                        : 'border border-border/30 px-3 py-1.5 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary'
                    }
                    aria-current={p === sanitizedPage ? 'page' : undefined}
                  >
                    {p}
                  </Link>
                ),
              )}
            </div>

            <div>
              {posts.hasNextPage && (
                <Link
                  href={`/posts/page/${sanitizedPage + 1}`}
                  className="flex items-center gap-2 border border-border/50 bg-card/10 px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
                >
                  Next Page
                  <ChevronRight size={14} />
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </main>
  )
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { pageNumber } = await paramsPromise
  return {
    title: `Transmissions — Page ${pageNumber} | The Second Messenger`,
    description:
      'Field reports, production logs, and dispatches from The Second Messenger.',
  }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const { totalDocs } = await payload.count({
    collection: 'posts',
    overrideAccess: false,
  })

  const totalPages = Math.ceil(totalDocs / POSTS_PER_PAGE)
  const pages: { pageNumber: string }[] = []

  for (let i = 1; i <= totalPages; i++) {
    pages.push({ pageNumber: String(i) })
  }

  return pages
}
