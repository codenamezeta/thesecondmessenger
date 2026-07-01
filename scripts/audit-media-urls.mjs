#!/usr/bin/env node
/** Quick report: where do media docs think their bytes live? */

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

function bucket(url) {
  if (!url || typeof url !== 'string') return '(empty)'
  if (url.includes('vercel-storage.com')) return 'vercel-blob'
  if (url.includes('media.thesecondmessenger.com')) return 'r2-cdn'
  if (url.includes('r2.cloudflarestorage.com') || url.includes('.r2.dev'))
    return 'r2-direct'
  if (url.startsWith('/api/media')) return 'payload-api'
  if (url.startsWith('http')) {
    try {
      return new URL(url).hostname
    } catch {
      return 'other-http'
    }
  }
  return 'other'
}

async function main() {
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })
  const media = await payload.find({
    collection: 'media',
    limit: 500,
    depth: 0,
    overrideAccess: true,
  })

  const counts = {}
  const samples = {}

  for (const doc of media.docs) {
    const b = bucket(doc.url)
    counts[b] = (counts[b] || 0) + 1
    if (!samples[b]) samples[b] = { id: doc.id, filename: doc.filename, url: doc.url }
  }

  console.log('Media URL buckets:', counts)
  console.log('')
  for (const [b, sample] of Object.entries(samples)) {
    console.log(`[${b}] #${sample.id} ${sample.filename}`)
    console.log(`  ${sample.url}`)
  }

  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
