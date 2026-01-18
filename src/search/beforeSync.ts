import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'

// Helper to extract text from Lexical JSON
const extractText = (node: any): string => {
  if (!node) return ''
  if (Array.isArray(node)) {
    return node.map(extractText).join(' ')
  }
  if (typeof node === 'object') {
    if (node.text) return node.text
    if (node.children) return extractText(node.children)
    if (node.root) return extractText(node.root)
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
    } else if (collection === 'pages') {
      // Index layout blocks
      if (originalDoc.layout && Array.isArray(originalDoc.layout)) {
        bodyContent = originalDoc.layout
          .map((block: any) => {
            // Attempt to extract text from known text-heavy blocks
            if (block.blockType === 'content') {
              // Assuming content block has columns -> richText
              return block.columns?.map((col: any) => extractText(col.richText)).join(' ')
            }
            // For other blocks, maybe just try to JSON stringify or skip
            // Let's rely on recursive search if we can passed the whole block structure,
            // but block structures vary. Let's start with 'content' blocks as they are most common.
            return ''
          })
          .join(' ')
      }
    }
  } catch (e) {
    console.error('Error extracting search body:', e)
  }

  const modifiedDoc: DocToSync = {
    ...searchDoc,
    slug,
    body: bodyContent.slice(0, 8000), // Limit size just in case
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
