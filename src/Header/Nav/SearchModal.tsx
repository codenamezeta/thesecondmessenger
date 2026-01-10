'use client'
import { X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [query, setQuery] = useState('')

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

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
          />
          <button onClick={onClose} className="text-muted hover:text-white ml-4">
            <X size={24} />
          </button>
        </div>

        {/* Results Area (Mockup for now) */}
        <div className="p-4 min-h-[200px] max-h-[60vh] overflow-y-auto">
          {query.length === 0 ? (
            <p className="text-gray-600 font-mono text-sm text-center mt-10">
              Waiting for input...
            </p>
          ) : (
            <div className="space-y-2">
              {/* Eventually you will map search results here */}
              <div className="p-3 hover:bg-white/5 cursor-pointer rounded border border-transparent hover:border-primary/20 transition">
                <p className="text-primary font-bold text-sm">SONG</p>
                <p className="text-white">Example Result for "{query}"</p>
              </div>
            </div>
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
