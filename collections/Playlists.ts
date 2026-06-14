// src/collections/Playlists.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'

export const Playlists: CollectionConfig = {
  slug: 'playlists',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'displayOrder', 'isFeatured'],
  },
  defaultSort: 'displayOrder',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'displayOrder',
      type: 'number',
      label: 'Display Order',
      defaultValue: 100,
      admin: {
        position: 'sidebar',
        description:
          'Lower numbers appear first in the player. The auto-generated "Discography" always leads, so start your custom playlists at 1+.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      admin: { position: 'sidebar' },
      hooks: {
        beforeValidate: [formatSlug('title')],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Playlist Description',
    },
    {
      name: 'coverArt',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'tracks',
      type: 'relationship',
      relationTo: 'songs',
      hasMany: true,
      label: 'Songs',
      admin: {
        description: 'Add and reorder songs. Updates instantly on the site.',
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Feature on Homepage?',
      defaultValue: false,
    },
  ],
}
