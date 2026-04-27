import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
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
import { syncAudioTagsTask } from './lib/audio-tags/syncAudioTagsTask'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
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
  }),
  sharp,
  plugins: [
    ...plugins,
    vercelBlobStorage({
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
          prefix: process.env.R2_PREFIX || 'gated-content',
          signedDownloads: {
            expiresIn: 3600,
            shouldUseSignedURL: ({ filename }) => {
              const lower = filename.toLowerCase()
              return (
                lower.endsWith('.zip') ||
                lower.endsWith('.flac') ||
                lower.endsWith('.wav') ||
                lower.endsWith('.mp4') ||
                lower.endsWith('.mov') ||
                lower.endsWith('.webm')
              )
            },
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
