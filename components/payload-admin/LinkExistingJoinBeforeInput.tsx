'use client'

import { getTranslation } from '@payloadcms/translations'
import {
  Banner,
  Button,
  toast,
  useAuth,
  useConfig,
  useDocumentInfo,
  useField,
  useListDrawer,
  useTranslation,
} from '@payloadcms/ui'
import type {
  ClientCollectionConfig,
  CollectionSlug,
  JoinFieldClientProps,
} from 'payload'
import React, { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function targetCollectionSlug(
  field: JoinFieldClientProps['field'],
): CollectionSlug {
  const c = field.collection
  return (Array.isArray(c) ? c[0] : c) as CollectionSlug
}

/** Payload `Playlist.tracks` / `Release.tracks` use numeric song IDs in this project. */
function normalizeRelationIds(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  const out: number[] = []
  for (const item of raw) {
    const n =
      typeof item === 'object' && item !== null && 'id' in item
        ? Number((item as { id: number | string }).id)
        : Number(item as number | string)
    if (Number.isFinite(n)) out.push(n)
  }
  return out
}

type JoinValue = {
  docs?: unknown[]
}

export function LinkExistingJoinBeforeInput(
  props: JoinFieldClientProps,
): React.ReactNode {
  const { field, path } = props
  const targetSlug = targetCollectionSlug(field)
  const tracksFieldName = field.on

  const { id: songId, docConfig } = useDocumentInfo()
  const { config } = useConfig()
  const { permissions } = useAuth()
  const { i18n } = useTranslation()

  const { value: joinValue } = useField<JoinValue>({
    path,
    potentiallyStalePath: path,
  })
  const linkedCount = Array.isArray(joinValue?.docs) ? joinValue.docs.length : 0

  const [linking, setLinking] = useState(false)
  const [toolbarHost, setToolbarHost] = useState<HTMLElement | null>(null)
  const toolbarMountRef = useRef<{ cleanup: () => void } | null>(null)

  const [ListDrawerComponent, , drawerControls] = useListDrawer({
    collectionSlugs: [targetSlug],
    selectedCollection: targetSlug,
  })
  const { closeDrawer, openDrawer } = drawerControls

  const canUpdateTarget = permissions?.collections?.[targetSlug]?.update

  const collectionConfig = config.collections.find(
    (c: ClientCollectionConfig) => c.slug === targetSlug,
  )
  const singularLabel = collectionConfig
    ? getTranslation(collectionConfig.labels.singular, i18n)
    : targetSlug
  const pluralLabel = collectionConfig
    ? getTranslation(collectionConfig.labels.plural, i18n)
    : targetSlug

  const apiBase = `${config.serverURL}${config.routes.api}`.replace(/\/+$/, '')

  const bindToolbarSlotRef = useCallback((el: HTMLSpanElement | null) => {
    toolbarMountRef.current?.cleanup()
    toolbarMountRef.current = null
    setToolbarHost(null)

    if (!el) return

    const tableRoot = el.closest('.relationship-table')
    const actions = tableRoot?.querySelector<HTMLElement>(
      ':scope > .relationship-table__header > .relationship-table__actions',
    )
    if (!actions) return

    let slot = actions.querySelector<HTMLElement>('[data-payload-link-existing-slot]')
    if (!slot) {
      slot = document.createElement('span')
      slot.dataset.payloadLinkExistingSlot = ''
      slot.style.display = 'contents'
      actions.insertBefore(slot, actions.firstChild)
    }

    toolbarMountRef.current = {
      cleanup: () => {
        slot.remove()
      },
    }
    setToolbarHost(slot)
  }, [])

  const handleSelect = useCallback(
    async (args: { doc: { id?: number | string } }) => {
      const docId = args.doc?.id
      if (docId === undefined || docId === null) return

      const sid = Number(songId)
      if (!Number.isFinite(sid)) {
        toast.error('Save the song first so it has an ID, then link it to playlists or releases.')
        return
      }

      setLinking(true)
      try {
        const getUrl = `${apiBase}/${targetSlug}/${encodeURIComponent(String(docId))}?depth=0`
        const getRes = await fetch(getUrl, { credentials: 'include' })
        if (!getRes.ok) {
          const errText = await getRes.text()
          throw new Error(errText || `Request failed (${getRes.status})`)
        }
        const fullDoc = (await getRes.json()) as Record<string, unknown>
        const existingIds = normalizeRelationIds(fullDoc[tracksFieldName])

        if (existingIds.includes(sid)) {
          toast.info(`This song is already on that ${singularLabel}.`)
          closeDrawer()
          return
        }

        const patchUrl = `${apiBase}/${targetSlug}/${encodeURIComponent(String(docId))}?depth=0`
        const patchRes = await fetch(patchUrl, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            [tracksFieldName]: [...existingIds, sid],
          }),
        })

        if (!patchRes.ok) {
          const errBody = await patchRes.text()
          throw new Error(errBody || `Update failed (${patchRes.status})`)
        }

        toast.success(`Added to ${singularLabel}.`)
        closeDrawer()
        // Join `RelationshipTable` keeps stale internal state after PATCH; `router.refresh()` is
        // not enough. Reload so the filtered join re-fetches from the API.
        window.location.reload()
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        toast.error(`Could not link ${singularLabel}: ${message}`)
      } finally {
        setLinking(false)
      }
    },
    [
      apiBase,
      closeDrawer,
      singularLabel,
      songId,
      targetSlug,
      tracksFieldName,
    ],
  )

  if (docConfig?.slug !== 'songs') {
    return null
  }

  if (!songId || !canUpdateTarget) {
    return null
  }

  return (
    <>
      <div
        className="field-type-join__link-existing"
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          marginBottom: '0.5rem',
        }}
      >
        <span
          ref={bindToolbarSlotRef}
          style={{
            position: 'absolute',
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          }}
          aria-hidden
        />
        {linkedCount === 0 ? (
          <Banner type="info">
            This list is <strong>filtered</strong>: it only shows {pluralLabel} that already
            include this song on their tracklist. Seeing &quot;No results&quot; here means this
            track is not linked yet—not that you have no {pluralLabel} in the CMS (the link button
            opens the full library).
          </Banner>
        ) : null}
      </div>
      {toolbarHost
        ? createPortal(
            <Button
              buttonStyle="secondary"
              disabled={linking}
              onClick={() => openDrawer()}
              size="small"
            >
              {linking ? 'Linking…' : `Link existing ${singularLabel}`}
            </Button>,
            toolbarHost,
          )
        : null}
      <ListDrawerComponent allowCreate={false} onSelect={handleSelect} />
    </>
  )
}
