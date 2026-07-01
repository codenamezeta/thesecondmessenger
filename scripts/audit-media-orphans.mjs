#!/usr/bin/env node
/**
 * audit-media-orphans.mjs
 *
 * Reports Payload `media` documents that appear unused (no incoming references)
 * and blob URLs still pointing at Vercel Blob.
 *
 * Usage:
 *   node scripts/audit-media-orphans.mjs
 *   node scripts/audit-media-orphans.mjs --json
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { getPayload } from 'payload'

function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local')
  if (!existsSync(p)) return
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq).trim()
    let val = trimmed.slice(eq + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnvLocal()

const jsonOut = process.argv.includes('--json')

const REFERENCE_SCAN = [
  { collection: 'songs', fields: ['coverArt', 'masterAudio', 'masterAudioFlac', 'masterAudioWav'] },
  { collection: 'releases', fields: ['coverArt'] },
  { collection: 'playlists', fields: ['coverArt'] },
  { collection: 'posts', fields: ['meta.image'] },
  { collection: 'tags', fields: ['featuredImage'] },
  { collection: 'users', fields: ['avatar'] },
]

function collectIdsFromDoc(doc, fieldPath) {
  const parts = fieldPath.split('.')
  let value = doc
  for (const part of parts) {
    value = value?.[part]
  }
  if (!value) return []
  if (typeof value === 'number') return [value]
  if (typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
    return [value.id]
  }
  return []
}

function isBlobUrl(url) {
  return typeof url === 'string' && url.includes('vercel-storage.com')
}

async function main() {
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  const referenced = new Set()

  for (const { collection, fields } of REFERENCE_SCAN) {
    const result = await payload.find({
      collection,
      limit: 500,
      depth: 0,
      overrideAccess: true,
    })

    for (const doc of result.docs) {
      for (const field of fields) {
        for (const id of collectIdsFromDoc(doc, field)) {
          referenced.add(id)
        }
      }

      if (collection === 'songs' && Array.isArray(doc.stems)) {
        for (const stem of doc.stems) {
          const file = stem?.audioFile
          if (typeof file === 'number') referenced.add(file)
        }
      }
    }
  }

  const media = await payload.find({
    collection: 'media',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const orphans = []
  const stillOnBlob = []
  let totalBytes = 0

  for (const doc of media.docs) {
    if (typeof doc.filesize === 'number') totalBytes += doc.filesize
    if (!referenced.has(doc.id)) orphans.push(doc)
    if (isBlobUrl(doc.url)) stillOnBlob.push(doc)
  }

  const report = {
    totalMedia: media.totalDocs,
    referencedCount: referenced.size,
    orphanCount: orphans.length,
    orphans: orphans.map((d) => ({
      id: d.id,
      filename: d.filename,
      mimeType: d.mimeType,
      filesize: d.filesize,
      url: d.url,
    })),
    stillOnBlobCount: stillOnBlob.length,
    stillOnBlob: stillOnBlob.map((d) => ({
      id: d.id,
      filename: d.filename,
      url: d.url,
    })),
    approxStoredBytes: totalBytes,
  }

  if (jsonOut) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    console.log('Media orphan audit')
    console.log('------------------')
    console.log(`Total media docs:     ${report.totalMedia}`)
    console.log(`Referenced ids:       ${report.referencedCount}`)
    console.log(`Orphans (safe review): ${report.orphanCount}`)
    console.log(`Still on Vercel Blob: ${report.stillOnBlobCount}`)
    console.log(`Sampled stored bytes: ${(report.approxStoredBytes / 1024 / 1024).toFixed(1)} MB (page 1 only)`)
    if (orphans.length) {
      console.log('\nOrphans:')
      for (const o of orphans.slice(0, 25)) {
        console.log(`  #${o.id}  ${o.filename}  (${o.mimeType})`)
      }
      if (orphans.length > 25) console.log(`  … and ${orphans.length - 25} more`)
    }
    if (stillOnBlob.length) {
      console.log('\nStill on Blob (run migrate-blob-to-r2):')
      for (const o of stillOnBlob.slice(0, 15)) {
        console.log(`  #${o.id}  ${o.filename}`)
      }
    }
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
