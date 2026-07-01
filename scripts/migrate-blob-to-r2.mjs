#!/usr/bin/env node
/**
 * migrate-blob-to-r2.mjs
 *
 * Copies existing `media` files from Vercel Blob into Cloudflare R2 (`media/` prefix)
 * and rewrites stored URLs on each Payload media document.
 *
 * Requires: R2_* env vars, BLOB_READ_WRITE_TOKEN (CLI token still reads while suspended).
 *
 * Usage:
 *   node scripts/migrate-blob-to-r2.mjs              # dry-run
 *   node scripts/migrate-blob-to-r2.mjs --apply
 *   node scripts/migrate-blob-to-r2.mjs --apply --ids=12,34
 */

import { execFile } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { get as getBlob } from '@vercel/blob'
import { getPayload } from 'payload'

const execFileAsync = promisify(execFile)

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

const apply = process.argv.includes('--apply')
const idsArg = process.argv.find((a) => a.startsWith('--ids='))
const filterIds = idsArg
  ? idsArg
      .slice('--ids='.length)
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  : null

function isBlobUrl(url) {
  return typeof url === 'string' && url.includes('vercel-storage.com')
}

function r2Client() {
  return new S3Client({
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    endpoint: process.env.R2_ENDPOINT || '',
    forcePathStyle: true,
    region: 'auto',
  })
}

function publicUrlForKey(key) {
  const base = process.env.R2_PUBLIC_MEDIA_BASE_URL?.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  return null
}

function blobAccessFromUrl(url) {
  return url.includes('.private.blob.vercel-storage.com') ? 'private' : 'public'
}

function migrateMediaBaseUrl() {
  const raw =
    process.env.MIGRATE_MEDIA_BASE_URL ||
    process.env.NEXT_PUBLIC_SERVER_URL ||
    'https://thesecondmessenger.com'
  return raw.replace(/\/$/, '')
}

function mediaApiPathForFilename(filename) {
  return `/api/media/file/${encodeURIComponent(filename)}`
}

function blobReadToken() {
  return process.env.BLOB_READ_WRITE_TOKEN?.replace(/^["']|["']$/g, '')
}

async function downloadViaBlobSdk(pathname) {
  const result = await getBlob(pathname, {
    access: 'public',
    token: blobReadToken(),
  })
  if (!result?.stream) {
    throw new Error(`SDK returned no stream for ${pathname}`)
  }
  return Buffer.from(await new Response(result.stream).arrayBuffer())
}

async function downloadViaVercelCli(blobUrl, out) {
  const token = blobReadToken()
  const args = [
    'blob',
    'get',
    blobUrl,
    '-o',
    out,
    '--access',
    blobAccessFromUrl(blobUrl),
    '--scope',
    'a2zeta',
  ]
  if (token) args.push('--rw-token', token)

  await execFileAsync('vercel', args, { maxBuffer: 1024 * 1024 * 512 })
  return readFileSync(out)
}

async function downloadViaProductionSite(apiPath) {
  const res = await fetch(`${migrateMediaBaseUrl()}${apiPath}`)
  if (!res.ok) {
    throw new Error(`production fetch ${res.status} for ${apiPath}`)
  }
  return Buffer.from(await res.arrayBuffer())
}

/** Download bytes from Blob (SDK → CLI), then live site `/api/media/file/…`. */
async function downloadBlobToBuffer(blobUrl, apiPath) {
  const filename = filenameFromBlobUrl(blobUrl)
  const tmp = mkdtempSync(join(tmpdir(), 'tsm-blob-'))
  const out = join(tmp, 'file')
  const errors = []

  try {
    if (filename) {
      try {
        return await downloadViaBlobSdk(filename)
      } catch (err) {
        errors.push(`SDK: ${err.message}`)
      }
    }

    try {
      return await downloadViaVercelCli(blobUrl, out)
    } catch (err) {
      errors.push(`CLI: ${err.message}`)
    }

    const path =
      apiPath || (filename ? mediaApiPathForFilename(filename) : null)
    if (path) {
      try {
        console.warn(
          `  blob read failed; trying ${migrateMediaBaseUrl()}${path}`,
        )
        return await downloadViaProductionSite(path)
      } catch (err) {
        errors.push(`site: ${err.message}`)
      }
    }

    const blocked = errors.some((e) => e.includes('403'))
    const hint = blocked
      ? '\n\nVercel Blob reads are returning 403 — your store is likely suspended (Hobby transfer limit). ' +
        'list() still works but get/download is blocked until the limit resets or Vercel support unsuspends the store for a one-time export.\n' +
        'See: https://community.vercel.com/t/cant-migrate-blob-because-data-limit-reached/43832'
      : ''
    throw new Error(`${errors.join('; ')}${hint}`)
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
}

async function putToR2(key, body, contentType) {
  const bucket = process.env.R2_BUCKET
  if (!bucket) throw new Error('R2_BUCKET is not set')
  await r2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ...(contentType ? { ContentType: contentType } : {}),
    }),
  )
}

function filenameFromBlobUrl(url) {
  try {
    const pathname = new URL(url).pathname
    return decodeURIComponent(pathname.split('/').pop() || '')
  } catch {
    return null
  }
}

function filenameFromMediaUrl(url) {
  if (!url || typeof url !== 'string') return null
  if (isBlobUrl(url)) return filenameFromBlobUrl(url)
  if (url.startsWith('/api/media/file/')) {
    return decodeURIComponent(url.slice('/api/media/file/'.length).split('?')[0])
  }
  return null
}

async function listBlobIndex() {
  const index = new Map()
  let cursor

  do {
    const args = ['blob', 'list', '--limit', '1000', '--scope', 'a2zeta']
    if (cursor) args.push('--cursor', cursor)

    const { stdout, stderr } = await execFileAsync('vercel', args, {
      maxBuffer: 1024 * 1024 * 16,
    })
    const output = `${stdout}\n${stderr}`

    for (const line of output.split('\n')) {
      const match = line.match(
        /(https:\/\/\S+?\.blob\.vercel-storage\.com\/\S+)/,
      )
      if (!match) continue
      const url = match[1].trim()
      try {
        const pathname = decodeURIComponent(new URL(url).pathname.replace(/^\//, ''))
        index.set(pathname, url)
      } catch {
        // ignore malformed lines
      }
    }

    const next = output.match(/--cursor\s+([^\s`]+)/)
    cursor = next?.[1]
    if (!output.includes('To display the next page')) break
  } while (cursor)

  return index
}

async function migrateBlobFile(blobUrl, mediaPrefix, mimeType, stats, apiPath) {
  const filename = filenameFromBlobUrl(blobUrl)
  if (!filename) {
    stats.skipped++
    return null
  }

  const key = `${mediaPrefix}/${filename}`
  const nextPublic = publicUrlForKey(key) ?? `/api/media/file/${encodeURIComponent(filename)}`

  if (!apply) {
    stats.planned++
    return nextPublic
  }

  const bytes = await downloadBlobToBuffer(blobUrl, apiPath)
  await putToR2(key, bytes, mimeType ?? undefined)
  stats.copied++
  return nextPublic
}

async function migrateUrl(url, mediaPrefix, mimeType, blobIndex, stats) {
  if (!url) return url

  if (isBlobUrl(url)) {
    const migrated = await migrateBlobFile(url, mediaPrefix, mimeType, stats, undefined)
    return migrated ?? url
  }

  const filename = filenameFromMediaUrl(url)
  if (!filename) return url

  const blobUrl = blobIndex.get(filename)
  if (!blobUrl) return url

  const migrated = await migrateBlobFile(
    blobUrl,
    mediaPrefix,
    mimeType,
    stats,
    url.startsWith('/api/media/file/') ? url : undefined,
  )
  return migrated ?? url
}

function docNeedsMigration(doc, blobIndex) {
  if (isBlobUrl(doc.url)) return true
  if (doc.filename && blobIndex.has(doc.filename)) return true
  if (filenameFromMediaUrl(doc.url) && blobIndex.has(filenameFromMediaUrl(doc.url)))
    return true

  if (!doc.sizes) return false
  return Object.values(doc.sizes).some((entry) => {
    if (!entry || typeof entry !== 'object' || !entry.url) return false
    if (isBlobUrl(entry.url)) return true
    const fn = filenameFromMediaUrl(entry.url)
    return Boolean(fn && blobIndex.has(fn))
  })
}

async function main() {
  const mediaPrefix = process.env.R2_MEDIA_PREFIX || 'media'
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  console.log('Indexing Vercel Blob store…')
  const blobIndex = await listBlobIndex()
  console.log(`Found ${blobIndex.size} blob object(s)\n`)

  const result = await payload.find({
    collection: 'media',
    limit: 500,
    depth: 0,
    overrideAccess: true,
    ...(filterIds ? { where: { id: { in: filterIds } } } : {}),
  })

  const stats = { examined: 0, planned: 0, copied: 0, skipped: 0, updated: 0 }

  for (const doc of result.docs) {
    stats.examined++
    if (!docNeedsMigration(doc, blobIndex)) continue

    const newUrl = await migrateUrl(
      doc.url,
      mediaPrefix,
      doc.mimeType,
      blobIndex,
      stats,
    )

    const sizes = doc.sizes ? { ...doc.sizes } : undefined
    if (sizes) {
      for (const [name, entry] of Object.entries(sizes)) {
        if (!entry || typeof entry !== 'object' || !entry.url) continue
        const migrated = await migrateUrl(
          entry.url,
          mediaPrefix,
          doc.mimeType,
          blobIndex,
          stats,
        )
        sizes[name] = { ...entry, url: migrated }
      }
    }

    if (!apply) continue

    const sizesChanged =
      sizes && JSON.stringify(sizes) !== JSON.stringify(doc.sizes)
    if (newUrl !== doc.url || sizesChanged) {
      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {
          url: newUrl,
          ...(sizes ? { sizes } : {}),
        },
        overrideAccess: true,
      })
      stats.updated++
    }
  }

  console.log(apply ? 'Blob → R2 migration (APPLIED)' : 'Blob → R2 migration (dry-run)')
  console.log(stats)
  if (!apply) {
    console.log('\nRe-run with --apply to copy bytes and update Payload URLs.')
  }
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
