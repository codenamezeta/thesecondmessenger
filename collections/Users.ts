import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['name', 'email', 'role', 'isPremiumMember'],
    useAsTitle: 'name',
  },
  auth: true,
  // SECURITY: Only let users with the 'admin' role log into the Payload CMS dashboard
  access: {
    admin: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
      // SECURITY: Only admins can change a user's role
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'isPremiumMember',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description:
          'Indicates if the user has an active premium subscription.',
      },
      // SECURITY: Users cannot update their own premium status via API
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: {
        readOnly: true, // This will eventually be filled automatically by Stripe
        position: 'sidebar',
        description: 'Used to link this account to Stripe payments.',
      },
    },
    // --- YOUTUBE OAUTH TOKENS ---
    {
      name: 'youtubeConnected',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Indicates if the user has linked their YouTube account.',
        readOnly: true,
      },
    },
    {
      name: 'googleAccessToken',
      type: 'text',
      // SECURITY: Never send this token to the frontend!
      access: {
        read: () => false,
        update: () => false,
      },
      admin: {
        disabled: true, // Hides the actual token string from the Admin UI
      },
    },
    {
      name: 'googleRefreshToken',
      type: 'text',
      // SECURITY: The refresh token is highly sensitive. Keep it locked down.
      access: {
        read: () => false,
        update: () => false,
      },
      admin: {
        disabled: true,
      },
    },
    {
      name: 'googleTokenExpiry',
      type: 'date',
      access: {
        read: () => false,
        update: () => false,
      },
      admin: {
        disabled: true,
      },
    },
  ],
}
