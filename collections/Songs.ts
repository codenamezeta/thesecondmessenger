//* src/collections/Songs.ts
import { CollectionConfig } from 'payload'
import { formatSlug } from './utils/formatSlug'
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
import type { Release } from '@/payload-types'
import { queueAudioTagSync } from '@/lib/audio-tags/queueAudioTagSync'

/** hasMany → `tags` relationships on Song; duplicate IDs can appear as duplicate `_rels` rows. */
const SONG_TAG_RELATIONSHIP_KEYS = [
  'genres',
  'styles',
  'moods',
  'themes',
  'instruments',
  'production',
  'arrangements',
  'otherTags',
] as const

function relationEntryId(entry: unknown): string | null {
  if (entry === null || entry === undefined) return null
  if (typeof entry === 'number' || typeof entry === 'string') return String(entry)
  if (typeof entry === 'object' && 'id' in entry) {
    const id = (entry as { id: unknown }).id
    if (typeof id === 'number' || typeof id === 'string') return String(id)
  }
  return null
}

/** Drop duplicate tag links by related document id; preserves first occurrence shape (id vs populated). */
function dedupeManyRelationshipArray(value: unknown): unknown {
  if (!Array.isArray(value) || value.length < 2) return value
  const seen = new Set<string>()
  const out: unknown[] = []
  for (const entry of value) {
    const id = relationEntryId(entry)
    if (!id) {
      out.push(entry)
      continue
    }
    if (seen.has(id)) continue
    seen.add(id)
    out.push(entry)
  }
  return out.length === value.length ? value : out
}

export const Songs: CollectionConfig = {
  slug: 'songs',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'coverArt', 'releaseDate', 'status'],
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      // --- HOOK: PULL PARENT RELEASE DATA ---
      // If the song is being saved and lacks a date/cover, try to find its parent Release and copy them.
      async ({ data, req, originalDoc }) => {
        if (!data) return data
        try {
          // We can only look up parents for existing songs (need an ID)
          const requestWithParams = req as typeof req & {
            params?: {
              id?: string
            }
          }
          const songId = originalDoc?.id || requestWithParams.params?.id

          if (!songId) return data

          // Only search if we are missing fields
          if (!data.releaseDate || !data.coverArt) {
            const { docs: releases } = await req.payload.find({
              collection: 'releases',
              where: {
                tracks: {
                  equals: songId,
                },
              },
              limit: 1,
              depth: 0,
              req,
            })

            if (releases.length > 0) {
              const release = releases[0] as Pick<
                Release,
                'title' | 'releaseDate' | 'coverArt'
              >

              if (!data.releaseDate && release.releaseDate) {
                data.releaseDate = release.releaseDate
                req.payload.logger.info(
                  `🎵 [Songs Hook] Pulled release date from "${release.title}"`,
                )
              }

              if (!data.coverArt && release.coverArt) {
                const artId =
                  typeof release.coverArt === 'object'
                    ? release.coverArt.id
                    : release.coverArt
                data.coverArt = artId
                req.payload.logger.info(
                  `🎵 [Songs Hook] Pulled cover art from "${release.title}"`,
                )
              }
            }
          }
        } catch (error) {
          req.payload.logger.error(
            `🎵 [Songs Hook] Failed to pull parent release data: ${error}`,
          )
        }

        return data
      },
    ],
    beforeChange: [
      async ({ data, originalDoc, operation }) => {
        if (!data || typeof data !== 'object') return data
        const d = data as Record<string, unknown>
        const prev =
          operation === 'update' && originalDoc && typeof originalDoc === 'object'
            ? (originalDoc as Record<string, unknown>)
            : null
        for (const key of SONG_TAG_RELATIONSHIP_KEYS) {
          if (d[key] !== undefined) {
            d[key] = dedupeManyRelationshipArray(d[key])
            continue
          }
          // Partial updates often omit unchanged fields; still collapse duplicate rel rows in DB.
          if (prev) {
            const cur = prev[key]
            if (Array.isArray(cur) && cur.length >= 2) {
              const deduped = dedupeManyRelationshipArray(cur)
              if (deduped !== cur) d[key] = deduped
            }
          }
        }
        return data
      },
    ],
    afterRead: [
      ({ doc }) => {
        if (!doc || typeof doc !== 'object') return doc
        const d = doc as Record<string, unknown>
        for (const key of SONG_TAG_RELATIONSHIP_KEYS) {
          const cur = d[key]
          if (cur === undefined || cur === null) continue
          d[key] = dedupeManyRelationshipArray(cur)
        }
        return doc
      },
    ],
    afterChange: [
      // --- HOOK: QUEUE AUDIO TAG SYNC ---
      // After a song is saved, write the CMS-canonical metadata back into the
      // master audio file's ID3v2.3 / Vorbis tags. We delegate to a Payload
      // job so the admin save returns immediately; the actual download →
      // mutate → upload happens later via Vercel Cron hitting the queue.
      async ({ doc, previousDoc, req, operation }) => {
        if (operation !== 'create' && operation !== 'update') return doc
        try {
          await queueAudioTagSync({
            payload: req.payload,
            doc,
            previousDoc,
            req,
          })
        } catch (err) {
          req.payload.logger.error({
            err,
            msg: `🎵 [Songs Hook] Failed to enqueue audio tag sync for song id=${doc?.id}`,
          })
        }
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description:
          'Exact song name in title case. Drives the TIT2 (title) frame written to the audio file. Parenthetical version qualifiers like "(Acoustic)" or "(Demo)" are OK; do NOT include "feat. X" — guest artists go in Featured Artists in the sidebar.',
      },
    },
    {
      name: 'coverArt',
      type: 'upload',
      relationTo: 'media',
      admin: {
        readOnly: true, // You don't edit this manually
        position: 'sidebar', // Tucks it away nicely
        description: 'Auto-synced from the related Release.',
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
      name: 'releaseDate',
      type: 'date',
      admin: {
        position: 'sidebar',
        readOnly: true, // <--- Locked down
        description: 'Auto-synced from the related Release.',
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
        description:
          'Releases whose tracklists already include this song (filtered). Empty until the song is on at least one release—use Link existing or edit the release tracklist.',
        components: {
          beforeInput: [
            '@/components/payload-admin/LinkExistingJoinBeforeInput#LinkExistingJoinBeforeInput',
          ],
        },
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
        description:
          'Playlists whose tracklists already include this song (filtered). Empty until linked—use Link existing or open a playlist and add this song under Songs.',
        defaultColumns: ['title', 'description'],
        components: {
          beforeInput: [
            '@/components/payload-admin/LinkExistingJoinBeforeInput#LinkExistingJoinBeforeInput',
          ],
        },
      },
    },
    {
      name: 'featuredArtists',
      type: 'array',
      label: 'Featured Artists',
      admin: {
        position: 'sidebar',
        initCollapsed: true,
        description:
          'Guest artists. Composed into the ID3 ARTIST (TPE1) frame at sync time as "The Second Messenger feat. [Names]". Leave empty for solo tracks. Album Artist (TPE2) is always "The Second Messenger" regardless.',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          admin: {
            description:
              'Stage / display name as you want it to read after "feat.".',
          },
        },
      ],
    },
    {
      name: 'primaryRelease',
      type: 'relationship',
      relationTo: 'releases',
      hasMany: false,
      label: 'Primary Release',
      admin: {
        position: 'sidebar',
        description:
          'The canonical Release this song belongs to for tagging purposes. Drives ALBUM (TALB), TRACK (TRCK), and DISC (TPOS). If the song appears on multiple releases, this is the "original" / authoritative one. Use Tracklist on the Release itself to set track order.',
      },
    },
    {
      type: 'collapsible',
      label: 'Tag Sync Status',
      admin: {
        position: 'sidebar',
        initCollapsed: true,
        description:
          'Background sync of CMS fields → MP3/FLAC ID3 tags. Runs after every save via Vercel Cron.',
      },
      fields: [
        {
          name: 'tagSyncStatus',
          type: 'select',
          options: [
            { label: 'Idle', value: 'idle' },
            { label: 'Queued', value: 'queued' },
            { label: 'Syncing', value: 'syncing' },
            { label: 'Synced', value: 'synced' },
            { label: 'Error', value: 'error' },
          ],
          defaultValue: 'idle',
          admin: {
            readOnly: true,
            description: 'Updated automatically by the sync job.',
          },
        },
        {
          name: 'tagsSyncedAt',
          type: 'date',
          label: 'Last Synced',
          admin: {
            readOnly: true,
            date: { pickerAppearance: 'dayAndTime' },
            description: 'Timestamp of the last successful tag write.',
          },
        },
        {
          name: 'tagSyncError',
          type: 'textarea',
          label: 'Last Error',
          admin: {
            readOnly: true,
            condition: (_data, siblingData) =>
              siblingData?.tagSyncStatus === 'error',
            description:
              'Error message from the most recent failed sync attempt. Cleared on successful sync.',
          },
        },
      ],
    },
    {
      name: 'tagsSyncedHash',
      type: 'text',
      admin: {
        hidden: true,
        readOnly: true,
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
              name: 'masterAudio',
              type: 'upload',
              relationTo: 'media',
              label: 'Master Recording (MP3/FLAC/WAV)',
              admin: {
                description:
                  'The canonical audio file for this song. After every save, a background job rewrites this file\'s ID3v2.3 / Vorbis tags to match the CMS fields below. See "Tag Sync Status" in the sidebar for the latest run.',
              },
            },
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
              name: 'spotifyId',
              type: 'text',
              label: 'Spotify Song ID',
              required: false,
              unique: true,
              admin: {
                description:
                  'The song ID (e.g., 5VaIDMKwaYXgELXy6n0ODU). Required for Spotify Saves.',
              },
            },
            {
              name: 'streamingLinks',
              type: 'array',
              label: 'Streaming & External Links',
              admin: {
                initCollapsed: false,
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
                    description:
                      'Optional text for hover states or extra context.',
                  },
                },
              ],
            },
            {
              name: 'stems',
              type: 'array',
              label: 'Interactive Stems',
              admin: {
                description:
                  'Upload synchronized files for the deep-dive player.',
              },
              fields: [
                { name: 'stemName', type: 'text', required: true }, // e.g. "Drums"
                {
                  name: 'audioFile',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
                {
                  name: 'volume',
                  type: 'number',
                  defaultValue: 0.667,
                  min: 0,
                  max: 1,
                },
              ],
            },
          ],
        },

        // --- TAB 2: METADATA (Genres, BPM, Credits) ---
        {
          label: 'Metadata',
          fields: [
            {
              type: 'group',
              label: 'Recording Details',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'compositionType',
                      type: 'select',
                      options: [
                        'Original',
                        'Cover',
                        'Public Domain',
                        'Remix',
                        'Arrangement',
                        'Derivative Work',
                        'Interpolation',
                        'Mashup',
                        'Sample',
                        'Other',
                      ],
                      defaultValue: 'Original',
                      required: true,
                    },
                    {
                      name: 'recordingType',
                      type: 'select',
                      options: ['Studio', 'Live', 'Demo', 'Other'],
                      defaultValue: 'Studio',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'isExplicit',
                  type: 'checkbox',
                  label: 'Explicit Content / Parental Advisory',
                },
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
                              return value
                                .replace(/[^a-zA-Z0-9]/g, '')
                                .toUpperCase()
                            }
                            return value
                          },
                        ],
                      },
                      validate: (value: unknown) => {
                        if (!value) return true
                        // Simulate the hook's cleaning so client-side validation passes for unformatted input
                        if (typeof value !== 'string') {
                          return 'Invalid ISRC format. Must be 12 characters: CCOOOYYSSSSS.'
                        }
                        const cleanValue = value
                          .replace(/[^a-zA-Z0-9]/g, '')
                          .toUpperCase()
                        // CC (2 chars) + OOO (3 alphanumeric) + YY (2 digits) + SSSSS (5 digits)
                        const regex = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/
                        return (
                          regex.test(cleanValue) ||
                          'Invalid ISRC format. Must be 12 characters: CCOOOYYSSSSS.'
                        )
                      },
                    },
                    {
                      name: 'iswc',
                      type: 'text',
                      label: 'ISWC Code',
                      admin: {
                        description:
                          'International Standard Musical Work Code (composition). No native ID3 frame — written as TXXX:ISWC for MP3 and as ISWC Vorbis comment for FLAC.',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'durationText',
                      type: 'text',
                      label: 'Duration (MM:SS)',
                      admin: {
                        placeholder: '5:18',
                      },
                      hooks: {
                        beforeValidate: [
                          ({ value, siblingData }) => {
                            if (typeof value === 'string') {
                              const [mins, secs] = value.split(':').map(Number)
                              if (!isNaN(mins) && !isNaN(secs)) {
                                siblingData.duration = mins * 60 + secs
                              }
                            } else if (!value) {
                              siblingData.duration = null
                            }
                            return value
                          },
                        ],
                        afterRead: [
                          ({ siblingData }) => {
                            const seconds = siblingData?.duration
                            if (typeof seconds === 'number') {
                              const mm = Math.floor(seconds / 60)
                              const ss = Math.round(seconds % 60)
                                .toString()
                                .padStart(2, '0')
                              return `${mm}:${ss}`
                            }
                            return null
                          },
                        ],
                      },
                    },
                    {
                      name: 'duration',
                      type: 'number',
                      admin: { hidden: true },
                    },
                  ],
                },
                // --- DYNAMIC BPM/KEY LOGIC ---
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'bpm',
                      type: 'number',
                      label: 'BPM',
                      required: false,
                      admin: {
                        description:
                          'Initial tempo as a whole integer. Drives the TBPM frame. For songs that change tempo, this is the starting BPM; the range is added separately as TXXX:Tempo Range.',
                      },
                    },
                    {
                      name: 'bpmEnd',
                      type: 'number',
                      label: 'BPM (End)',
                      admin: {
                        condition: (data, siblingData) =>
                          siblingData.changesTempo,
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'key',
                      type: 'text',
                      label: 'Key',
                      admin: {
                        description:
                          'Initial musical key. Long forms like "A# minor" or "Bb major" are normalized to ≤3 chars (`A#m`, `Bb`) before being written to the TKEY frame. Lowercase `m` indicates minor.',
                      },
                    },
                    {
                      name: 'keyEnd',
                      type: 'text',
                      label: 'Key (End)',
                      admin: {
                        condition: (data, siblingData) =>
                          siblingData.changesKey,
                      },
                    },
                  ],
                },
                {
                  name: 'changesTempo',
                  type: 'checkbox',
                  label: 'Song changes Tempo?',
                  defaultValue: false,
                },
                {
                  name: 'changesKey',
                  type: 'checkbox',
                  label: 'Song changes Key?',
                  defaultValue: false,
                },
                {
                  name: 'discNumber',
                  type: 'number',
                  label: 'Disc Number',
                  defaultValue: 1,
                  min: 1,
                  admin: {
                    description:
                      'For multi-disc releases. Defaults to 1 (almost always correct). Drives the first half of TPOS (e.g. 1/2 for disc 1 of a 2-disc set).',
                  },
                },
              ],
            },
            {
              type: 'group',
              label: 'Rights & Publishing',
              admin: {
                description:
                  'Drives the COPYRIGHT (TCOP), PUBLISHER (TPUB), and TERMS OF USE (USER) frames written to the audio file.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'phonogramCopyrightOwner',
                      type: 'text',
                      label: 'Phonogram (℗) Owner',
                      defaultValue: 'Michael Zeta',
                      admin: {
                        description:
                          'Owner of the master sound recording. Combined with the release year as `℗ {year} {owner}` to form TCOP.',
                      },
                    },
                    {
                      name: 'compositionCopyrightOwner',
                      type: 'text',
                      label: 'Composition (©) Owner',
                      defaultValue: 'Michael Zeta',
                      admin: {
                        description:
                          'Owner of the underlying composition. Combined with year as `© {year} {owner}`. Automatically suppressed for Cover songs (where you do not own the composition).',
                      },
                    },
                  ],
                },
                {
                  name: 'publisher',
                  type: 'text',
                  label: 'Publisher (TPUB)',
                  defaultValue: 'Michael Zeta',
                  admin: {
                    description:
                      'Publishing entity. Until a separate publishing company is registered, leave as "Michael Zeta" — it reinforces ownership.',
                  },
                },
                {
                  name: 'termsOfUse',
                  type: 'select',
                  label: 'Terms of Use (USER)',
                  options: [
                    { label: 'All rights reserved', value: 'all-rights' },
                    {
                      label: 'Free for non-commercial use with attribution',
                      value: 'cc-attrib-nc',
                    },
                    { label: 'Custom (specify below)', value: 'custom' },
                  ],
                  defaultValue: 'all-rights',
                  admin: {
                    description:
                      'Embedded in the file as the USER frame. Most players ignore it, but tag editors will display it.',
                  },
                },
                {
                  name: 'termsOfUseCustom',
                  type: 'textarea',
                  label: 'Custom Terms of Use',
                  admin: {
                    condition: (_data, siblingData) =>
                      siblingData?.termsOfUse === 'custom',
                    rows: 3,
                    description:
                      'Free-form usage terms written verbatim to the USER frame.',
                  },
                },
              ],
            },
            {
              name: 'popularity',
              type: 'number',
              label: 'Popularity Score (0-1000)',
              defaultValue: 0,
              min: 0,
              max: 1000,
              admin: {
                description:
                  'Used for sorting "Popular" lists. 1000 = Biggest Hit.',
              },
            },
            {
              type: 'group',
              label: 'Tags',
              admin: {
                description:
                  'Define the DNA of the song for search and filtering.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'genres',
                      type: 'relationship',
                      label: 'Genres',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'genre' } },
                    },
                    {
                      name: 'styles',
                      type: 'relationship',
                      label: 'Styles',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'style' } },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'moods',
                      type: 'relationship',
                      label: 'Moods',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'mood' } },
                    },
                    {
                      name: 'themes',
                      type: 'relationship',
                      label: 'Themes',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'theme' } },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'instruments',
                      type: 'relationship',
                      label: 'Instruments',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'instrument' } },
                    },
                    {
                      name: 'production',
                      type: 'relationship',
                      label: 'Production',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'production' } },
                    },
                  ],
                },
                // Extras
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'arrangements',
                      type: 'relationship',
                      label: 'Arrangement',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'arrangement' } },
                    },
                    {
                      name: 'otherTags',
                      type: 'relationship',
                      label: 'Other',
                      relationTo: 'tags',
                      hasMany: true,
                      filterOptions: { category: { equals: 'other' } },
                    },
                  ],
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
                  type: 'row',
                  fields: [
                    {
                      name: 'name',
                      type: 'text',
                      required: true,
                      admin: {
                        description:
                          'Display name (stage name, band name, or known professional name).',
                      },
                    },
                    {
                      name: 'legalName',
                      type: 'text',
                      label: 'Legal Name',
                      admin: {
                        description:
                          'Optional. Required for accurate publishing credits — Songwriter credits write the legal name (or fall back to display name) into the COMPOSER (TCOM) frame.',
                      },
                    },
                  ],
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
                    description:
                      'Add multiple roles (e.g. "Guitar", "Backing Vocals")',
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
                    HeadingFeature({
                      enabledHeadingSizes: ['h2', 'h3', 'h4', 'h5', 'h6'],
                    }),
                    FixedToolbarFeature(),
                    BlocksFeature({
                      blocks: [
                        Banner,
                        Code,
                        MediaBlock,
                        Archive,
                        CallToAction,
                        Content,
                        FormBlock,
                      ],
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
                  'The full story, sonic details, and lyrics. Supports embeds and images. Typically best to start at H3 since "Liner Notes" section heading is already H2.',
              },
            },
            {
              name: 'lyrics',
              type: 'textarea',
              label: 'Lyrics',
              admin: {
                description:
                  'Plain text version for search indexing and quick view. Written to the USLT (Unsynchronized Lyrics) frame in the audio file.',
              },
            },
            {
              name: 'comment',
              type: 'textarea',
              label: 'Embedded Comment (COMM)',
              defaultValue: 'Thank you for being a fan',
              admin: {
                rows: 2,
                description:
                  'Short message embedded into the file\'s COMM frame. Defaults to a "thank you" note. Visible to anyone who inspects the file in a tag editor or some media players.',
              },
            },
          ],
        },

        // --- TAB 4: Bonus Content ---
        {
          label: 'Gated Content',
          fields: [
            {
              name: 'linkedGatedContent',
              type: 'join',
              collection: 'gated-content',
              on: 'relatedSong',
              label: 'Linked from Gated Content',
              admin: {
                description:
                  'Files that point to this song from the Gated Content collection.',
                defaultColumns: [
                  'title',
                  'mimeType',
                  'description',
                  'tierRequired',
                ],
              },
            },
          ],
        },
      ],
    },
  ],
}
