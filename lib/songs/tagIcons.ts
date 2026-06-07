import {
  Activity,
  AudioWaveform,
  BookOpen,
  Car,
  Clock,
  Code,
  Coffee,
  Cpu,
  Crown,
  Disc3,
  Drum,
  Dumbbell,
  Flame,
  Footprints,
  GitBranch,
  Gamepad2,
  Ghost,
  Gift,
  Globe,
  Guitar,
  Headphones,
  Heart,
  HeartCrack,
  History,
  Keyboard,
  Layers,
  MapPin,
  Mic2,
  Moon,
  Mountain,
  Music2,
  Orbit,
  PartyPopper,
  Piano,
  Plane,
  Radio,
  Repeat,
  Rocket,
  Satellite,
  SlidersHorizontal,
  Skull,
  Snowflake,
  Sparkles,
  Speaker,
  Star,
  Sun,
  Sunrise,
  Swords,
  Tag as TagIcon,
  Telescope,
  Trees,
  User,
  Users,
  Volume2,
  Waves,
  type LucideIcon,
} from 'lucide-react'
import type { Tag } from '@/payload-types'
import type { TagCategory } from './tagFields'
import {
  CATEGORY_DEFAULT_ICON,
  type TagIconKey,
} from './tagIconOptions'

/**
 * Value → Lucide component map for the curated set declared in
 * `tagIconOptions.ts`. The `Record<TagIconKey, ...>` type guarantees at
 * compile time that every option has a component and vice-versa, so the
 * two modules can never silently drift.
 */
export const TAG_ICON_REGISTRY: Record<TagIconKey, LucideIcon> = {
  music: Music2,
  guitar: Guitar,
  piano: Piano,
  drum: Drum,
  bass: AudioWaveform,
  mic: Mic2,
  synth: Waves,
  headphones: Headphones,
  keyboard: Keyboard,
  speaker: Speaker,
  waveform: AudioWaveform,
  sliders: SlidersHorizontal,
  volume: Volume2,
  radio: Radio,
  disc: Disc3,
  cpu: Cpu,
  activity: Activity,
  dumbbell: Dumbbell,
  running: Footprints,
  car: Car,
  gamepad: Gamepad2,
  book: BookOpen,
  code: Code,
  coffee: Coffee,
  plane: Plane,
  party: PartyPopper,
  zap: Activity,
  heart: Heart,
  'heart-crack': HeartCrack,
  rain: Waves,
  flame: Flame,
  skull: Skull,
  sparkles: Sparkles,
  moon: Moon,
  sun: Sun,
  sunrise: Sunrise,
  globe: Globe,
  swords: Swords,
  users: Users,
  user: User,
  'map-pin': MapPin,
  gift: Gift,
  snowflake: Snowflake,
  trees: Trees,
  mountain: Mountain,
  ghost: Ghost,
  star: Star,
  history: History,
  crown: Crown,
  layers: Layers,
  branch: GitBranch,
  repeat: Repeat,
  clock: Clock,
  rocket: Rocket,
  telescope: Telescope,
  satellite: Satellite,
  orbit: Orbit,
  tag: TagIcon,
}

/**
 * Per-category icon tint (Tailwind text-color utility). Keeps the chip
 * glyphs color-coded by ontology layer even when the specific icon is
 * editor-overridden.
 */
export const CATEGORY_COLOR: Record<TagCategory, string> = {
  genre: 'text-muted-foreground',
  subgenre: 'text-primary',
  activity: 'text-chart-2',
  theme: 'text-chart-5',
  mood: 'text-accent',
  production: 'text-chart-3',
  instrument: 'text-chart-4',
  gear: 'text-chart-1',
  arrangement: 'text-primary',
  influence: 'text-special',
  other: 'text-muted-foreground',
}

/** A tag-shaped object carrying just what the resolver needs. */
type IconableTag = Pick<Tag, 'category'> & { icon?: Tag['icon'] }

function isIconKey(value: unknown): value is TagIconKey {
  return typeof value === 'string' && value in TAG_ICON_REGISTRY
}

/**
 * Resolve the best icon for a tag: its explicit `icon` when set and
 * valid, otherwise the category default. Never returns undefined.
 */
export function resolveTagIcon(tag: IconableTag): LucideIcon {
  if (isIconKey(tag.icon)) return TAG_ICON_REGISTRY[tag.icon]
  return TAG_ICON_REGISTRY[CATEGORY_DEFAULT_ICON[tag.category]]
}

/** Resolve the Tailwind tint utility for a tag's category. */
export function resolveTagColor(category: TagCategory): string {
  return CATEGORY_COLOR[category]
}
