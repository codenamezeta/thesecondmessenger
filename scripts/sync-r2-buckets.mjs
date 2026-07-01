#!/usr/bin/env node
/**
 * sync-r2-buckets.mjs
 *
 * Copy objects between Cloudflare R2 buckets (same account) using the S3 API.
 * Uses credentials from .env.local — no AWS CLI required.
 *
 * Usage:
 *   pnpm r2:sync-buckets -- --source=tsm-gated-media --dest=the-second-messenger
 *   pnpm r2:sync-buckets -- --source=tsm-gated-media --dest=the-second-messenger --apply
 *   pnpm r2:sync-buckets -- --source=the-second-messenger --dest=the-second-messenger-dev --apply
 */

import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import {
  CopyObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'

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

function argValue(name) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : undefined
}

loadEnvLocal()

const apply = process.argv.includes('--apply')
const skipExisting = !process.argv.includes('--overwrite')
const sourceBucket = argValue('source')
const destBucket = argValue('dest')
const prefix = argValue('prefix') ?? ''

if (!sourceBucket || !destBucket) {
  console.error(
    'Usage: pnpm r2:sync-buckets -- --source=<bucket> --dest=<bucket> [--prefix=gated-content/] [--apply] [--overwrite]',
  )
  process.exit(1)
}

const endpoint = process.env.R2_ENDPOINT
const accessKeyId = process.env.R2_ACCESS_KEY_ID
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

if (!endpoint || !accessKeyId || !secretAccessKey) {
  console.error('Missing R2_ENDPOINT, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in .env.local')
  process.exit(1)
}

const client = new S3Client({
  credentials: { accessKeyId, secretAccessKey },
  endpoint,
  forcePathStyle: true,
  region: 'auto',
})

function formatBytes(n) {
  if (n >= 1_073_741_824) return `${(n / 1_073_741_824).toFixed(2)} GB`
  if (n >= 1_048_576) return `${(n / 1_048_576).toFixed(2)} MB`
  if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${n} B`
}

async function destHasObject(key) {
  try {
    await client.send(new HeadObjectCommand({ Bucket: destBucket, Key: key }))
    return true
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false
    throw err
  }
}

async function listAllObjects() {
  const objects = []
  let token

  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: sourceBucket,
        Prefix: prefix || undefined,
        ContinuationToken: token,
      }),
    )
    for (const item of res.Contents ?? []) {
      if (item.Key && !item.Key.endsWith('/')) {
        objects.push({ key: item.Key, size: item.Size ?? 0 })
      }
    }
    token = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (token)

  return objects
}

async function copyObject(key) {
  const encoded = encodeURIComponent(`${sourceBucket}/${key}`).replace(/%2F/g, '/')
  await client.send(
    new CopyObjectCommand({
      Bucket: destBucket,
      Key: key,
      CopySource: encoded,
    }),
  )
}

async function main() {
  console.log(`R2 sync ${apply ? '(APPLY)' : '(dry-run)'}`)
  console.log(`  source: ${sourceBucket}`)
  console.log(`  dest:   ${destBucket}`)
  if (prefix) console.log(`  prefix: ${prefix}`)
  console.log('')

  const objects = await listAllObjects()
  if (objects.length === 0) {
    console.log('No objects found in source bucket.')
    return
  }

  const totalBytes = objects.reduce((sum, o) => sum + o.size, 0)
  console.log(`Found ${objects.length} object(s), ${formatBytes(totalBytes)} total\n`)

  let copied = 0
  let skipped = 0

  for (const { key, size } of objects) {
    if (skipExisting && (await destHasObject(key))) {
      console.log(`skip (exists): ${key}`)
      skipped += 1
      continue
    }

    if (apply) {
      process.stdout.write(`copy: ${key} (${formatBytes(size)}) ... `)
      await copyObject(key)
      console.log('ok')
      copied += 1
    } else {
      console.log(`would copy: ${key} (${formatBytes(size)})`)
      copied += 1
    }
  }

  console.log('')
  if (apply) {
    console.log(`Done. Copied ${copied}, skipped ${skipped}.`)
  } else {
    console.log(`Dry-run complete. Would copy ${copied}, skip ${skipped}.`)
    console.log('Re-run with --apply to perform the copy.')
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
