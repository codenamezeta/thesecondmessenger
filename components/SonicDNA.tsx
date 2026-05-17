import Link from 'next/link'
import { Badge } from '@/components/ui/badge' // Assuming you have Shadcn Badge
import { Fingerprint, Zap, Globe, Cpu, Mic2 } from 'lucide-react'
import type { Song, Tag } from '@/payload-types'

// Helper to check if tag is populated
const isTag = (tag: unknown): tag is Tag =>
  typeof tag === 'object' && tag !== null && 'name' in tag

export const SonicDNA = ({ song }: { song: Song }) => {
  const groups = [
    { label: 'Vibe', icon: <Zap size={14} />, data: song.moods },
    { label: 'Narrative', icon: <Globe size={14} />, data: song.themes },
    {
      label: 'Tech Specs',
      icon: <Cpu size={14} />,
      data: [...(song.instruments || []), ...(song.production || [])],
    },
    {
      label: 'Classification',
      icon: <Mic2 size={14} />,
      data: [...(song.genres || []), ...(song.styles || [])],
    },
  ]

  // If no data exists, don't render the component
  if (!groups.some((g) => g.data && g.data.length > 0)) return null

  return (
    <div className="mt-8 rounded-lg border border-border/50 bg-card/30 p-6">
      <h4 className="mb-6 flex items-center gap-2 font-heading tracking-widest text-primary uppercase">
        <Fingerprint size={18} /> Sonic DNA
      </h4>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {groups.map((group) => {
          if (!group.data || group.data.length === 0) return null

          return (
            <div key={group.label} className="space-y-2">
              <div className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
                {group.icon}
                <span>{group.label}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {group.data.map((tag, i) => {
                  if (!isTag(tag)) return null
                  return (
                    <Link key={i} href={`/search?q=${tag.name}`}>
                      <Badge
                        variant="outline"
                        className="cursor-pointer bg-background/50 font-mono text-[10px] tracking-wide transition-all hover:border-primary/50 hover:bg-primary/20 hover:text-primary"
                      >
                        #{tag.name.toUpperCase()}
                      </Badge>
                    </Link>
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
