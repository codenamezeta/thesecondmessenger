// collections/Tags.ts
import { CollectionConfig } from 'payload'
import {
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  FixedToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { formatSlug } from './utils/formatSlug'
import { TAG_ICON_OPTIONS } from '@/lib/songs/tagIconOptions'

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
    {
      name: 'icon',
      type: 'select',
      // Curated Lucide subset. Single source of truth is
      // `lib/songs/tagIconOptions.ts` (mirrored by the component registry
      // in `lib/songs/tagIcons.ts`). Front-end falls back to a per-category
      // default when unset, so this is always optional.
      options: [...TAG_ICON_OPTIONS],
      admin: {
        position: 'sidebar',
        description:
          'Optional. Glyph shown on song cards and the Sonic DNA panel for this tag. Leave empty to use the sensible default for this category (e.g. a guitar tag without an icon falls back to the instrument default).',
      },
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Editorial intro',
      admin: {
        description:
          'Optional. Renders above the song grid on /music/tag/<category>/<slug> landing pages. Use to give context for the tag (e.g. why a sub-genre matters, when a particular activity-tag is appropriate). Leave empty for tags that don\u2019t need editorial framing.',
      },
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
          FixedToolbarFeature(),
          InlineToolbarFeature(),
          HorizontalRuleFeature(),
        ],
      }),
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Hero image',
      admin: {
        description:
          'Optional. Hero image for the /music/tag landing page. If omitted, the page falls back to a stylized header without imagery.',
      },
    },
  ],
}
