import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload, type Where } from 'payload'
import configPromise from '@payload-config'

import type { Media } from '@/payload-types'

/**
 * Backfill route — regenerates the WebP / AVIF derivatives defined under
 * `collections/Media.ts > upload.imageSizes` for media docs that pre-date
 * that config. The original master file in Vercel Blob is left untouched.
 *
 * Workflow per doc:
 *   1. Fetch the original bytes from the resource's public URL.
 *   2. Re-run the Payload local API `update` with the file payload.
 *      Payload pipes the buffer through sharp again, regenerates every
 *      configured `imageSize`, and writes them back to Blob.
 *
 * Auth: requires a logged-in admin. Trigger from the browser while signed
 * into the Payload admin, or via curl with a session cookie.
 *
 *   GET  /api/admin/regenerate-media-sizes              — preview (counts only)
 *   POST /api/admin/regenerate-media-sizes              — process all media
 *   POST /api/admin/regenerate-media-sizes?ids=1,2,3    — process specific docs
 *   POST /api/admin/regenerate-media-sizes?force=true   — re-process even docs
 *                                                          that already have
 *                                                          all sizes generated
 *
 * On Vercel, watch out for the per-request execution limit. This route sets
 * `maxDuration = 300` (5 min) which is plenty for most catalogs but if you
 * have hundreds of MB of masters, run it in batches via `?ids=...`.
 */

export const dynamic = 'force-dynamic'
export const maxDuration = 300

type DerivativeName = 'thumbnail' | 'card' | 'feature' | 'feature_avif'

const REQUIRED_SIZES: DerivativeName[] = [
  'thumbnail',
  'card',
  'feature',
  'feature_avif',
]

type MediaWithSizes = Media & {
  sizes?: Partial<
    Record<DerivativeName, { url?: string | null; filename?: string | null } | null>
  > | null
}

const isImageMime = (mime: string | null | undefined): boolean =>
  typeof mime === 'string' && mime.startsWith('image/') && mime !== 'image/svg+xml'

const hasAllSizes = (doc: MediaWithSizes): boolean =>
  REQUIRED_SIZES.every((name) => Boolean(doc.sizes?.[name]?.url))

async function authenticateAdmin(): Promise<
  | { ok: true; payload: Awaited<ReturnType<typeof getPayload>> }
  | { ok: false; response: NextResponse }
> {
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      ),
    }
  }

  // The Users collection's `role` field is typed as `'admin' | 'user'`; the
  // auth user object exposes the same shape via the generated payload-types.
  if ((user as { role?: string }).role !== 'admin') {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Admin role required' },
        { status: 403 },
      ),
    }
  }

  return { ok: true, payload }
}

export async function GET() {
  const auth = await authenticateAdmin()
  if (!auth.ok) return auth.response
  const { payload } = auth

  const all = await payload.find({
    collection: 'media',
    limit: 0, // metadata only — we just need totalDocs
    depth: 0,
    overrideAccess: true,
  })

  // Cheap sample to estimate how many docs are missing derivatives.
  const sample = await payload.find({
    collection: 'media',
    limit: 250,
    depth: 0,
    overrideAccess: true,
  })

  const sampledImages = sample.docs.filter((d) => isImageMime(d.mimeType))
  const sampledMissing = sampledImages.filter(
    (d) => !hasAllSizes(d as MediaWithSizes),
  )

  return NextResponse.json({
    ok: true,
    totalDocs: all.totalDocs,
    sampled: sample.docs.length,
    sampledImages: sampledImages.length,
    sampledMissingSizes: sampledMissing.length,
    requiredSizes: REQUIRED_SIZES,
    note: 'POST to this URL to actually regenerate. Add ?ids=1,2,3 or ?force=true.',
  })
}

export async function POST(req: NextRequest) {
  const auth = await authenticateAdmin()
  if (!auth.ok) return auth.response
  const { payload } = auth

  const url = new URL(req.url)
  const idsParam = url.searchParams.get('ids')
  const force = url.searchParams.get('force') === 'true'
  const limit = Number(url.searchParams.get('limit') ?? '50')

  const ids = idsParam
    ? idsParam
        .split(',')
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n))
    : null

  const result = await payload.find({
    collection: 'media',
    limit: ids ? ids.length : Math.min(Math.max(limit, 1), 500),
    depth: 0,
    overrideAccess: true,
    where: ids
      ? { id: { in: ids } }
      : isImageMimeWhereClause(),
  })

  const stats = {
    examined: result.docs.length,
    skippedNonImage: 0,
    skippedAlreadyHasSizes: 0,
    regenerated: 0,
    failed: 0,
    errors: [] as Array<{ id: number; filename: string | null; message: string }>,
  }

  for (const doc of result.docs) {
    if (!isImageMime(doc.mimeType)) {
      stats.skippedNonImage += 1
      continue
    }
    if (!force && hasAllSizes(doc as MediaWithSizes)) {
      stats.skippedAlreadyHasSizes += 1
      continue
    }
    if (!doc.url || !doc.filename) {
      stats.failed += 1
      stats.errors.push({
        id: doc.id,
        filename: doc.filename ?? null,
        message: 'Missing url or filename on media doc',
      })
      continue
    }

    try {
      const buffer = await fetchMasterBuffer(doc.url)

      await payload.update({
        collection: 'media',
        id: doc.id,
        data: {},
        file: {
          data: Buffer.from(buffer),
          mimetype: doc.mimeType ?? 'application/octet-stream',
          name: doc.filename,
          size: buffer.byteLength,
        },
        overrideAccess: true,
      })

      stats.regenerated += 1
      payload.logger.info(
        `[regenerate-media-sizes] regenerated id=${doc.id} (${doc.filename})`,
      )
    } catch (err) {
      stats.failed += 1
      const message = err instanceof Error ? err.message : String(err)
      stats.errors.push({ id: doc.id, filename: doc.filename ?? null, message })
      payload.logger.error({
        err,
        msg: `[regenerate-media-sizes] failed id=${doc.id} (${doc.filename})`,
      })
    }
  }

  return NextResponse.json({ ok: true, stats })
}

/**
 * Filter Media docs to image MIME types at the query layer so we don't pull
 * MP3s and videos into memory just to skip them. Postgres handles `like`
 * natively; other adapters do too via Payload's operator translation.
 */
function isImageMimeWhereClause(): Where {
  return {
    mimeType: { like: 'image/' },
  }
}

async function fetchMasterBuffer(url: string): Promise<ArrayBuffer> {
  const absolute = url.startsWith('http')
    ? url
    : `${process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3000'}${url}`

  const res = await fetch(absolute)
  if (!res.ok) {
    throw new Error(`Fetch ${absolute} → HTTP ${res.status}`)
  }
  return await res.arrayBuffer()
}
