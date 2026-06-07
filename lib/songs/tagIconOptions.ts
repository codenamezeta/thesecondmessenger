import type { TagCategory } from './tagFields'

/**
 * Curated Lucide icon set offered to editors on the `tags` collection
 * (`collections/Tags.ts`) and consumed on the front-end by the icon
 * resolver in `tagIcons.ts`.
 *
 * This module is intentionally React-free (plain `{ label, value }` data
 * only) so the Payload server config can import it without dragging the
 * Lucide component bundle into the server / CLI. The matching
 * value → component map lives in `tagIcons.ts`.
 *
 * To add an icon: add an entry here AND a matching entry in
 * `TAG_ICON_REGISTRY` (`tagIcons.ts`). The two are kept in sync by a
 * compile-time check in that file.
 */
export const TAG_ICON_OPTIONS = [
  // --- Musical voices / instruments ---
  { label: 'Music Note', value: 'music' },
  { label: 'Guitar', value: 'guitar' },
  { label: 'Piano / Keys', value: 'piano' },
  { label: 'Drums', value: 'drum' },
  { label: 'Bass / Low End', value: 'bass' },
  { label: 'Microphone / Vocals', value: 'mic' },
  { label: 'Synth Waves', value: 'synth' },
  { label: 'Headphones', value: 'headphones' },
  { label: 'Keyboard / Sequencer', value: 'keyboard' },
  { label: 'Speaker', value: 'speaker' },

  // --- Production / texture ---
  { label: 'Waveform', value: 'waveform' },
  { label: 'Mixer / Sliders', value: 'sliders' },
  { label: 'Volume', value: 'volume' },
  { label: 'Radio', value: 'radio' },
  { label: 'Vinyl / Disc', value: 'disc' },
  { label: 'Chip / CPU', value: 'cpu' },

  // --- Activities ---
  { label: 'Activity / Pulse', value: 'activity' },
  { label: 'Workout / Dumbbell', value: 'dumbbell' },
  { label: 'Running / Footsteps', value: 'running' },
  { label: 'Driving / Car', value: 'car' },
  { label: 'Gaming', value: 'gamepad' },
  { label: 'Study / Book', value: 'book' },
  { label: 'Coding', value: 'code' },
  { label: 'Coffee / Chill', value: 'coffee' },
  { label: 'Travel / Plane', value: 'plane' },
  { label: 'Party', value: 'party' },

  // --- Moods ---
  { label: 'Energetic / Bolt', value: 'zap' },
  { label: 'Love / Heart', value: 'heart' },
  { label: 'Heartbreak', value: 'heart-crack' },
  { label: 'Melancholy / Rain', value: 'rain' },
  { label: 'Intense / Flame', value: 'flame' },
  { label: 'Dark / Skull', value: 'skull' },
  { label: 'Dreamy / Sparkles', value: 'sparkles' },
  { label: 'Night / Moon', value: 'moon' },
  { label: 'Bright / Sun', value: 'sun' },
  { label: 'Dawn / Sunrise', value: 'sunrise' },

  // --- Themes / narrative ---
  { label: 'World / Globe', value: 'globe' },
  { label: 'Conflict / Swords', value: 'swords' },
  { label: 'Friendship / People', value: 'users' },
  { label: 'Self / Person', value: 'user' },
  { label: 'Place / Map Pin', value: 'map-pin' },
  { label: 'Gift / Holiday', value: 'gift' },
  { label: 'Winter / Snow', value: 'snowflake' },
  { label: 'Nature / Trees', value: 'trees' },
  { label: 'Mountain / Journey', value: 'mountain' },
  { label: 'Ghost / Haunting', value: 'ghost' },

  // --- Influence / lineage ---
  { label: 'Star / Influence', value: 'star' },
  { label: 'Era / History', value: 'history' },
  { label: 'Crown / Legend', value: 'crown' },

  // --- Arrangement / structure ---
  { label: 'Layers / Structure', value: 'layers' },
  { label: 'Branch / Sections', value: 'branch' },
  { label: 'Loop / Repeat', value: 'repeat' },
  { label: 'Clock / Time Signature', value: 'clock' },

  // --- Sci-fi flavor / generic ---
  { label: 'Rocket', value: 'rocket' },
  { label: 'Telescope', value: 'telescope' },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Orbit', value: 'orbit' },
  { label: 'Tag', value: 'tag' },
] as const satisfies ReadonlyArray<{ label: string; value: string }>

export type TagIconKey = (typeof TAG_ICON_OPTIONS)[number]['value']

/**
 * Sensible default icon per ontology category. Used when a tag has no
 * explicit `icon` set so cards/pages never render a missing glyph.
 */
export const CATEGORY_DEFAULT_ICON: Record<TagCategory, TagIconKey> = {
  genre: 'disc',
  subgenre: 'music',
  activity: 'activity',
  theme: 'globe',
  mood: 'zap',
  production: 'sliders',
  instrument: 'mic',
  gear: 'cpu',
  arrangement: 'layers',
  influence: 'star',
  other: 'tag',
}
