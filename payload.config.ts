import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { s3Storage } from '@payloadcms/storage-s3'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { plugins } from './plugins'

import { Posts } from './collections/Posts'
import { Categories } from './collections/Categories'
import { MailingList } from './collections/MailingList'
import { Media } from './collections/Media'
import { Playlists } from './collections/Playlists'
import { Presaves } from './collections/Presaves'
import { Releases } from './collections/Releases'
import { Songs } from './collections/Songs'
import { GatedContent } from './collections/GatedContent'
import { Tags } from './collections/Tags'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'
import { syncAudioTagsTask } from './lib/audio-tags/syncAudioTagsTask'
import { EMAIL_FROM_ADDRESS, EMAIL_FROM_NAME } from './lib/email'
import { patchGatedContentDisableTransactions } from './lib/payload-gated-content-transactions'
import { getServerSideURL } from './utilities/getURL'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: getServerSideURL(),
  email: resendAdapter({
    defaultFromAddress: EMAIL_FROM_ADDRESS,
    defaultFromName: EMAIL_FROM_NAME,
    apiKey: process.env.RESEND_API_KEY || '',
  }),
  onInit: async (payload) => {
    patchGatedContentDisableTransactions(payload)
  },
  /** Used by S3 presigned PUT (client uploads) for Content-Length alignment. */
  upload: {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 GiB — raise if you ship larger masters
    },
  },
  admin: {
    user: Users.slug,
    suppressHydrationWarning: true,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Posts,
    Categories,
    MailingList,
    // Spread Media with a fresh fields array so Payload's `addFolderFieldToCollection`
    // pushes into a throwaway copy rather than the module-level singleton. Without this,
    // every HMR reload mutates the same cached array and produces a duplicate `folder` field.
    { ...Media, fields: [...Media.fields] },
    Playlists,
    Presaves,
    Releases,
    Songs,
    GatedContent,
    Tags,
    Users,
  ],
  globals: [SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  jobs: {
    // Background tasks. Triggered from collection hooks via
    // `req.payload.jobs.queue(...)` and processed by the Vercel Cron
    // sweep at /api/cron/sync-audio-tags (which calls
    // `payload.jobs.run(...)`). On long-running deployments you can
    // alternatively run `pnpm payload jobs:run` as a worker process.
    tasks: [syncAudioTagsTask],
  },
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
    // Migrations live in /migrations at the repo root. Generate new ones with
    // `pnpm migrate:create <name>`; apply pending ones with `pnpm migrate`.
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    ...plugins,
    vercelBlobStorage({
      // Browser → Blob directly; avoids Vercel's ~4.5 MB serverless request-body
      // cap on POST /api/media (required for MP3 masters in admin).
      clientUploads: true,
      collections: {
        media: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
    s3Storage({
      enabled: Boolean(process.env.R2_BUCKET && process.env.R2_ENDPOINT),
      bucket: process.env.R2_BUCKET || '',
      // Browser → R2 PUT requires a matching bucket CORS policy. If uploads fail
      // with "Failed to fetch" after storage-s3-generate-signed-url 200, set
      // R2_DISABLE_CLIENT_UPLOADS=true (small files only on Vercel) or fix CORS
      // (see r2-cors-policy.example.json).
      clientUploads: process.env.R2_DISABLE_CLIENT_UPLOADS !== 'true',
      collections: {
        'gated-content': {
          /**
           * Do not set `disablePayloadAccessControl: true` here. With `clientUploads`
           * enabled, that mode only attaches `staticHandler` for client-upload
           * requests — normal GETs to `/api/gated-content/file/...` skip R2 and
           * Payload falls back to local disk. Leaving this option unset installs
           * the full R2 proxy handler. Vault tier checks still run via
           * `gatedContentReadAccess` + `checkFileAccess(isReadingStaticFile: true)`.
           */
          prefix: process.env.R2_PREFIX || 'gated-content',
          /** Keep admin + API `url` on the same-origin file route (not raw R2). */
          generateFileURL: ({ filename, prefix }) => {
            const path = `/api/gated-content/file/${encodeURIComponent(filename)}`
            return prefix
              ? `${path}?prefix=${encodeURIComponent(prefix)}`
              : path
          },
          // Signed GET redirects: auth + tier check run on `/api/gated-content/file/...`,
          // then the handler 302s to a short-lived presigned R2 URL so bytes stream
          // from Cloudflare R2 instead of proxying through Vercel (Fast Origin Transfer).
          signedDownloads: {
            expiresIn: 3600,
            shouldUseSignedURL: () => true,
          },
        },
      },
      config: {
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        endpoint: process.env.R2_ENDPOINT || '',
        forcePathStyle: true,
        region: 'auto',
      },
    }),
  ],
})
