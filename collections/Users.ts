import type { CollectionConfig } from 'payload'
import { anyone } from '@/access/anyone'
import {
  buildForgotPasswordEmailHTML,
  EMAIL_FROM_NAME,
} from '@/lib/email'
import { THEME_SELECT_OPTIONS } from '@/lib/themes'
import { notifyOwnerNewAccount } from '@/utilities/notifications'
import { upsertAudienceContact } from '@/utilities/resendAudience'

const RANK_LABELS: Record<string, string> = {
  ensign: 'Ensign',
  lieutenant: 'Lieutenant',
  commander: 'Commander',
  captain: 'Captain',
  admiral: 'Admiral',
}

const canReadPrivateUserField = ({
  req: { user },
  doc,
}: {
  req: { user?: { id: number; role?: string } | null }
  doc?: { id?: number } | null
}): boolean => {
  if (!user) return false
  if (user.role === 'admin') return true
  return user.id === doc?.id
}

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    defaultColumns: ['displayName', 'email', 'role', 'crewRank'],
    useAsTitle: 'displayName',
  },
  auth: {
    forgotPassword: {
      generateEmailSubject: () => `Reset your ${EMAIL_FROM_NAME} password`,
      generateEmailHTML: (args) => {
        const token = args?.token
        const email = args?.user?.email
        if (!token || !email) {
          return '<p>Password reset link is unavailable. Please request a new reset email.</p>'
        }
        return buildForgotPasswordEmailHTML({ token, email })
      },
    },
  },
  access: {
    create: anyone,
    // Public profiles: anyone can read user docs; sensitive fields restrict themselves
    read: anyone,
    // Users can update their own document; admins can update any
    update: ({ req: { user }, id }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (id === undefined || id === null) return false
      return String(user.id) === String(id)
    },
    admin: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Merge incoming data with the existing document so partial updates
        // (e.g. only changing displayNameFormat) still resolve the full name.
        const resolve = <T>(key: string, fallback: T): T =>
          (data[key] ?? originalDoc?.[key] ?? fallback) as T

        const format = resolve<string>('displayNameFormat', 'username')
        const firstName = resolve<string>('firstName', '')
        const lastName = resolve<string>('lastName', '')
        const username = resolve<string>('username', '')
        const crewRank = resolve<string>('crewRank', 'ensign')
        const rankLabel = RANK_LABELS[crewRank] ?? 'Ensign'

        const formats: Record<string, string> = {
          firstName,
          lastName,
          fullName: [firstName, lastName].filter(Boolean).join(' '),
          username,
          rank_firstName: `${rankLabel} ${firstName}`.trim(),
          rank_lastName: `${rankLabel} ${lastName}`.trim(),
          rank_fullName: `${rankLabel} ${firstName} ${lastName}`.trim(),
          rank_username: `${rankLabel} ${username}`.trim(),
        }

        const computedDisplayName = formats[format]?.trim()
        data.displayName = computedDisplayName || username || 'Messenger'
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        const wantsNewsletter = doc.notificationSettings?.newsletter !== false

        if (operation === 'create') {
          // Best-effort: never let alerting/audience sync break signup.
          await notifyOwnerNewAccount(req.payload, {
            id: doc.id,
            username: doc.username,
            email: doc.email,
          })
          await upsertAudienceContact({
            email: doc.email,
            firstName: doc.firstName ?? null,
            lastName: doc.lastName ?? null,
            unsubscribed: !wantsNewsletter,
          })
          return
        }

        // On update, keep the Resend audience in sync when the newsletter
        // opt-in (or email) changes.
        const previousNewsletter =
          previousDoc?.notificationSettings?.newsletter !== false
        const emailChanged = doc.email !== previousDoc?.email
        if (wantsNewsletter !== previousNewsletter || emailChanged) {
          await upsertAudienceContact({
            email: doc.email,
            firstName: doc.firstName ?? null,
            lastName: doc.lastName ?? null,
            unsubscribed: !wantsNewsletter,
          })
        }
      },
    ],
  },
  fields: [
    // --- PROFILE IDENTITY ---
    {
      name: 'firstName',
      type: 'text',
      required: false,
      access: {
        read: canReadPrivateUserField,
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: false,
      access: {
        read: canReadPrivateUserField,
      },
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      unique: true,
    },
    // --- DISPLAY NAME ---
    {
      name: 'displayNameFormat',
      type: 'select',
      defaultValue: 'rank_lastName',
      required: true,
      options: [
        { label: 'First name  (e.g. "Alex")', value: 'firstName' },
        { label: 'Last name  (e.g. "Carter")', value: 'lastName' },
        { label: 'Full name  (e.g. "Alex Carter")', value: 'fullName' },
        { label: 'Username  (e.g. "spacedrifter")', value: 'username' },
        {
          label: 'Rank + First name  (e.g. "Commander Alex")',
          value: 'rank_firstName',
        },
        {
          label: 'Rank + Last name  (e.g. "Commander Carter")',
          value: 'rank_lastName',
        },
        {
          label: 'Rank + Full name  (e.g. "Commander Alex Carter")',
          value: 'rank_fullName',
        },
        {
          label: 'Rank + Username  (e.g. "Commander spacedrifter")',
          value: 'rank_username',
        },
      ],
      admin: {
        description:
          'Controls how your name appears to others on the site, in the forum, and in email communications.',
      },
    },
    {
      // Auto-computed by the beforeChange hook from displayNameFormat + other fields.
      // The select-based format options mean users can never inject arbitrary text.
      name: 'displayName',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'Auto-computed from your display name format preference above.',
      },
    },
    // --- PROFILE CUSTOMIZATION ---
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      required: false,
    },
    {
      name: 'bio',
      type: 'textarea',
      required: false,
    },
    {
      // Public: fans can proudly show their favorite TSM track on their profile.
      name: 'favoriteSong',
      type: 'relationship',
      relationTo: 'songs',
      required: false,
      admin: {
        description: 'Your favorite TSM track, shown on your public profile.',
      },
    },
    {
      name: 'zipCode',
      type: 'number',
      required: false,
      access: {
        read: canReadPrivateUserField,
      },
    },
    // --- DEMOGRAPHICS (private; used for aggregate audience insights) ---
    {
      name: 'birthdate',
      type: 'date',
      required: false,
      admin: {
        description: 'Private. Used for age demographics only.',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'yyyy-MM-dd' },
      },
      access: {
        read: canReadPrivateUserField,
      },
    },
    {
      name: 'gender',
      type: 'select',
      required: false,
      options: [
        { label: 'Female', value: 'female' },
        { label: 'Male', value: 'male' },
        { label: 'Non-binary', value: 'non_binary' },
        { label: 'Other', value: 'other' },
        { label: 'Prefer not to say', value: 'prefer_not_to_say' },
      ],
      admin: {
        description: 'Private. Used for aggregate demographics only.',
      },
      access: {
        read: canReadPrivateUserField,
      },
    },
    // --- PREFERENCES ---
    {
      // Nullable on purpose: an unset value means "follow the featured/site
      // default theme", so flipping the site default on release day reaches
      // every user who has not explicitly chosen their own theme.
      name: 'themePreference',
      type: 'select',
      required: false,
      options: THEME_SELECT_OPTIONS,
      admin: {
        description:
          'Preferred site color theme. Leave empty to follow the featured theme.',
      },
    },
    // --- NOTIFICATION / NEWSLETTER PREFERENCES ---
    {
      name: 'notificationSettings',
      type: 'group',
      admin: {
        description: 'Control which emails and alerts you receive.',
      },
      fields: [
        {
          name: 'newsletter',
          type: 'checkbox',
          defaultValue: true,
          label: 'Newsletter & new release announcements',
        },
        {
          name: 'productUpdates',
          type: 'checkbox',
          defaultValue: true,
          label: 'Product updates & feature news',
        },
        {
          name: 'accountActivity',
          type: 'checkbox',
          defaultValue: true,
          label: 'Account & billing activity',
        },
      ],
    },
    // --- AUTH ---
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      access: {
        read: canReadPrivateUserField,
      },
    },
    // --- CMS ACCESS ---
    {
      name: 'role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
      defaultValue: 'user',
      required: true,
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    // --- CREW RANK (membership tier) ---
    {
      name: 'crewRank',
      type: 'select',
      defaultValue: 'ensign',
      required: true,
      options: [
        { label: 'Ensign (Free)', value: 'ensign' },
        { label: 'Lieutenant (Tier 1)', value: 'lieutenant' },
        { label: 'Commander (Tier 2)', value: 'commander' },
        { label: 'Captain (Tier 3)', value: 'captain' },
        { label: 'Admiral', value: 'admiral' },
      ],
      // Only admins can promote/demote ranks; Stripe webhook also updates via
      // a server-side Payload local API call which bypasses field access.
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    // --- STRIPE ---
    {
      name: 'stripeCustomerId',
      type: 'text',
      access: {
        read: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
      admin: {
        readOnly: true,
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
      access: {
        read: () => false,
        update: () => false,
      },
      admin: { disabled: true },
    },
    {
      name: 'googleRefreshToken',
      type: 'text',
      access: {
        read: () => false,
        update: () => false,
      },
      admin: { disabled: true },
    },
    {
      name: 'googleTokenExpiry',
      type: 'date',
      access: {
        read: () => false,
        update: () => false,
      },
      admin: { disabled: true },
    },
  ],
}
