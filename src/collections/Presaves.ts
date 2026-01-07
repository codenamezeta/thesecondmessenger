import { CollectionConfig } from 'payload'

export const Presaves: CollectionConfig = {
  slug: 'presaves',
  admin: {
    useAsTitle: 'email',
    group: 'Audience Data',
  },
  access: {
    create: () => true, // Allow public to create (via API)
    read: ({ req: { user } }) => Boolean(user), // Only admins can read
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'spotifyId',
      type: 'text',
      unique: true,
    },
    {
      name: 'refreshToken',
      type: 'text', // THIS IS THE KEY TO THE KINGDOM
      required: true,
      admin: {
        hidden: true, // Hide from UI for security
      },
    },
    {
      name: 'campaigns',
      type: 'relationship',
      relationTo: 'songs',
      hasMany: true,
      label: 'Pre-Saved Songs',
    },
    {
      name: 'status',
      type: 'select',
      options: ['active', 'revoked'],
      defaultValue: 'active',
    },
  ],
}
