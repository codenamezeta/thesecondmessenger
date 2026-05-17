import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, User, ChevronRight, Tag } from 'lucide-react'
import type { Post, Media, Category } from '@/payload-types'
import { cn } from '@/utilities/ui'

interface PostHeroProps {
  post: Post
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
    const wordCount = text.split(/\s+/).length
    return Math.max(1, Math.round(wordCount / 200))
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

export const PostHero = ({ post }: PostHeroProps) => {
  const heroImageUrl = (post.heroImage as Media)?.url
  const publishDate = post.publishedAt ? formatDate(post.publishedAt) : null
  const readTime = estimateReadTime(post)
  const primaryCategory = post.categories?.[0]
    ? getCategoryTitle(post.categories[0] as Category)
    : null
  const authors = post.populatedAuthors ?? []

  return (
    <section
      className={cn(
        'relative w-full overflow-hidden',
        heroImageUrl ? 'min-h-[60vh] md:min-h-[70vh]' : 'pb-12',
      )}
    >
      {/* Background: blurred hero image */}
      {heroImageUrl && (
        <>
          <div className="pointer-events-none absolute inset-0 z-0">
            <Image
              src={heroImageUrl}
              alt=""
              fill
              className="object-cover opacity-50 blur-xs saturate-75"
              priority
              sizes="100vw"
            />
          </div>
          {/* Multi-layer gradient overlay */}
          <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-t from-background to-transparent" />
          <div className="pointer-events-none absolute inset-0 z-1 bg-linear-to-r from-background to-transparent" />
        </>
      )}

      {/* Corner brackets decoration */}
      <div
        className="pointer-events-none absolute top-6 left-6 z-3 h-8 w-8 border-t-2 border-l-2 border-primary/30"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-6 right-6 z-3 h-8 w-8 border-t-2 border-r-2 border-primary/30"
        aria-hidden
      />
      {/* <div
        className="pointer-events-none absolute bottom-0 left-6 z-3 h-8 w-8 border-b-2 border-l-2 border-primary/20"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute right-6 bottom-0 z-3 h-8 w-8 border-r-2 border-b-2 border-primary/20"
        aria-hidden
      /> */}

      <div className="relative z-10 container flex min-h-[60vh] flex-col justify-end py-12 md:min-h-[70vh] md:py-20">
        <div className="max-w-4xl space-y-6">
          {/* Breadcrumb */}
          <nav
            className="flex items-center gap-1 font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
            aria-label="Breadcrumb"
          >
            <Link
              href="/posts"
              className="transition-colors hover:text-primary"
            >
              Transmissions
            </Link>
            <ChevronRight size={10} aria-hidden />
            {primaryCategory ? (
              <Link
                href={`/posts?category=${primaryCategory.slug}`}
                className="text-primary transition-colors hover:text-primary/80"
              >
                {primaryCategory.title}
              </Link>
            ) : (
              <span className="text-foreground/50">Article</span>
            )}
          </nav>

          {/* Category HUD label */}
          {primaryCategory && (
            <div className="flex items-center gap-2">
              <Tag size={10} className="text-primary" aria-hidden />
              <span className="font-mono text-[11px] tracking-[0.25em] text-primary uppercase">
                {primaryCategory.title}
              </span>
              <div className="h-px max-w-[120px] flex-1 bg-primary/30" />
            </div>
          )}

          {/* Title */}
          <h1 className="font-heading text-4xl leading-none font-bold tracking-tight text-foreground uppercase drop-shadow-[0_2px_20px_hsl(var(--primary)/0.2)] md:text-5xl lg:text-6xl">
            {post.title}
          </h1>

          {/* Description */}
          {post.meta?.description && (
            <p className="max-w-2xl border-l-2 border-primary/40 pl-4 font-body text-base leading-relaxed text-muted-foreground md:text-lg">
              {post.meta.description}
            </p>
          )}

          {/* Meta strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/50 pt-4 font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {authors.length > 0 && (
              <div className="flex items-center gap-2">
                <User size={12} className="text-primary/60" aria-hidden />
                <span>{authors.map((a) => a.name).join(', ')}</span>
              </div>
            )}
            {publishDate && (
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-primary/60" aria-hidden />
                <span>{publishDate}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock size={12} className="text-primary/60" aria-hidden />
              <span>{readTime} min read</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
