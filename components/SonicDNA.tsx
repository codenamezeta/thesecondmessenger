import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import {
  Activity,
  Cpu,
  Fingerprint,
  Globe,
  Mic2,
  Star,
  Zap,
} from 'lucide-react'
import type { Song, Tag } from '@/payload-types'
import { FIELD_TO_CATEGORY, type SongTagField } from '@/lib/songs/tagFields'
import { resolveTagIcon } from '@/lib/songs/tagIcons'
import { musicHrefForTag } from '@/lib/music/filterState'

const isTag = (tag: unknown): tag is Tag =>
  typeof tag === 'object' && tag !== null && 'name' in tag

type DnaSection = {
  label: string
  icon: React.ReactNode
  /**
   * Each entry pairs a song-field with its raw relationship array, so
   * the chip can render the correct `/music?<category>=<slug>` link
   * even when a single section aggregates multiple ontology layers.
   */
  entries: Array<{
    field: SongTagField
    data: Song[SongTagField] | null | undefined
  }>
}

export const SonicDNA = ({ song }: { song: Song }) => {
  const sections: DnaSection[] = [
    {
      label: 'Classification',
      icon: <Mic2 size={14} />,
      entries: [
        { field: 'genres', data: song.genres },
        { field: 'subGenres', data: song.subGenres },
      ],
    },
    {
      label: 'Vibe',
      icon: <Zap size={14} />,
      entries: [{ field: 'moods', data: song.moods }],
    },
    {
      label: 'Narrative',
      icon: <Globe size={14} />,
      entries: [{ field: 'themes', data: song.themes }],
    },
    {
      label: 'Use Case',
      icon: <Activity size={14} />,
      entries: [{ field: 'activities', data: song.activities }],
    },
    {
      label: 'Tech Specs',
      icon: <Cpu size={14} />,
      entries: [
        { field: 'instruments', data: song.instruments },
        { field: 'gear', data: song.gear },
        { field: 'production', data: song.production },
      ],
    },
    {
      label: 'For Fans Of',
      icon: <Star size={14} />,
      entries: [{ field: 'influences', data: song.influences }],
    },
  ]

  // Flatten and resolve in one pass so we can both render and detect emptiness.
  type ResolvedChip = {
    field: SongTagField
    tag: Tag
  }
  const resolvedSections = sections.map((section) => {
    const chips: ResolvedChip[] = []
    for (const entry of section.entries) {
      for (const tag of entry.data ?? []) {
        if (isTag(tag)) chips.push({ field: entry.field, tag })
      }
    }
    return { ...section, chips }
  })

  if (resolvedSections.every((s) => s.chips.length === 0)) return null

  return (
    <div className="mt-8 rounded-lg border border-border/50 bg-card/30 p-6">
      <h4 className="mb-6 flex items-center gap-2 font-heading tracking-widest text-primary uppercase">
        <Fingerprint size={18} /> Sonic DNA
      </h4>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {resolvedSections.map((section) => {
          if (section.chips.length === 0) return null
          return (
            <div key={section.label} className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {section.icon}
                <span>{section.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {section.chips.map(({ field, tag }) => {
                  const href = tag.slug
                    ? musicHrefForTag(FIELD_TO_CATEGORY[field], tag.slug)
                    : null
                  const TagGlyph = resolveTagIcon(tag.category)
                  const badge = (
                    <Badge
                      variant="outline"
                      className="flex cursor-pointer items-center gap-1 bg-background/50 font-mono text-[10px] tracking-wide transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-primary"
                    >
                      <TagGlyph className="size-3 opacity-80" aria-hidden />
                      {tag.name.toUpperCase()}
                    </Badge>
                  )
                  return href ? (
                    <Link
                      key={tag.id}
                      href={href}
                      aria-label={`Browse ${section.label}: ${tag.name} in /music`}
                    >
                      {badge}
                    </Link>
                  ) : (
                    <span
                      key={tag.id}
                      aria-label={`${section.label}: ${tag.name}`}
                    >
                      {badge}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
