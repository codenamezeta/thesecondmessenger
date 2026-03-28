'use client'
import { X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { Media } from '@/payload-types'

type SearchResult = {
  id: string
  slug: string
  title: string
  meta: {
    title?: string
    description?: string
    image?: (number | null) | Media
  }
  doc: {
    relationTo: string
    value: string
  }
}

export const SearchModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const debouncedQuery = useDebounce(query, 300)
  const router = useRouter()

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchParams = new URLSearchParams()
        searchParams.set('where[or][0][meta.title][like]', debouncedQuery)
        searchParams.set('where[or][1][slug][like]', debouncedQuery)
        searchParams.set('where[or][2][title][like]', debouncedQuery)
        searchParams.set('where[or][3][body][like]', debouncedQuery)
        searchParams.set('limit', '10')

        const res = await fetch(`/api/search?${searchParams.toString()}`)
        if (res.ok) {
          const data = await res.json()
          setResults(
            (data.docs || []).filter(
              (r: SearchResult) => r.doc && r.doc.relationTo !== 'releases',
            ),
          )
        }
      } catch (e) {
        console.error('Search error:', e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const handleSelect = (result: SearchResult) => {
    onClose()
    if (!result.doc) return // Safeguard
    const { relationTo } = result.doc
    const slug = result.slug

    if (relationTo === 'pages') {
      if (slug === 'home') router.push('/')
      else router.push(`/${slug}`)
    } else if (relationTo === 'posts') {
      router.push(`/posts/${slug}`)
    } else if (relationTo === 'songs') {
      router.push(`/music/${slug}`)
    } else {
      router.push(`/${slug}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center bg-black/80 px-4 pt-32 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl animate-in rounded-lg border border-primary/30 bg-card shadow-2xl duration-200 zoom-in-95 fade-in">
        {/* Header */}
        <div className="flex items-center border-b border-white/10 p-4">
          <Search className="mr-4 h-6 w-6 text-primary" />
          <input
            name="search"
            id="search"
            type="text"
            placeholder="SEARCH DATABASE..."
            className="flex-1 border-none bg-transparent font-heading text-xl tracking-widest text-white uppercase outline-none placeholder:text-gray-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button
            onClick={onClose}
            className="ml-4 text-muted hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] min-h-[200px] overflow-y-auto p-4">
          {isLoading ? (
            <p className="mt-10 text-center font-mono text-sm text-gray-600">
              SEARCHING...
            </p>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="group cursor-pointer rounded border border-transparent p-3 transition hover:border-primary/20 hover:bg-white/5"
                >
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-xs font-bold tracking-wider text-primary uppercase">
                      {result.doc?.relationTo?.slice(0, -1) || 'UNKNOWN'}{' '}
                      {/* Remove 's' roughly */}
                    </p>
                  </div>
                  <p className="font-heading text-lg tracking-wide text-white uppercase transition-colors group-hover:text-primary">
                    {result.meta?.title || result.title || result.slug}
                  </p>
                  {result.meta?.description && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">
                      {result.meta.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <p className="mt-10 text-center font-mono text-sm text-gray-600">
              NO RESULTS FOUND
            </p>
          ) : (
            <p className="mt-10 text-center font-mono text-sm text-gray-600">
              WAITING FOR INPUT...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/30 p-2 px-4 text-right">
          <span className="font-mono text-[10px] text-gray-500">
            ESC TO CLOSE
          </span>
        </div>
      </div>
    </div>
  )
}
