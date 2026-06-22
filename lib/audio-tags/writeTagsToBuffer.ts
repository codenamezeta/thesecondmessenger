import type { Picture, PropertyMap, TagLib } from 'taglib-wasm'
import type { TagSpec } from './types'

/**
 * Lazy singleton — initializing the WASM module is the expensive part
 * (a few hundred ms cold). Reusing the instance across requests within a
 * warm Vercel function makes subsequent syncs fast.
 *
 * We use a dynamic `import()` so Turbopack/webpack never try to bundle
 * `taglib-wasm` or its sibling `.wasm` binary. Combined with
 * `serverExternalPackages: ['taglib-wasm']` in next.config.mjs this keeps
 * the module as a plain Node require at runtime (server only).
 */
let _taglibPromise: Promise<TagLib> | null = null
async function getTagLib(): Promise<TagLib> {
  if (!_taglibPromise) {
    const mod = await import('taglib-wasm')
    _taglibPromise = mod.TagLib.initialize()
  }
  return _taglibPromise
}

/**
 * Write a TagSpec into an audio buffer using taglib-wasm. Returns a fresh
 * buffer; the caller uploads it back to storage.
 *
 * Strategy:
 *   1. Set the basic Tag fields via `file.tag()` (title/artist/album/etc.).
 *   2. Read existing PropertyMap, preserve TENC/TSSE-equivalents
 *      (`ENCODEDBY` / `ENCODERSETTINGS`).
 *   3. Apply our advanced PropertyMap on top — covers ALBUMARTIST,
 *      COMPOSER, ISRC, COPYRIGHT, PUBLISHER, BPM, INITIALKEY, LYRICS,
 *      GROUPING, LENGTH, plus all `TXXX:*` custom descriptors.
 *   4. Replace the front-cover picture if `coverArt` was supplied.
 *   5. Save and return the resulting bytes.
 *
 * Notes on URL frames (WOAR/WOAF/WPAY):
 *   taglib-wasm's PropertyMap doesn't expose dedicated keys for the
 *   ID3v2 URL frames, so we use TXXX:* descriptors instead. Major tag
 *   editors (Mp3tag, Picard) display these the same way, and most
 *   players ignore native URL frames anyway.
 */
export async function writeTagsToBuffer(
  buffer: Uint8Array,
  spec: TagSpec,
): Promise<Uint8Array> {
  const taglib = await getTagLib()
  const file = await taglib.open(buffer)
  try {
    if (!file.isValid()) {
      throw new Error('taglib-wasm: opened file is not a valid audio buffer.')
    }

    // --- 1. Basic tag (setters are chainable; properties are read-only). ---
    const tag = file.tag()
    if (spec.title) tag.setTitle(spec.title)
    if (spec.artist) tag.setArtist(spec.artist)
    if (spec.album) tag.setAlbum(spec.album)
    if (spec.genre) tag.setGenre(spec.genre)
    if (spec.year) tag.setYear(spec.year)
    if (spec.trackNumber) tag.setTrack(spec.trackNumber.n)
    if (spec.comment) tag.setComment(spec.comment)

    // --- 2. Preserve encoder identity ---
    const existing: PropertyMap = file.properties()
    const preservedEncodedBy =
      existing['ENCODEDBY'] ?? existing['TENC'] ?? undefined
    const preservedEncoderSettings =
      existing['ENCODERSETTINGS'] ?? existing['TSSE'] ?? undefined

    // --- 3. Apply advanced PropertyMap on top of existing tags ---
    const props: Record<string, string[]> = {}

    if (spec.albumArtist) props['ALBUMARTIST'] = [spec.albumArtist]
    if (spec.composer && spec.composer.length > 0) {
      props['COMPOSER'] = spec.composer
    }
    if (spec.isrc) props['ISRC'] = [spec.isrc]
    if (spec.copyright) props['COPYRIGHT'] = [spec.copyright]
    if (spec.publisher) props['PUBLISHER'] = [spec.publisher]
    if (typeof spec.bpm === 'number') props['BPM'] = [String(spec.bpm)]
    if (spec.initialKey) props['INITIALKEY'] = [spec.initialKey]
    if (spec.lyrics) props['LYRICS'] = [spec.lyrics]
    if (spec.grouping) props['GROUPING'] = [spec.grouping]
    if (typeof spec.lengthMs === 'number') {
      props['LENGTH'] = [String(spec.lengthMs)]
    }

    if (spec.discNumber) {
      props['DISCNUMBER'] = [String(spec.discNumber.n)]
      props['DISCTOTAL'] = [String(spec.discNumber.total)]
    }
    if (spec.trackNumber) {
      props['TRACKNUMBER'] = [String(spec.trackNumber.n)]
      props['TRACKTOTAL'] = [String(spec.trackNumber.total)]
    }

    // ISWC has no native ID3 frame; ride along as TXXX:ISWC. taglib-wasm
    // does map the ISWC PropertyMap key to the appropriate Vorbis
    // comment for FLAC, so we set both.
    if (spec.iswc) {
      props['ISWC'] = [spec.iswc]
      props['TXXX:ISWC'] = [spec.iswc]
    }

    // Terms of use → USER frame for ID3, LICENSE for Vorbis. taglib uses
    // USER as a non-standard PropertyMap key; fall back to TXXX too.
    if (spec.termsOfUse) {
      props['LICENSE'] = [spec.termsOfUse]
      props['TXXX:Terms Of Use'] = [spec.termsOfUse]
    }

    // URL frames as TXXX:* per Picard convention.
    if (spec.artistUrl) {
      props['TXXX:Official Artist Site'] = [spec.artistUrl]
    }
    if (spec.audioFileUrl) {
      props['TXXX:Official Release Page'] = [spec.audioFileUrl]
      props['TXXX:WWWAUDIOFILE'] = [spec.audioFileUrl]
    }
    if (spec.paymentUrl) {
      props['TXXX:Payment Page'] = [spec.paymentUrl]
    }

    // MusicBrainz identifiers. taglib maps these standardized PropertyMap
    // keys to TXXX:* frames for MP3 and the matching Vorbis comments for
    // FLAC, so Picard and aggregators recognize the recording.
    if (spec.musicBrainz) {
      const mb = spec.musicBrainz
      if (mb.recordingId) props['MUSICBRAINZ_TRACKID'] = [mb.recordingId]
      if (mb.trackId) props['MUSICBRAINZ_RELEASETRACKID'] = [mb.trackId]
      if (mb.releaseId) props['MUSICBRAINZ_ALBUMID'] = [mb.releaseId]
      if (mb.releaseGroupId) {
        props['MUSICBRAINZ_RELEASEGROUPID'] = [mb.releaseGroupId]
      }
      if (mb.artistId) {
        props['MUSICBRAINZ_ARTISTID'] = [mb.artistId]
        props['MUSICBRAINZ_ALBUMARTISTID'] = [mb.artistId]
      }
      if (mb.workId) props['MUSICBRAINZ_WORKID'] = [mb.workId]
    }

    // Custom TXXX descriptors from the mapper (credits + ranges + schema).
    if (spec.customText) {
      for (const [descriptor, values] of Object.entries(spec.customText)) {
        if (!values || values.length === 0) continue
        props[`TXXX:${descriptor}`] = values
      }
    }

    // Restore preserved encoder identity if it existed.
    if (preservedEncodedBy && preservedEncodedBy.length > 0) {
      props['ENCODEDBY'] = preservedEncodedBy
    }
    if (preservedEncoderSettings && preservedEncoderSettings.length > 0) {
      props['ENCODERSETTINGS'] = preservedEncoderSettings
    }

    // setProperties replaces all properties at once. Merge with whatever
    // was there before so we don't accidentally drop unknown frames.
    const merged: PropertyMap = { ...existing, ...props }
    file.setProperties(merged)

    // --- 4. Cover art (replaces all existing pictures). ---
    if (spec.coverArt) {
      const picture: Picture = {
        data: spec.coverArt.data,
        mimeType: spec.coverArt.mimeType,
        type: 'FrontCover',
      }
      file.setPictures([picture])
    }

    // --- 5. Save and emit. ---
    if (!file.save()) {
      throw new Error('taglib-wasm: file.save() returned false.')
    }
    return file.getFileBuffer()
  } finally {
    file.dispose()
  }
}
