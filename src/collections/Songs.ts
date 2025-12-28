//* src/collections/Songs.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'
import { parseBuffer } from 'music-metadata'
import {
  lexicalEditor,
  HeadingFeature,
  FixedToolbarFeature,
  BlocksFeature,
  // TreeViewFeature,
  EXPERIMENTAL_TableFeature,
  TextStateFeature,
} from '@payloadcms/richtext-lexical'
import { Archive } from '@/blocks/ArchiveBlock/config'
import { Banner } from '@/blocks/Banner/config'
import { CallToAction } from '@/blocks/CallToAction/config'
import { Code } from '@/blocks/Code/config'
import { Content } from '@/blocks/Content/config'
import { FormBlock } from '@/blocks/Form/config'
import { MediaBlock } from '@/blocks/MediaBlock/config'

export const Songs: CollectionConfig = {
  slug: 'songs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'coverArt', 'releaseDate', 'status'],
  },
  folders: true,
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      // Uses the master recording's MP3 ID3 tags to prepopulate CMS fields.
      async ({ data, req, operation }) => {
        console.log('🎵 [Songs Hook] beforeValidate triggered for operation:', operation)

        // Only run if masterAudio is present and we are creating or updating
        if (!data?.masterAudio) {
          console.log('🎵 [Songs Hook] No masterAudio in data, skipping.')
          return data
        }

        // Check if we need to fill data (don't overwrite if there is already something typed)
        const needsTitle = !data.title
        const needsCredits = !data.credits || data.credits.length === 0
        const needsGenres = !data.genres

        if (!needsTitle && !needsCredits && !needsGenres) {
          console.log('🎵 [Songs Hook] All fields already populated, skipping.')
          return data
        }

        try {
          // 1. Get the File Object from Payload
          // Handle case where masterAudio might be an object (populated) or string (ID)
          const audioId =
            typeof data.masterAudio === 'object' ? data.masterAudio.id : data.masterAudio

          const mediaFile = await req.payload.findByID({
            collection: 'media',
            id: audioId,
          })

          if (!mediaFile || !mediaFile.url) {
            console.warn('🎵 [Songs Hook] Media file not found or has no URL.')
            return data
          }

          // 2. Fetch the stream (Works for Local or Vercel Blob/S3)
          let fileUrl = mediaFile.url
          if (fileUrl.startsWith('/')) {
            const protocol = req.protocol ? req.protocol.replace(':', '') : 'http'
            const host = req.headers.get('host') || 'localhost:3000'
            fileUrl = `${protocol}://${host}${fileUrl}`
          }

          console.log('🎵 [Songs Hook] Fetching URL:', fileUrl)
          const response = await fetch(fileUrl)
          if (!response.body) {
            console.warn('🎵 [Songs Hook] Fetch response has no body.')
            return data
          }

          // 3. Parse Metadata using music-metadata
          // We cast the web stream to a Node stream if necessary, or just read the buffer
          // For simplicity/compatibility, we can read the buffer
          const arrayBuffer = await response.arrayBuffer()
          const buffer = new Uint8Array(arrayBuffer)

          const metadata = await parseBuffer(buffer, mediaFile.mimeType || undefined)
          console.log('🎵 [Songs Hook] Metadata extracted:', {
            title: metadata.common.title,
            composers: metadata.common.composer,
            genres: metadata.common.genre,
          })

          // 4. Auto-Populate Fields
          if (metadata.common.title && needsTitle) {
            data.title = metadata.common.title
          }

          if (metadata.common.composer && metadata.common.composer.length > 0 && needsCredits) {
            const newCredits = metadata.common.composer.map((name) => ({
              name,
              category: 'Songwriter',
              roles: [],
            }))
            data.credits = [...(data.credits || []), ...newCredits]
          }

          if (metadata.common.genre && metadata.common.genre.length > 0 && needsGenres) {
            data.genres = metadata.common.genre.join(', ')
          }

          // Bonus: If you add a 'duration' number field to Songs, you can save this:
          // if (metadata.format.duration) data.duration = metadata.format.duration
        } catch (error) {
          console.error('🎵 [Songs Hook] Error extracting metadata:', error)
        }

        return data
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'coverArt',
      type: 'upload',
      relationTo: 'media',
      admin: {
        readOnly: true, // You don't edit this manually
        position: 'sidebar', // Tucks it away nicely
        description: 'Auto-synced from the related Release for the list view.',
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
      name: 'relatedReleases',
      type: 'join',
      collection: 'releases',
      on: 'tracks', // This matches the field name in Releases.ts
      label: 'Appears on Releases',
      admin: {
        position: 'sidebar',
        allowCreate: true, // Lets you create a new Release directly from here!
        description: 'Which Releases include this song?',
      },
    },
    {
      name: 'inPlaylists',
      type: 'join',
      collection: 'playlists',
      on: 'tracks', // This matches the field name in Playlists.ts
      label: 'Added to Playlists',
      admin: {
        position: 'sidebar',
        allowCreate: true,
        description: 'Add this song to existing playlists.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        // --- TAB 1: MEDIA & PLAYBACK ---
        {
          label: 'Media',
          fields: [
            {
              name: 'youtubeId',
              type: 'text',
              label: 'YouTube Video ID',
              required: false,
              unique: true,
              admin: {
                description:
                  'The 11-character ID (e.g., dQw4w9WgXcQ). Required for the Global Player.',
              },
            },
            {
              name: 'masterAudio',
              type: 'upload',
              relationTo: 'media',
              label: 'Master Recording (MP3/WAV)',
            },
            {
              name: 'stems',
              type: 'array',
              label: 'Interactive Stems',
              admin: {
                description: 'Upload synchronized files for the deep-dive player.',
              },
              fields: [
                { name: 'stemName', type: 'text', required: true }, // e.g. "Drums"
                { name: 'audioFile', type: 'upload', relationTo: 'media', required: true },
                { name: 'volume', type: 'number', defaultValue: 0.667, min: 0, max: 1 },
              ],
            },
          ],
        },

        // --- TAB 2: METADATA (Genres, BPM, Credits) ---
        {
          label: 'Metadata',
          fields: [
            {
              type: 'collapsible',
              label: 'Recording Details',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'isrc',
                      type: 'text',
                      label: 'ISRC Code',
                      hooks: {
                        beforeValidate: [
                          ({ value }) => {
                            if (typeof value === 'string') {
                              return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                            }
                            return value
                          },
                        ],
                      },
                      validate: (value: any) => {
                        if (!value) return true
                        // Simulate the hook's cleaning so client-side validation passes for unformatted input
                        const cleanValue =
                          typeof value === 'string'
                            ? value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
                            : value
                        // CC (2 chars) + OOO (3 alphanumeric) + YY (2 digits) + SSSSS (5 digits)
                        const regex = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/
                        return (
                          regex.test(cleanValue as string) ||
                          'Invalid ISRC format. Must be 12 characters: CCOOOYYSSSSS.'
                        )
                      },
                    },
                    { name: 'iswc', type: 'text', label: 'ISWC Code' },
                  ],
                },
                // --- DYNAMIC BPM/KEY LOGIC ---
                {
                  name: 'isDynamic',
                  type: 'checkbox',
                  label: 'Song changes Key or Tempo?',
                  defaultValue: false,
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'bpm', type: 'number', label: 'BPM', required: false },
                    {
                      name: 'bpmEnd',
                      type: 'number',
                      label: 'BPM (End)',
                      admin: {
                        condition: (data, siblingData) => siblingData.isDynamic,
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'key', type: 'text', label: 'Key' },
                    {
                      name: 'keyEnd',
                      type: 'text',
                      label: 'Key (End)',
                      admin: {
                        condition: (data, siblingData) => siblingData.isDynamic,
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'streamingLinks',
              type: 'array',
              label: 'Streaming & External Links',
              admin: {
                initCollapsed: true,
                // components: {
                //   RowLabel: ({ data }: { data: any }) => data?.platform || 'New Link',
                // } as any,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      options: [
                        'YouTube Music',
                        'Spotify',
                        'Apple Music',
                        'Amazon Music',
                        'Tidal',
                        'Qobuz',
                        'Deezer',
                        'Pandora',
                        'SoundCloud',
                        'Bandcamp',
                        'Other',
                      ],
                    },
                    {
                      name: 'url',
                      type: 'text',
                      required: true,
                      label: 'URL',
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Tooltip / Note',
                  admin: {
                    description: 'Optional text for hover states or extra context.',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Classification (Genre, Type, Content)',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'compositionType',
                      type: 'select',
                      options: ['Original', 'Cover', 'Public Domain'],
                      defaultValue: 'Original',
                      required: true,
                    },
                    {
                      name: 'recordingType',
                      type: 'select',
                      options: ['Studio', 'Live', 'Demo'],
                      defaultValue: 'Studio',
                      required: true,
                    },
                    {
                      name: 'isExplicit',
                      type: 'checkbox',
                      label: 'Explicit Content / Parental Advisory',
                    },
                  ],
                },
                {
                  name: 'genres',
                  type: 'text',
                },
                {
                  name: 'moods',
                  type: 'text',
                },
              ],
            },
            {
              name: 'credits',
              type: 'array',
              label: 'Credits',
              // admin: {
              //   components: {
              //     // This makes the row header say "Michael Zeta" instead of "Credit 01"
              //     RowLabel: ({ data }) => data?.name || 'New Credit',
              //   },
              // },
              fields: [
                {
                  name: 'name',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'category',
                  type: 'select',
                  options: [
                    'Songwriter',
                    'Performer',
                    'Producer/Engineer',
                    'Visuals',
                    'Special Thanks',
                  ],
                  required: true,
                },
                {
                  name: 'roles',
                  type: 'array',
                  label: 'Roles List',
                  fields: [
                    {
                      name: 'role',
                      type: 'text',
                      label: 'Instrument/Role',
                    },
                  ],
                  admin: {
                    description: 'Add multiple roles (e.g. "Guitar", "Backing Vocals")',
                  },
                },
              ],
            },
          ],
        },

        // --- TAB 3: LINER NOTES (Rich Content) ---
        {
          label: 'Liner Notes',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'tagline',
                  type: 'textarea',
                  label: 'Tagline',
                  maxLength: 140, // Enforces limit.
                  required: false,
                  admin: {
                    rows: 2,
                    description:
                      'A one or two sentence tagline or "elevator pitch". SoundCloud limits to 140 characters.',
                  },
                },
              ],
            },
            {
              name: 'about',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ defaultFeatures, rootFeatures }) => {
                  return [
                    ...defaultFeatures,
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'] }),
                    FixedToolbarFeature(),
                    BlocksFeature({
                      blocks: [Banner, Code, MediaBlock, Archive, CallToAction, Content, FormBlock],
                    }),
                    // TreeViewFeature(),
                    EXPERIMENTAL_TableFeature(),
                    TextStateFeature(),
                  ]
                },
              }),
              label: 'About this song',
              admin: {
                description:
                  'The full story, sonic details, and lyrics. Supports embeds and images.',
              },
            },
            {
              name: 'lyrics',
              type: 'textarea',
              label: 'Lyrics',
              admin: { description: 'Plain text version for search indexing and quick view.' },
            },
          ],
        },

        // --- TAB 4: DOWNLOADS & PERMISSIONS ---
        {
          label: 'Downloads & Bonus',
          fields: [
            {
              name: 'downloadPermissions',
              type: 'group',
              label: 'Download Settings',
              fields: [
                {
                  name: 'allowMasterDownload',
                  type: 'checkbox',
                  label: 'Allow Public MP3 Download',
                  defaultValue: false,
                },
                {
                  name: 'allowStemDownload',
                  type: 'checkbox',
                  label: 'Allow Stem Download',
                  defaultValue: false,
                },
                {
                  name: 'requiresEmail',
                  type: 'checkbox',
                  label: 'Require Email to Download',
                  defaultValue: true,
                },
              ],
            },
            {
              name: 'bonusContent',
              type: 'array',
              label: 'Bonus Assets',
              fields: [
                {
                  name: 'type',
                  type: 'select',
                  options: ['Alternate Audio', 'Video', 'Artwork', 'Sheet Music', 'Other'],
                },
                { name: 'label', type: 'text', required: true },
                { name: 'file', type: 'upload', relationTo: 'media' }, // Allows any file type supported by Media collection
                {
                  name: 'accessLevel',
                  type: 'select',
                  options: ['Public', 'Press', 'Members'],
                  defaultValue: 'Public',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
