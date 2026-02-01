// src/collections/utils/formatSlug.ts
import { FieldHook } from 'payload'

const format = (val: string): string =>
  val
    .replace(/ /g, '-') // Replace space with hyphen
    .replace(/--/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/[^\w-]+/g, '') // Remove non-alphanumeric characters
    .toLowerCase() // Convert to lowercase

export const formatSlug =
  (fallback: string): FieldHook =>
  ({ value, originalDoc, data }) => {
    if (typeof value === 'string') {
      return format(value)
    }
    const fallbackData = data?.[fallback] || originalDoc?.[fallback]

    if (fallbackData && typeof fallbackData === 'string') {
      return format(fallbackData)
    }

    return value
  }
