/**
 * Project-wide constants used by audio tagging, structured data, and any
 * surface that needs to refer to the canonical artist identity.
 *
 * If this file changes, bump TAGGING_SCHEMA_VERSION so the next sync run
 * re-applies tags to all existing files.
 *
 * See `.cursor/rules/song-tag-mapping.mdc` for how each constant is used.
 */

export const PRIMARY_ARTIST = 'The Second Messenger'

export const ARTIST_HOMEPAGE = 'https://thesecondmessenger.com'

export const TAGGING_SCHEMA_VERSION = '1'
