'use client'
import { X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'

type SearchResult = {
  id: string
  slug: string
  title: string
  meta: {
    title?: string
    description?: string
    image?: any
  }
  doc: {
    relationTo: string
    value: string
  }
}

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
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
            (data.docs || []).filter((r: SearchResult) => r.doc && r.doc.relationTo !== 'releases'),
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
      router.push(`/songs/${slug}`)
    } else {
      router.push(`/${slug}`)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-start justify-center pt-32 px-4">
      <div className="w-full max-w-2xl bg-card border border-primary/30 rounded-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center border-b border-white/10 p-4">
          <Search className="text-primary w-6 h-6 mr-4" />
          <input
            name="search"
            id="search"
            type="text"
            placeholder="SEARCH DATABASE..."
            className="flex-1 bg-transparent border-none outline-none text-xl font-heading text-white placeholder:text-gray-600 uppercase tracking-widest"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            autoComplete="off"
          />
          <button onClick={onClose} className="text-muted hover:text-white ml-4">
            <X size={24} />
          </button>
        </div>

        {/* Results Area */}
        <div className="p-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-600 font-mono text-sm text-center mt-10">SEARCHING...</p>
          ) : results.length > 0 ? (
            <div className="space-y-2">
              {results.map((result) => (
                <div
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="p-3 hover:bg-white/5 cursor-pointer rounded border border-transparent hover:border-primary/20 transition group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-primary font-bold text-xs uppercase tracking-wider">
                      {result.doc?.relationTo?.slice(0, -1) || 'UNKNOWN'} {/* Remove 's' roughly */}
                    </p>
                  </div>
                  <p className="text-white text-lg font-heading uppercase tracking-wide group-hover:text-primary transition-colors">
                    {result.meta?.title || result.title || result.slug}
                  </p>
                  {result.meta?.description && (
                    <p className="text-muted-foreground text-sm line-clamp-1">
                      {result.meta.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : query.length > 0 ? (
            <p className="text-gray-600 font-mono text-sm text-center mt-10">NO RESULTS FOUND</p>
          ) : (
            <p className="text-gray-600 font-mono text-sm text-center mt-10">
              WAITING FOR INPUT...
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-black/30 p-2 px-4 text-right">
          <span className="text-[10px] font-mono text-gray-500">ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  )
}
