import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

// Helper to extract text from Lexical JSON
const extractText = (node: unknown): string => {
  if (!node) return ''
  if (Array.isArray(node)) {
    return node.map(extractText).join(' ')
  }
  if (typeof node === 'object') {
    const maybeNode = node as Record<string, unknown>
    const text = maybeNode.text
    if (typeof text === 'string') return text

    const children = maybeNode.children
    if (children) return extractText(children)

    const root = maybeNode.root
    if (root) return extractText(root)
  }
  return ''
}

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  let bodyContent = ''

  try {
    if (collection === 'songs') {
      // Index lyrics and about section
      const lyrics = originalDoc.lyrics || ''
      const aboutText = extractText(originalDoc.about)
      bodyContent = `${lyrics} ${aboutText}`
    } else if (collection === 'posts') {
      // Index rich text content
      bodyContent = extractText(originalDoc.content)
    }
  } catch (e) {
    console.error('Error extracting search body:', e)
  }

  // `search.body` is btree-indexed; Postgres rejects index entries larger than ~2704 bytes.
  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    body: bodyContent.slice(0, 2000),
    meta: {
      ...meta,
      title: meta?.title || title,
      image: meta?.image?.id || meta?.image,
      description: meta?.description,
    },
    categories: [],
  }

  if (categories && Array.isArray(categories) && categories.length > 0) {
    const populatedCategories: { id: string | number; title: string }[] = []
    for (const category of categories) {
      if (!category) {
        continue
      }

      if (typeof category === 'object') {
        populatedCategories.push(category)
        continue
      }

      const doc = await req.payload.findByID({
        collection: 'categories',
        id: category,
        disableErrors: true,
        depth: 0,
        select: { title: true },
        req,
      })

      if (doc !== null) {
        populatedCategories.push(doc)
      } else {
        console.error(
          `Failed. Category not found when syncing collection '${collection}' with id: '${id}' to search.`,
        )
      }
    }

    modifiedDoc.categories = populatedCategories.map((each) => ({
      relationTo: 'categories',
      categoryID: String(each.id),
      title: each.title,
    }))
  }

  return modifiedDoc
}
