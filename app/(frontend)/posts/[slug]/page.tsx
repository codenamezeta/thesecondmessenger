import type { Metadata } from 'next'
import Link from 'next/link'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { draftMode } from 'next/headers'
import { cache } from 'react'
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag, User } from 'lucide-react'

import type { Post, Category } from '@/payload-types'
import { PostHero } from '@/heros/PostHero'
import { PayloadRedirects } from '@/components/PayloadRedirects'
import RichText from '@/components/RichText'
import { PostCard } from '@/components/PostCard'
import { generateMeta } from '@/utilities/generateMeta'
import { Separator } from '@/components/ui/separator'
// import PageClient from './page.client'

type Args = {
  params: Promise<{ slug?: string }>
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function estimateReadTime(post: Post): number {
  try {
    const text = JSON.stringify(post.content)
    return Math.max(1, Math.round(text.split(/\s+/).length / 200))
  } catch {
    return 3
  }
}

function getCategoryTitle(
  cat: number | Category | null | undefined,
): { title: string; slug: string } | null {
  if (!cat || typeof cat === 'number') return null
  return { title: cat.title, slug: cat.slug }
}

export async function generateStaticParams() {
  const payload = await getPayload({ config: configPromise })
  const posts = await payload.find({
    collection: 'posts',
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: { slug: true },
  })
  return posts.docs.map(({ slug }) => ({ slug }))
}

export default async function PostPage({ params: paramsPromise }: Args) {
  await draftMode()
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const url = '/posts/' + decodedSlug
  const post = await queryPostBySlug({ slug: decodedSlug })

  if (!post) return <PayloadRedirects url={url} />

  const payload = await getPayload({ config: configPromise })

  // Related posts by matching categories
  const categoryIds = (post.categories ?? [])
    .map((c) => (typeof c === 'number' ? c : c.id))
    .filter(Boolean)

  const relatedPosts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 3,
    overrideAccess: false,
    where: {
      and: [
        { id: { not_equals: post.id } },
        ...(categoryIds.length > 0
          ? [{ categories: { in: categoryIds } }]
          : []),
        { _status: { equals: 'published' } },
      ],
    },
  })

  const publishDate = post.publishedAt ? formatDate(post.publishedAt) : null
  const readTime = estimateReadTime(post)
  const authors = post.populatedAuthors ?? []
  const categories = (post.categories ?? [])
    .map((c) => getCategoryTitle(c as Category))
    .filter(Boolean) as { title: string; slug: string }[]

  return (
    <article className="min-h-screen">
      {/* <PageClient /> */}

      <PayloadRedirects disableNotFound url={url} />

      <PostHero post={post} />

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Main content */}
          <main className="lg:col-span-8">
            {/* Article body */}
            <div className="rounded-none border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-10">
              {/* Scanline texture */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-border) 2px, var(--color-border) 3px)`,
                }}
                aria-hidden
              />

              <RichText className="rich-text max-w-none" data={post.content} />
            </div>

            {/* Related posts */}
            {relatedPosts.docs.length > 0 && (
              <section className="mt-12">
                <Separator className="mb-8 opacity-30" />
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border/40" />
                  <span className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
                    {'// CONVERGENT SIGNALS'}
                  </span>
                  <div className="h-px flex-1 bg-border/40" />
                </div>
                <h2 className="mb-6 font-heading text-2xl tracking-wide text-foreground uppercase">
                  Related Transmissions
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedPosts.docs.map((related) => (
                    <PostCard key={related.id} post={related} />
                  ))}
                </div>
              </section>
            )}

            {/* Back link */}
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/posts"
                className="group flex items-center gap-2 border border-border/50 bg-card/10 px-4 py-2 font-mono text-xs tracking-widest text-muted-foreground uppercase backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
              >
                <ArrowLeft
                  size={14}
                  className="transition-transform group-hover:-translate-x-1"
                  aria-hidden
                />
                All Transmissions
              </Link>
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-4 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
            {/* Article meta card */}
            <div className="border border-border/50 bg-card/20 backdrop-blur-sm">
              <div className="border-b border-border/50 px-4 py-3">
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                  Transmission Data
                </span>
              </div>
              <div className="space-y-3 p-4">
                {authors.length > 0 && (
                  <div className="flex items-start gap-3">
                    <User
                      size={14}
                      className="mt-0.5 shrink-0 text-primary/60"
                      aria-hidden
                    />
                    <div>
                      <p className="mb-0.5 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                        Author
                      </p>
                      <p className="font-body text-sm text-foreground">
                        {authors.map((a) => a.name).join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {publishDate && (
                  <div className="flex items-start gap-3">
                    <Calendar
                      size={14}
                      className="mt-0.5 shrink-0 text-primary/60"
                      aria-hidden
                    />
                    <div>
                      <p className="mb-0.5 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                        Published
                      </p>
                      <p className="font-body text-sm text-foreground">
                        {publishDate}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Clock
                    size={14}
                    className="mt-0.5 shrink-0 text-primary/60"
                    aria-hidden
                  />
                  <div>
                    <p className="mb-0.5 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                      Read Time
                    </p>
                    <p className="font-body text-sm text-foreground">
                      {readTime} minute{readTime !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="border border-border/50 bg-card/20 backdrop-blur-sm">
                <div className="border-b border-border/50 px-4 py-3">
                  <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                    Categories
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 p-4">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/posts?category=${cat.slug}`}
                      className="flex items-center gap-1.5 border border-border/50 bg-background/40 px-3 py-1.5 font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      <Tag size={9} aria-hidden />
                      {cat.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation between posts */}
            <div className="border border-border/50 bg-card/20 backdrop-blur-sm">
              <div className="border-b border-border/50 px-4 py-3">
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase">
                  More Transmissions
                </span>
              </div>
              <div className="p-4">
                <Link
                  href="/posts"
                  className="group flex items-center justify-between border border-border/40 bg-background/30 p-3 transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors group-hover:text-primary">
                    View Full Archive
                  </span>
                  <ArrowRight
                    size={12}
                    className="text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
                    aria-hidden
                  />
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export async function generateMetadata({
  params: paramsPromise,
}: Args): Promise<Metadata> {
  const { slug = '' } = await paramsPromise
  const decodedSlug = decodeURIComponent(slug)
  const post = await queryPostBySlug({ slug: decodedSlug })
  return generateMeta({ doc: post })
}

const queryPostBySlug = cache(async ({ slug }: { slug: string }) => {
  const { isEnabled: isDraft } = await draftMode()
  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'posts',
    draft: isDraft,
    depth: 2,
    limit: 1,
    overrideAccess: isDraft,
    pagination: false,
    where: {
      slug: { equals: slug },
    },
  })

  return result.docs?.[0] || null
})
