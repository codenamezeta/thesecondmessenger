import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'

import { isR2StorageEnabled } from './r2Env'

let client: S3Client | null = null

function getR2Client(): S3Client {
  if (!client) {
    if (!isR2StorageEnabled()) {
      throw new Error('R2 is not configured (R2_BUCKET, R2_ENDPOINT).')
    }
    client = new S3Client({
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
      endpoint: process.env.R2_ENDPOINT || '',
      forcePathStyle: true,
      region: 'auto',
    })
  }
  return client
}

/** Server-side byte fetch from R2 (cron, tag sync, migrations). */
export async function fetchR2ObjectBytes(
  key: string,
): Promise<Uint8Array> {
  const bucket = process.env.R2_BUCKET
  if (!bucket) {
    throw new Error('R2_BUCKET is not set.')
  }

  const res = await getR2Client().send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  )

  if (!res.Body) {
    throw new Error(`R2 GetObject returned empty body for key=${key}`)
  }

  return new Uint8Array(await res.Body.transformToByteArray())
}

export async function putR2ObjectBytes(
  key: string,
  body: Uint8Array,
  contentType?: string,
): Promise<void> {
  const bucket = process.env.R2_BUCKET
  if (!bucket) {
    throw new Error('R2_BUCKET is not set.')
  }

  const { PutObjectCommand } = await import('@aws-sdk/client-s3')
  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ...(contentType ? { ContentType: contentType } : {}),
    }),
  )
}
