export type BreadcrumbJsonLdItem = {
  name: string
  item: string
}

/** Standalone `BreadcrumbList` node for use inside `@graph`. */
export function buildBreadcrumbListJsonLd(
  items: BreadcrumbJsonLdItem[],
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: entry.name,
      item: entry.item,
    })),
  }
}

/** Wrap one or more schema.org nodes in a shared `@context` + `@graph`. */
export function buildJsonLdGraph(
  nodes: Record<string, unknown>[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': nodes,
  }
}
