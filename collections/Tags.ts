// collections/Tags.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'

export const Tags: CollectionConfig = {
  slug: 'tags',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'slug'],
    group: 'Config', // Keeps your sidebar clean
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      // Order matches the 11-layer ontology in `.cursor/rules/sonic-tag-ontology.mdc`.
      // Each value is consumed by `filterOptions` on the matching Songs.ts relationship
      // field, so renaming any value here MUST be paired with a data migration.
      options: [
        { label: 'Genre', value: 'genre' },
        { label: 'Sub-genre', value: 'subgenre' },
        { label: 'Activities / Actions', value: 'activity' },
        { label: 'Theme', value: 'theme' },
        { label: 'Mood', value: 'mood' },
        { label: 'Production', value: 'production' },
        { label: 'Instrument', value: 'instrument' },
        { label: 'Gear', value: 'gear' },
        { label: 'Arrangement', value: 'arrangement' },
        { label: 'Influence', value: 'influence' },
        { label: 'Other', value: 'other' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        position: 'sidebar',
        readOnly: false,
      },
      hooks: {
        beforeValidate: [formatSlug('name')],
      },
    },
  ],
}
