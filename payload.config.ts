import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'
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
  ],
})
