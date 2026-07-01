#!/usr/bin/env node
/**
 * migrate-gated-masters.mjs
 *
 * Moves lossless masters (FLAC/WAV) and interactive stems still pointing at
 * `media` ids into `gated-content` on R2, then rewires Songs.
 *
 * Run AFTER migrate-blob-to-r2 so bytes live under the `media/` prefix in R2.
 *
 * Usage:
 *   node --env-file=.env.local scripts/migrate-gated-masters.mjs
 *   node --env-file=.env.local scripts/migrate-gated-masters.mjs --apply
 */

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
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

const apply = process.argv.includes('--apply')

const TIER = { flac: 'lieutenant', wav: 'captain', stem: 'commander' }

function r2() {
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

const mediaPrefix = () => process.env.R2_MEDIA_PREFIX || 'media'
const gatedPrefix = () =>
  process.env.R2_PREFIX || process.env.R2_GATED_CONTENT_PREFIX || 'gated-content'

async function objectExists(key) {
  const bucket = process.env.R2_BUCKET
  if (!bucket) return false
  try {
    await r2().send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch (err) {
    if (err.name === 'NotFound' || err.$metadata?.httpStatusCode === 404) return false
    throw err
  }
}

async function isGatedContentId(payload, id) {
  try {
    const doc = await payload.findByID({
      collection: 'gated-content',
      id,
      depth: 0,
      overrideAccess: true,
    })
    return Boolean(doc?.id)
  } catch {
    return false
  }
}

function gatedApiUrl(filename) {
  const path = `/api/gated-content/file/${encodeURIComponent(filename)}`
  const prefix = gatedPrefix()
  return `${path}?prefix=${encodeURIComponent(prefix)}`
}

async function copyKey(fromKey, toKey, contentType) {
  const bucket = process.env.R2_BUCKET
  const client = r2()
  const got = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: fromKey }),
  )
  const body = await got.Body.transformToByteArray()
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: toKey,
      Body: body,
      ...(contentType ? { ContentType: contentType } : {}),
    }),
  )
  return new Uint8Array(body)
}

async function promoteMediaToGated(payload, refId, { title, tier, relatedSongId }) {
  if (await isGatedContentId(payload, refId)) {
    return { skipped: true, reason: `already gated-content #${refId}` }
  }

  const media = await payload.findByID({
    collection: 'media',
    id: refId,
    depth: 0,
    overrideAccess: true,
  })

  if (!media?.filename) {
    return { skipped: true, reason: `media #${refId} missing or not a media doc` }
  }

  const fromKey = `${mediaPrefix()}/${media.filename}`
  const toKey = `${gatedPrefix()}/${media.filename}`

  if (!apply) {
    const sourceExists = await objectExists(fromKey)
    return {
      planned: sourceExists,
      skipped: !sourceExists,
      reason: sourceExists
        ? undefined
        : `R2 key missing: ${fromKey} (in bucket ${process.env.R2_BUCKET})`,
      mediaId: refId,
      filename: media.filename,
      tier,
      title,
    }
  }

  if (!(await objectExists(fromKey))) {
    return {
      skipped: true,
      reason: `R2 key missing: ${fromKey} (in bucket ${process.env.R2_BUCKET})`,
      mediaId: refId,
      filename: media.filename,
    }
  }

  const bytes = await copyKey(fromKey, toKey, media.mimeType ?? undefined)

  const gated = await payload.create({
    collection: 'gated-content',
    data: {
      title,
      tierRequired: tier,
      relatedSong: relatedSongId,
    },
    file: {
      data: Buffer.from(bytes),
      name: media.filename,
      mimetype: media.mimeType ?? 'application/octet-stream',
      size: bytes.byteLength,
    },
    overrideAccess: true,
  })

  return { created: gated.id, mediaId, filename: media.filename }
}

async function main() {
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })

  const songs = await payload.find({
    collection: 'songs',
    limit: 200,
    depth: 0,
    overrideAccess: true,
  })

  const log = []

  for (const song of songs.docs) {
    const patch = {}

    if (typeof song.masterAudioFlac === 'number') {
      const res = await promoteMediaToGated(payload, song.masterAudioFlac, {
        title: `${song.title} — FLAC master`,
        tier: TIER.flac,
        relatedSongId: song.id,
      })
      if (res.created) patch.masterAudioFlac = res.created
      log.push({ song: song.id, field: 'masterAudioFlac', ...res })
    }

    if (typeof song.masterAudioWav === 'number') {
      const res = await promoteMediaToGated(payload, song.masterAudioWav, {
        title: `${song.title} — WAV master`,
        tier: TIER.wav,
        relatedSongId: song.id,
      })
      if (res.created) patch.masterAudioWav = res.created
      log.push({ song: song.id, field: 'masterAudioWav', ...res })
    }

    if (Array.isArray(song.stems) && song.stems.length) {
      const newStems = []
      for (let i = 0; i < song.stems.length; i++) {
        const stem = song.stems[i]
        if (typeof stem.audioFile !== 'number') {
          newStems.push(stem)
          continue
        }
        const res = await promoteMediaToGated(payload, stem.audioFile, {
          title: `${song.title} — stem: ${stem.stemName}`,
          tier: TIER.stem,
          relatedSongId: song.id,
        })
        if (res.created) {
          newStems.push({ ...stem, audioFile: res.created })
        } else {
          newStems.push(stem)
        }
        log.push({ song: song.id, field: `stems[${i}]`, ...res })
      }
      if (apply && JSON.stringify(newStems) !== JSON.stringify(song.stems)) {
        patch.stems = newStems
      }
    }

    if (apply && Object.keys(patch).length) {
      await payload.update({
        collection: 'songs',
        id: song.id,
        data: patch,
        overrideAccess: true,
        context: { skipAudioTagSync: true },
      })
    }
  }

  console.log(
    apply ? 'Gated master migration (APPLIED)' : 'Gated master migration (dry-run)',
  )

  const planned = log.filter((e) => e.planned).length
  const skipped = log.filter((e) => e.skipped).length
  const created = log.filter((e) => e.created).length

  console.log({ planned, skipped, created, entries: log.length })

  if (planned === 0 && skipped > 0) {
    console.log('')
    console.log(
      'Nothing to migrate. Masters are likely already on gated-content, or lossless files',
    )
    console.log(
      'are not under the media/ prefix in R2_BUCKET. That is normal if you copied vault',
    )
    console.log('data from tsm-gated-media and skipped the Blob→R2 media migration (0 planned).')
  }

  if (log.length <= 20) {
    console.log(JSON.stringify(log, null, 2))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
