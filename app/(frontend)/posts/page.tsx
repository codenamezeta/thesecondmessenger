import type { Metadata } from 'next/types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { Header } from '@/components/Header'
import { BlogArchive } from '@/components/BlogArchive'
import type { Category } from '@/payload-types'
// import PageClient from './page.client'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function PostsPage() {
  const payload = await getPayload({ config: configPromise })

  const posts = await payload.find({
    collection: 'posts',
    depth: 2,
    limit: 100,
    overrideAccess: false,
    sort: '-publishedAt',
    where: {
      _status: { equals: 'published' },
    },
  })

  const categoriesResult = await payload.find({
    collection: 'categories',
    limit: 100,
    overrideAccess: false,
  })

  const categories = (categoriesResult.docs as Category[]).map((cat) => ({
    id: cat.id,
    title: cat.title,
    slug: cat.slug,
  }))

  return (
    <main className="min-h-screen">
      {/* <PageClient /> */}

      <Header
        eyebrow="// ACCESSING TRANSMISSION ARCHIVE"
        title="Transmissions"
        description="Field reports, production logs, and dispatches from deep inside The Second Messenger universe."
        stats={
          posts.totalDocs > 0
            ? [
                { value: posts.totalDocs, label: 'total entries' },
                { value: categories.length, label: 'categories' },
              ]
            : null
        }
      />

      <div className="container py-12">
        <BlogArchive initialPosts={posts.docs} categories={categories} />
      </div>
    </main>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: 'Transmissions | The Second Messenger',
    description:
      'Field reports, production logs, and dispatches from deep inside The Second Messenger universe.',
  }
}
