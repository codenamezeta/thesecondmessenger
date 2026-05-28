import { Disc } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  enrichStreamingLinks,
  sortEnrichedStreamingLinks,
  type StreamingLinkInput,
} from '@/lib/platforms'
import { PlatformLinkTile } from '@/components/music/PlatformLinkTile'

type StreamingLinksCardProps = {
  streamingLinks: StreamingLinkInput[]
}

export function StreamingLinksCard({
  streamingLinks,
}: StreamingLinksCardProps) {
  if (!streamingLinks.length) return null

  const enriched = sortEnrichedStreamingLinks(
    enrichStreamingLinks(streamingLinks),
  )

  return (
    <Card className="border-border/70 bg-transparent backdrop-blur-sm">
      <CardHeader className="gap-2">
        <CardTitle className="flex items-center gap-2 font-body text-xl font-bold tracking-widest uppercase">
          <Disc size={24} className="text-primary" />
          Stream Now
        </CardTitle>
        <CardDescription className="font-mono text-sm tracking-wider text-muted-foreground">
          Official links — direct support platforms listed first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {enriched.map((link, index) => (
            <PlatformLinkTile
              key={link.id ?? `${link.platform}-${index}`}
              href={link.url}
              config={link.config}
              displayName={link.displayName}
              description={link.description}
              compact={true}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
