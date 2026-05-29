'use client'

import React, { useState } from 'react'
import { Button, toast, useForm, useConfig } from '@payloadcms/ui'
import { CopyIcon, SparklesIcon } from 'lucide-react'

// Define the 11 tag relationship keys on the Song collection
const SONG_TAG_RELATIONSHIP_KEYS = [
  'genres',
  'subGenres',
  'activities',
  'themes',
  'moods',
  'production',
  'instruments',
  'gear',
  'arrangements',
  'influences',
  'otherTags',
] as const

type TagCategory = typeof SONG_TAG_RELATIONSHIP_KEYS[number]

export function TagCopyButtons() {
  const { getData } = useForm()
  const { config } = useConfig()
  const [copyingAll, setCopyingAll] = useState(false)
  const [copyingTopTen, setCopyingTopTen] = useState(false)

  const apiBase = `${config.serverURL}${config.routes.api}`.replace(/\/+$/, '')

  /**
   * Safe helper to extract and normalize relationship IDs from the live form state
   */
  const getSelectedIdsFromField = (data: Record<string, any>, fieldKey: TagCategory): string[] => {
    const rawVal = data[fieldKey]
    if (!rawVal) return []
    
    // Normalize relationship formats (could be array of strings/numbers or array of objects)
    const arrayVal = Array.isArray(rawVal) ? rawVal : [rawVal]
    return arrayVal
      .map((item) => {
        if (!item) return null
        if (typeof item === 'object') {
          return String(item.value || item.id || '')
        }
        return String(item)
      })
      .filter(Boolean) as string[]
  }

  /**
   * Fetches the tag documents from the Payload REST API based on IDs and returns them
   * ordered exactly as requested.
   */
  const fetchTagNames = async (tagIds: string[]): Promise<Record<string, string>> => {
    if (tagIds.length === 0) return {}

    try {
      // Query the tags collection using Payload's MongoDB-style query syntax
      // e.g. /api/tags?where[id][in]=id1,id2...&limit=100&depth=0
      const idsQuery = tagIds.map((id) => `where[id][in]=${encodeURIComponent(id)}`).join('&')
      const url = `${apiBase}/tags?${idsQuery}&limit=100&depth=0`
      
      const response = await fetch(url, { credentials: 'include' })
      if (!response.ok) {
        throw new Error(`API error (${response.status})`)
      }

      const data = await response.json()
      const tagMap: Record<string, string> = {}
      
      if (Array.isArray(data.docs)) {
        data.docs.forEach((doc: any) => {
          if (doc?.id && doc?.name) {
            tagMap[String(doc.id)] = String(doc.name)
          }
        })
      }
      return tagMap
    } catch (error) {
      console.error('Error fetching tags:', error)
      return {}
    }
  }

  /**
   * Action 1: Copy All Selected Tags
   */
  const handleCopyAll = async () => {
    const formData = getData()
    if (!formData) return

    setCopyingAll(true)
    try {
      // 1. Gather all selected IDs from all 11 fields
      const allIds: string[] = []
      const fieldIdMap: Record<TagCategory, string[]> = {} as any

      SONG_TAG_RELATIONSHIP_KEYS.forEach((key) => {
        const ids = getSelectedIdsFromField(formData, key)
        fieldIdMap[key] = ids
        allIds.push(...ids)
      })

      if (allIds.length === 0) {
        toast.error('No tags have been selected yet!')
        return
      }

      // 2. Fetch all selected tag names from the database
      const tagMap = await fetchTagNames(allIds)

      // 3. Map IDs to Names in the order defined by our ontology
      const orderedNames: string[] = []
      SONG_TAG_RELATIONSHIP_KEYS.forEach((key) => {
        fieldIdMap[key].forEach((id) => {
          const name = tagMap[id]
          if (name) orderedNames.push(name)
        })
      })

      if (orderedNames.length === 0) {
        toast.error('Could not find names for the selected tags.')
        return
      }

      // 4. Format and Copy to Clipboard
      const commaSeparatedList = orderedNames.join(', ')
      await navigator.clipboard.writeText(commaSeparatedList)
      
      toast.success(`Copied ${orderedNames.length} tags to clipboard!`)
    } catch (err) {
      toast.error('Failed to copy tags to clipboard.')
    } finally {
      setCopyingAll(false)
    }
  }

  /**
   * Action 2: Copy Top Ten Tags with Backfill Fallbacks
   */
  const handleCopyTopTen = async () => {
    const formData = getData()
    if (!formData) return

    setCopyingTopTen(true)
    try {
      // 1. Define our priority ontology layers
      const primarySlices: { key: TagCategory; limit: number }[] = [
        { key: 'subGenres', limit: 2 },
        { key: 'activities', limit: 2 },
        { key: 'themes', limit: 1 },
        { key: 'moods', limit: 1 },
        { key: 'instruments', limit: 1 },
        { key: 'gear', limit: 1 },
        { key: 'arrangements', limit: 1 },
        { key: 'influences', limit: 1 },
      ]

      const fallbackKeys: TagCategory[] = ['genres', 'production', 'otherTags']

      // Collect all selected IDs per category first
      const allSelectedByField: Record<TagCategory, string[]> = {} as any
      SONG_TAG_RELATIONSHIP_KEYS.forEach((key) => {
        allSelectedByField[key] = getSelectedIdsFromField(formData, key)
      })

      // We will assemble our top 10 IDs in this ordered array
      const topTenIds: string[] = []
      const addedIds = new Set<string>()

      const addIdToSelection = (id: string) => {
        if (topTenIds.length < 10 && !addedIds.has(id)) {
          topTenIds.push(id)
          addedIds.add(id)
        }
      }

      // === WAVE 1: Primary Capped Selections ===
      primarySlices.forEach((slice) => {
        const ids = allSelectedByField[slice.key] || []
        const capped = ids.slice(0, slice.limit)
        capped.forEach(addIdToSelection)
      })

      // === WAVE 2: Primary Overflows ===
      // If we still don't have 10, harvest remaining tags from the primary lists
      if (topTenIds.length < 10) {
        primarySlices.forEach((slice) => {
          const ids = allSelectedByField[slice.key] || []
          const overflow = ids.slice(slice.limit) // Grab everything past the cap
          overflow.forEach(addIdToSelection)
        })
      }

      // === WAVE 3: Dropped Category Pools (Fallback Backfills) ===
      // If we still don't have 10, backfill from genres, production, and otherTags
      if (topTenIds.length < 10) {
        fallbackKeys.forEach((key) => {
          const ids = allSelectedByField[key] || []
          ids.forEach(addIdToSelection)
        })
      }

      // 2. Short circuit if absolutely zero tags are selected anywhere
      if (topTenIds.length === 0) {
        toast.error('Select some tags on this song first!')
        return
      }

      // 3. Resolve database names only for the final selected top-ten IDs
      const tagMap = await fetchTagNames(topTenIds)

      // 4. Map the IDs back to their corresponding names
      const topTenNames = topTenIds
        .map((id) => tagMap[id])
        .filter(Boolean) // Filter out any names that failed to fetch

      if (topTenNames.length === 0) {
        toast.error('No matching tag names found in the database.')
        return
      }

      // 5. Format and Copy to Clipboard
      const commaSeparatedList = topTenNames.join(', ')
      await navigator.clipboard.writeText(commaSeparatedList)

      toast.success(
        topTenNames.length < 10
          ? `Copied all ${topTenNames.length} available tags!`
          : `Copied top 10 tags (with fallbacks)!`
      )
    } catch (err) {
      toast.error('Failed to copy top 10 tags.')
    } finally {
      setCopyingTopTen(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '1rem 0',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--theme-border, rgba(255, 255, 255, 0.1))',
      }}
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          type="button"
          buttonStyle="secondary"
          onClick={handleCopyAll}
          disabled={copyingAll || copyingTopTen}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <CopyIcon size={14} />
            {copyingAll ? 'Processing...' : 'Copy All Tags'}
          </span>
        </Button>
      </div>

      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button
          type="button"
          buttonStyle="primary"
          onClick={handleCopyTopTen}
          disabled={copyingAll || copyingTopTen}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <SparklesIcon size={14} />
            {copyingTopTen ? 'Processing...' : 'Copy Top 10 Tags'}
          </span>
        </Button>
      </div>
    </div>
  )
}
