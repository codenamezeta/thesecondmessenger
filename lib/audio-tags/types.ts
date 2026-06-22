/**
 * Canonical "tag spec" — the format-agnostic intermediate representation
 * between Payload Song fields and on-disk tags.
 *
 * The mapping rules are defined in `.cursor/rules/song-tag-mapping.mdc`.
 * `mapSongToTagSpec` produces this; `writeTagsToBuffer` consumes it.
 *
 * Anything optional may be omitted; the writer skips empty frames rather
 * than writing empty values.
 */

export type TrackPosition = { n: number; total: number }

export type CoverArt = {
  /** JPEG/PNG bytes ready to embed. Caller is responsible for resizing. */
  data: Uint8Array
  /** MIME type, e.g. `image/jpeg`. */
  mimeType: string
}

export type TagSpec = {
  /* --- Tier 1: compatibility-critical --- */
  title: string
  /** TPE1 — already composed with `feat. X` if applicable. */
  artist: string
  /** TPE2 — always the primary artist constant. */
  albumArtist: string
  /** TALB — derived from primaryRelease.title. */
  album?: string
  /** TRCK — `n/total`. */
  trackNumber?: TrackPosition
  /** TPOS — `n/total`. Defaults to 1/1. */
  discNumber?: TrackPosition
  /** TYER — 4-digit year. */
  year?: number
  /** TCON — primary genre only. */
  genre?: string
  /** APIC type 3 / METADATA_BLOCK_PICTURE. */
  coverArt?: CoverArt

  /* --- Tier 2: industry & publishing --- */
  /** TCOM — list of legal names. */
  composer?: string[]
  /** TSRC. */
  isrc?: string
  /** TXXX:ISWC for MP3, ISWC Vorbis comment for FLAC. */
  iswc?: string
  /** TCOP — pre-formatted `℗ © {year} {owner}` (or `℗ {year} {owner}` for covers). */
  copyright?: string
  /** TPUB. */
  publisher?: string
  /** USER — verbatim license text. */
  termsOfUse?: string
  /**
   * TXXX:{descriptor} — custom text frames keyed by descriptor.
   * Descriptors use Title Case With Spaces (Mp3tag/Picard convention).
   */
  customText?: Record<string, string[]>

  /* --- Tier 3: musical attributes --- */
  /** TBPM — initial BPM. */
  bpm?: number
  /** TKEY — normalized to ≤3 chars (e.g. `A#m`). */
  initialKey?: string
  /** USLT — plain text lyrics. */
  lyrics?: string

  /* --- Tier 4: searchability & routing --- */
  /** TIT1 + GRP1 — semicolon-separated. */
  grouping?: string
  /** COMM. */
  comment?: string
  /** WOAR. */
  artistUrl?: string
  /** WOAF. */
  audioFileUrl?: string
  /** WPAY. */
  paymentUrl?: string
  /** TLEN — milliseconds. */
  lengthMs?: number

  /**
   * MusicBrainz identifiers. Written via taglib's standardized PropertyMap
   * keys (MUSICBRAINZ_*), which map to TXXX:* frames for MP3 and the
   * matching Vorbis comments for FLAC. The recording id additionally rides
   * along as a UFID frame (owner `http://musicbrainz.org`).
   */
  musicBrainz?: {
    recordingId?: string
    trackId?: string
    releaseId?: string
    releaseGroupId?: string
    artistId?: string
    workId?: string
  }
}
