'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  LayoutGrid,
  List,
  Columns2,
  Search,
  ArrowUpDown,
  FileText,
  ArrowRight,
  Tag,
} from 'lucide-react'
// import { cn } from '@/utilities/ui'
import type { Post, Media, Category } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PostCard } from './PostCard'

type ViewMode = 'bento' | 'grid' | 'list'
type SortMode = 'newest' | 'oldest' | 'az' | 'za'

interface BlogArchiveProps {
  initialPosts: Post[]
  categories: { id: number; title: string; slug: string }[]
}

function getCategoryTitle(
  cat: number | Category | null | undefined,
): string | null {
  if (!cat || typeof cat === 'number') return null
  return cat.title || null
}

function getCategoryId(
  cat: number | Category | null | undefined,
): number | null {
  if (!cat) return null
  if (typeof cat === 'number') return cat
  return cat.id
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function estimateReadTime(post: Post): string {
  try {
    const text = JSON.stringify(post.content)
    const wordCount = text.split(/\s+/).length
    const minutes = Math.max(1, Math.round(wordCount / 200))
    return `${minutes} MIN`
  } catch {
    return '3 MIN'
  }
}

function BlogArchiveListItem({ post }: { post: Post }) {
  const heroUrl = (post.heroImage as Media)?.url
  const category = post.categories?.[0]
    ? getCategoryTitle(post.categories[0] as Category)
    : null
  const publishDate = post.publishedAt ? formatDate(post.publishedAt) : null
  const readTime = estimateReadTime(post)

  return (
    <li>
      <Link
        href={`/posts/${post.slug}`}
        className="group flex items-center gap-6 border-b border-border/50 p-4 transition-colors hover:bg-card/40"
      >
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-border/50 bg-muted/20 transition-transform duration-500 group-hover:scale-105">
          {heroUrl ? (
            <Image
              src={heroUrl}
              fill
              alt={post.title}
              className="object-cover saturate-75 transition-all duration-500 group-hover:saturate-100"
            />
          ) : (
            <FileText
              size={24}
              className="text-muted-foreground/40"
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          {category && (
            <span className="mb-1 block font-mono text-[9px] tracking-widest text-primary uppercase">
              {category}
            </span>
          )}
          <h3 className="truncate font-heading text-base text-foreground uppercase transition-colors group-hover:text-primary">
            {post.title}
          </h3>
          {post.meta?.description && (
            <p className="mt-0.5 truncate font-body text-xs text-muted-foreground">
              {post.meta.description}
            </p>
          )}
        </div>

        <div className="hidden shrink-0 text-right md:block">
          <div className="font-mono text-xs text-muted-foreground">
            {publishDate ?? '—'}
          </div>
          <div className="mt-0.5 font-mono text-[9px] tracking-widest text-primary/60 uppercase">
            {readTime}
          </div>
        </div>

        <ArrowRight
          size={16}
          className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
          aria-hidden
        />
      </Link>
    </li>
  )
}

function BlogArchiveBentoLayout({ posts }: { posts: Post[] }) {
  const [hero, ...rest] = posts

  return (
    <div className="grid auto-rows-auto grid-cols-1 gap-4 lg:grid-cols-12 lg:grid-rows-[auto]">
      {hero && (
        <div className="lg:col-span-7">
          <PostCard post={hero} featured />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-rows-2">
        {rest.slice(0, 4).map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {rest.length > 4 && (
        <div className="col-span-full grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(4).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

export const BlogArchive = ({ initialPosts, categories }: BlogArchiveProps) => {
  const [view, setView] = useState<ViewMode>('bento')
  const [sort, setSort] = useState<SortMode>('newest')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredPosts = useMemo(() => {
    let data = [...initialPosts]

    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter((p) => {
        if (p.title.toLowerCase().includes(q)) return true
        if (p.meta?.description?.toLowerCase().includes(q)) return true
        if (
          p.categories?.some((c) => {
            const title = getCategoryTitle(c as Category)
            return title?.toLowerCase().includes(q)
          })
        )
          return true
        if (p.populatedAuthors?.some((a) => a.name?.toLowerCase().includes(q)))
          return true
        return false
      })
    }

    if (categoryFilter !== 'all') {
      const filterId = Number(categoryFilter)
      data = data.filter((p) =>
        p.categories?.some((c) => getCategoryId(c as Category) === filterId),
      )
    }

    data.sort((a, b) => {
      switch (sort) {
        case 'az':
          return a.title.localeCompare(b.title)
        case 'za':
          return b.title.localeCompare(a.title)
        case 'oldest': {
          const dA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return dA - dB
        }
        case 'newest':
        default: {
          const dA = a.publishedAt ? new Date(a.publishedAt).getTime() : 0
          const dB = b.publishedAt ? new Date(b.publishedAt).getTime() : 0
          return dB - dA
        }
      }
    })

    return data
  }, [initialPosts, search, sort, categoryFilter])

  return (
    <section className="space-y-8">
      <div className="space-y-4 border border-border/30 bg-secondary p-4">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div className="relative max-w-96 min-w-64 flex-auto">
            <Label htmlFor="blog-search" className="sr-only">
              Search posts by title, description, category, or author
            </Label>
            <Search
              size={16}
              className="pointer-events-none absolute top-1/2 left-3 z-10 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="blog-search"
              type="search"
              placeholder="Search by title, category, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              className="pl-9"
            />
          </div>

          <div
            className="flex items-center gap-1 border border-border/30 bg-input p-1"
            role="group"
            aria-label="Blog layout"
          >
            <Button
              type="button"
              variant={view === 'bento' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'bento'}
              aria-label="Bento view"
              onClick={() => setView('bento')}
            >
              <Columns2 className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'grid'}
              aria-label="Grid view"
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="size-4" />
            </Button>
            <Button
              type="button"
              variant={view === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              className="min-h-11 min-w-11 shrink-0"
              aria-pressed={view === 'list'}
              aria-label="List view"
              onClick={() => setView('list')}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border/30 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="font-mono text-xs text-muted-foreground uppercase"
              aria-hidden
            >
              Filter:
            </span>

            {categories.length > 0 && (
              <div className="flex flex-col gap-1">
                <Label htmlFor="blog-category" className="sr-only">
                  Category filter
                </Label>
                <Select
                  value={categoryFilter}
                  onValueChange={(v) => setCategoryFilter(v)}
                >
                  <SelectTrigger
                    id="blog-category"
                    size="sm"
                    className="min-w-44 text-xs"
                  >
                    <Tag className="size-3" aria-hidden />
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <ArrowUpDown
              size={14}
              className="shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="flex flex-col gap-1">
              <Label htmlFor="blog-sort" className="sr-only">
                Sort order
              </Label>
              <Select
                value={sort}
                onValueChange={(v) => setSort(v as SortMode)}
              >
                <SelectTrigger
                  id="blog-sort"
                  size="sm"
                  className="min-w-40 border-0 bg-transparent text-xs font-semibold tracking-wide uppercase shadow-none focus-visible:ring-offset-0"
                >
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="az">A – Z</SelectItem>
                  <SelectItem value="za">Z – A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
          <span className="text-primary">{filteredPosts.length}</span>{' '}
          {filteredPosts.length === 1 ? 'TRANSMISSION' : 'TRANSMISSIONS'}{' '}
          RETRIEVED
        </p>
        {(search || categoryFilter !== 'all') && (
          <button
            type="button"
            onClick={() => {
              setSearch('')
              setCategoryFilter('all')
            }}
            className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            CLEAR FILTERS
          </button>
        )}
      </div>

      {filteredPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-border/50 py-20 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
            <Search size={28} />
          </div>
          <h3 className="font-heading text-xl tracking-widest text-foreground uppercase">
            No Transmissions Found
          </h3>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Adjust search parameters to retrieve signals.
          </p>
        </div>
      ) : view === 'bento' ? (
        <BlogArchiveBentoLayout posts={filteredPosts} />
      ) : view === 'grid' ? (
        <ol className="grid auto-rows-fr grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <li key={post.id} className="h-full">
              <PostCard post={post} />
            </li>
          ))}
        </ol>
      ) : (
        <ol className="flex flex-col border-t border-border/50">
          {filteredPosts.map((post) => (
            <BlogArchiveListItem key={post.id} post={post} />
          ))}
        </ol>
      )}

      {filteredPosts.length > 0 && (
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border/30" />
          <span className="font-mono text-[9px] tracking-widest text-muted-foreground uppercase">
            END OF LOG — {filteredPosts.length} ENTRIES
          </span>
          <div className="h-px flex-1 bg-border/30" />
        </div>
      )}
    </section>
  )
}
