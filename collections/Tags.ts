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
      options: [
        { label: 'Genre', value: 'genre' },
        { label: 'Style', value: 'style' },
        { label: 'Mood', value: 'mood' },
        { label: 'Production', value: 'production' },
        { label: 'Theme', value: 'theme' },
        { label: 'Instrument', value: 'instrument' },
        { label: 'Arrangement', value: 'arrangement' },
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
