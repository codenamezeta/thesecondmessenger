import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Tag, ArrowRight, FileText } from 'lucide-react'
import { cn } from '@/utilities/ui'
import type { Post, Media, Category } from '@/payload-types'

interface PostCardProps {
  post: Post
  className?: string
  featured?: boolean
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadTime(post: Post): string {
  // Rough estimate from content nodes
  try {
    const text = JSON.stringify(post.content)
    const wordCount = text.split(/\s+/).length
    const minutes = Math.max(1, Math.round(wordCount / 200))
    return `${minutes} MIN READ`
  } catch {
    return '3 MIN READ'
  }
}

function getCategoryTitle(cat: number | Category | null | undefined): string | null {
  if (!cat || typeof cat === 'number') return null
  return cat.title || null
}

/** FNV-1a 32-bit — deterministic fingerprint for ambient gradient (SSR-safe). */
function fnv1a32(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const AMBIENT_GRADIENTS = [
  'from-primary/20 via-chart-1/10 to-transparent',
  'from-chart-2/20 via-primary/10 to-transparent',
  'from-chart-3/18 via-chart-1/12 to-transparent',
  'from-primary/15 via-chart-4/15 to-transparent',
  'from-chart-5/20 via-primary/12 to-transparent',
] as const

export const PostCard = ({ post, className, featured = false }: PostCardProps) => {
  const heroImageUrl = (post.heroImage as Media)?.url
  const category = post.categories?.[0] ? getCategoryTitle(post.categories[0] as Category) : null
  const publishDate = post.publishedAt ? formatDate(post.publishedAt) : null
  const readTime = estimateReadTime(post)
  const href = `/posts/${post.slug}`

  const accentIdx = fnv1a32(post.slug + post.title) % AMBIENT_GRADIENTS.length
  const accentGradient = AMBIENT_GRADIENTS[accentIdx]
  const foilDeg = (fnv1a32(post.title) % 7) - 3

  return (
    <Link
      href={href}
      className={cn(
        'group relative block h-full bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      <span className="sr-only">Open post: {post.title}</span>
      <div
        className={cn(
          'relative flex h-full flex-col overflow-hidden border border-border/60 bg-card/30 shadow-sm backdrop-blur-md transition-[transform,box-shadow,border-color] duration-500 ease-out',
          'group-hover:-translate-y-1 group-hover:border-primary/40 group-hover:shadow-[0_20px_50px_-20px] group-hover:shadow-primary/20',
          featured && 'lg:flex-row',
        )}
      >
        {/* Ambient gradient plane */}
        <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden>
          <div
            className={cn('absolute -inset-[40%] bg-linear-to-br mix-blend-soft-light', accentGradient)}
            style={{ transform: `rotate(${foilDeg}deg)` }}
          />
        </div>

        {/* Specular sweep on hover */}
        <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
          <div className="absolute inset-0 -translate-x-full skew-x-12 bg-linear-to-r from-transparent via-foreground/8 to-transparent opacity-0 transition-[transform,opacity] duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />
        </div>

        {/* Hero image */}
        <div
          className={cn(
            'relative z-10 overflow-hidden border-b border-border/80 bg-muted/40 transition-colors duration-500 group-hover:border-primary/25',
            featured ? 'aspect-video lg:aspect-auto lg:w-1/2 lg:border-b-0 lg:border-r' : 'aspect-video w-full',
          )}
        >
          {heroImageUrl ? (
            <Image
              src={heroImageUrl}
              alt={post.title}
              fill
              className="object-cover opacity-90 saturate-[0.85] transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100 group-hover:saturate-100"
              sizes={featured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/20">
              <FileText size={48} strokeWidth={1} aria-hidden />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-background/80 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-background/90 to-transparent" />

          {/* HUD overlays */}
          <div className="absolute top-2 left-2 right-2 z-30 flex items-start justify-between gap-2">
            {category && (
              <div className="rounded-none border border-primary/50 bg-background/75 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest text-primary uppercase backdrop-blur-md">
                {category}
              </div>
            )}
            {publishDate && (
              <div className="ml-auto flex items-center gap-1 rounded-none border border-border/70 bg-background/70 px-1.5 py-0.5 font-mono text-[8px] tracking-widest text-muted-foreground uppercase backdrop-blur-md">
                <Calendar className="size-2.5" aria-hidden />
                {publishDate}
              </div>
            )}
          </div>
        </div>

        {/* Data panel */}
        <div
          className={cn(
            'relative z-10 flex flex-1 flex-col bg-linear-to-b from-card/90 to-card/50 p-4',
            featured && 'lg:justify-center lg:p-8',
          )}
        >
          {/* Scanline texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, var(--color-border) 2px, var(--color-border) 3px)`,
            }}
            aria-hidden
          />

          <div className="relative z-10 flex h-full flex-col gap-3">
            {/* Category label (if no image space) */}
            {!heroImageUrl && category && (
              <div className="flex items-center gap-1.5">
                <Tag className="size-3 text-primary" aria-hidden />
                <span className="font-mono text-[10px] tracking-widest text-primary uppercase">{category}</span>
              </div>
            )}

            <h3
              className={cn(
                'font-heading leading-tight uppercase transition-colors',
                featured ? 'text-2xl tracking-wide md:text-3xl' : 'text-lg tracking-wide',
                'text-foreground group-hover:text-primary',
              )}
            >
              {post.title}
            </h3>

            {post.meta?.description && (
              <p className="line-clamp-2 border-l border-primary/30 pl-3 font-body text-sm leading-relaxed text-muted-foreground">
                {post.meta.description}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between gap-2 border-t border-border/50 pt-3">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
                {post.populatedAuthors?.[0]?.name && (
                  <span className="text-foreground/70">{post.populatedAuthors[0].name}</span>
                )}
                {post.populatedAuthors?.[0]?.name && publishDate && (
                  <span className="text-border" aria-hidden>|</span>
                )}
                {publishDate && <span>{publishDate}</span>}
                <span className="text-border" aria-hidden>|</span>
                <span className="text-primary/80">{readTime}</span>
              </div>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-primary"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
