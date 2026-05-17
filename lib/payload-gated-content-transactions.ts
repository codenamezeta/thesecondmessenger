import type { Payload, PayloadRequest } from 'payload'
import { NotFound } from 'payload'

const GATED_CONTENT_SLUG = 'gated-content'
const POSTS_SLUG = 'posts'
const PATCH_FLAG = '__gatedContentDisableTransactionsPatched' as const

const DISABLE_TRANSACTION_COLLECTIONS = new Set([GATED_CONTENT_SLUG, POSTS_SLUG])

/** Retries for normal admin updates (rare NotFound). */
const RETRY_DEFAULT_ATTEMPTS = 25
const RETRY_DEFAULT_MS = 100

/**
 * Cloud-storage sets `req.context.skipCloudStorage` before persisting file fields.
 * After long client → R2 uploads, Postgres/Neon can take longer than a few seconds
 * to serve the new row on another pooled connection — keep trying longer only
 * for that internal path.
 */
const RETRY_CLOUD_PERSIST_ATTEMPTS = 140
const RETRY_CLOUD_PERSIST_MS = 500

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isNotFoundError(err: unknown): boolean {
  if (err instanceof NotFound) return true
  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number' &&
    (err as { status: number }).status === 404
  ) {
    return true
  }
  return false
}

function cloudStoragePersistRetrySchedule(req: PayloadRequest | undefined): {
  attempts: number
  delayMs: number
} {
  if (req?.context?.skipCloudStorage === true) {
    return {
      attempts: RETRY_CLOUD_PERSIST_ATTEMPTS,
      delayMs: RETRY_CLOUD_PERSIST_MS,
    }
  }
  return {
    attempts: RETRY_DEFAULT_ATTEMPTS,
    delayMs: RETRY_DEFAULT_MS,
  }
}

/**
 * 1) `disableTransaction` — Payload runs `initTransaction` *before* collection
 *    `beforeOperation` hooks, so hooks cannot set `disableTransaction` in time.
 *
 * 2) NotFound retries — Neon/serverless pools + long-running upload requests
 *    (large FLAC/MP4) can delay visibility of the row for the cloud-storage
 *    `payload.update` that writes R2 metadata.
 */
export function patchGatedContentDisableTransactions(payload: Payload): void {
  type Flagged = Payload & Record<typeof PATCH_FLAG, boolean | undefined>
  const p = payload as Flagged
  if (p[PATCH_FLAG]) return
  p[PATCH_FLAG] = true

  const origCreate = payload.create.bind(payload)
  payload.create = ((options) => {
    if (DISABLE_TRANSACTION_COLLECTIONS.has(options.collection)) {
      return origCreate({ ...options, disableTransaction: true })
    }
    return origCreate(options)
  }) as Payload['create']

  const origUpdate = payload.update.bind(payload)
  payload.update = (async (
    options: Parameters<Payload['update']>[0],
  ): Promise<Awaited<ReturnType<Payload['update']>>> => {
    if (options.collection === POSTS_SLUG) {
      return origUpdate({
        ...(options as Parameters<Payload['update']>[0]),
        disableTransaction: true,
      })
    }

    if (options.collection !== GATED_CONTENT_SLUG) {
      return origUpdate(options as Parameters<Payload['update']>[0])
    }

    const merged = {
      ...options,
      disableTransaction: true,
    } as Parameters<Payload['update']>[0]

    const req = merged.req as PayloadRequest | undefined
    const { attempts: maxAttempts, delayMs } =
      cloudStoragePersistRetrySchedule(req)

    let attempt = 0
    while (true) {
      try {
        return await origUpdate(merged)
      } catch (err) {
        if (!isNotFoundError(err) || attempt >= maxAttempts) {
          throw err
        }
        attempt++
        await sleep(delayMs)
      }
    }
  }) as Payload['update']
}
