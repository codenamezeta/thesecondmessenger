'use client'

import React, { useState } from 'react'
import { Button, toast, useDocumentInfo } from '@payloadcms/ui'
import { RefreshCwIcon } from 'lucide-react'

/**
 * Sidebar control to run CMS → MP3/FLAC tag sync immediately for the open Song,
 * without waiting for the daily Vercel Cron.
 */
export function RunTagSyncButton() {
  const { id } = useDocumentInfo()
  const [running, setRunning] = useState(false)

  const handleRun = async () => {
    if (!id) {
      toast.error('Save the song before running tag sync.')
      return
    }

    setRunning(true)
    try {
      const res = await fetch('/api/admin/sync-audio-tags', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: Number(id), force: true }),
      })

      const data = (await res.json()) as {
        ok?: boolean
        error?: string
        result?: {
          status: string
          reason?: string
          error?: string
          bytesWritten?: number
        }
        tagSyncError?: string | null
      }

      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }

      const status = data.result?.status
      if (status === 'synced') {
        const kb = data.result?.bytesWritten
          ? ` (${Math.round(data.result.bytesWritten / 1024)} KB)`
          : ''
        toast.success(`Tags written${kb}.`)
      } else if (status === 'skipped') {
        toast.info(data.result?.reason || 'Nothing to sync.')
      } else {
        toast.error(
          data.result?.error || data.tagSyncError || 'Tag sync failed.',
        )
      }

      // Reload so read-only status fields pick up the DB write.
      window.location.reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Tag sync failed.')
      setRunning(false)
    }
  }

  return (
    <div style={{ padding: '0.5rem 0 0.75rem' }}>
      <Button
        type="button"
        buttonStyle="secondary"
        onClick={handleRun}
        disabled={running || !id}
      >
        <span
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCwIcon size={14} />
          {running ? 'Writing tags…' : 'Run Tag Sync Now'}
        </span>
      </Button>
      <p
        style={{
          margin: '0.5rem 0 0',
          fontSize: '0.75rem',
          opacity: 0.7,
          lineHeight: 1.4,
        }}
      >
        Writes CMS metadata into attached MP3/FLAC masters immediately. Save
        the song first if you just changed fields.
      </p>
    </div>
  )
}
