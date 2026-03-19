import { CollectionConfig } from 'payload'

export const MailingList: CollectionConfig = {
  slug: 'mailing-list',
  admin: {
    useAsTitle: 'email',
    group: 'Audience Data',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'source',
      type: 'select',
      options: ['spotify_presave', 'newsletter_signup', 'merch_purchase'],
      defaultValue: 'spotify_presave',
    },
    {
      name: 'tags',
      type: 'text', // e.g., "fan, presave"
    },
  ],
}
