import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { r2GatedPrefix, isR2StorageEnabled } from '@/lib/storage/r2Env'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

function sanitizePrefix(prefix: string): string {
  let decoded: string
  try {
    decoded = decodeURIComponent(prefix)
  } catch {
    return ''
  }
  if (/%[0-9a-f]{2}/i.test(decoded)) return ''
  return decoded
    .replace(/\\/g, '/')
    .split('/')
    .filter((segment) => segment !== '..' && segment !== '.')
    .join('/')
    .replace(/^\/+/, '')
    .replace(/[\x00-\x1f\x80-\x9f]/g, '')
}

function getR2Client(): S3Client {
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

/**
 * Force a gated-content file download by redirecting to a signed R2 URL with
 * `Content-Disposition: attachment`.
 *
 * Auth: requires a logged-in user with access to the gated asset (tier checks).
 */
export async function GET(req: NextRequest) {
  if (!isR2StorageEnabled()) {
    return NextResponse.json(
      { error: 'R2 is not configured' },
      { status: 500 },
    )
  }

  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 },
    )
  }

  const url = new URL(req.url)
  const idParam = url.searchParams.get('id')
  const filenameParam = url.searchParams.get('filename')

  const id = Number(idParam)
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Valid id is required' }, { status: 400 })
  }

  // Access check happens here (overrideAccess NOT set).
  const doc = await payload.findByID({
    collection: 'gated-content',
    id,
    depth: 0,
    req: req as unknown as Parameters<typeof payload.findByID>[0]['req'],
  })

  const filename =
    typeof doc?.filename === 'string'
      ? doc.filename
      : filenameParam || ''

  if (!filename) {
    return NextResponse.json(
      { error: 'Missing filename on asset' },
      { status: 400 },
    )
  }

  const prefix =
    typeof (doc as { prefix?: unknown })?.prefix === 'string'
      ? (doc as { prefix: string }).prefix
      : r2GatedPrefix()

  const key = `${sanitizePrefix(prefix)}/${filename}`
  const bucket = process.env.R2_BUCKET || ''

  // pnpm can install multiple @smithy/@aws-sdk type copies which makes the
  // getSignedUrl client type incompatible at compile time. Runtime is fine.
  const signedUrl = await getSignedUrl(
    getR2Client() as any,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${filename.replace(/"/g, '')}"`,
    }) as any,
    { expiresIn: 3600 },
  )

  return NextResponse.redirect(signedUrl, 302)
}

