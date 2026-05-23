import { BeforeSync, DocToSync } from '@payloadcms/plugin-search/types'
import { SONG_TAG_FIELDS } from '@/lib/songs/tagFields'

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

/**
 * Collect every tag name across the 11 ontology layers on a song doc.
 *
 * The search plugin invokes `beforeSync` from an `afterChange` hook
 * where the originalDoc is fully populated (depth ≥ 1 by default), so
 * each relationship array contains resolved Tag objects with `name`.
 * We defensively skip anything that doesn't look like one (older docs,
 * unresolved IDs) instead of throwing.
 *
 * Net effect: a global search for "running" surfaces songs tagged with
 * the Running activity, even when "running" never appears in the
 * lyrics or about copy.
 */
const collectAllTagNames = (doc: unknown): string => {
  if (!doc || typeof doc !== 'object') return ''
  const record = doc as Record<string, unknown>
  const names: string[] = []
  for (const field of SONG_TAG_FIELDS) {
    const value = record[field]
    if (!Array.isArray(value)) continue
    for (const entry of value) {
      if (
        entry &&
        typeof entry === 'object' &&
        'name' in entry &&
        typeof (entry as { name: unknown }).name === 'string'
      ) {
        names.push((entry as { name: string }).name)
      }
    }
  }
  return names.join(' ')
}

export const beforeSyncWithSearch: BeforeSync = async ({ req, originalDoc, searchDoc }) => {
  const {
    doc: { relationTo: collection },
  } = searchDoc

  const { slug, id, categories, title, meta } = originalDoc

  let bodyContent = ''

  try {
    if (collection === 'songs') {
      // Index lyrics, about section, and every tag-name across the
      // 11-layer Sonic Tag Ontology so faceted long-tail queries
      // ("running", "stratocaster", "blink-182") hit the global modal
      // even when those words never appear in lyrics or prose.
      const lyrics = originalDoc.lyrics || ''
      const aboutText = extractText(originalDoc.about)
      const tagText = collectAllTagNames(originalDoc)
      bodyContent = `${lyrics} ${aboutText} ${tagText}`
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
