'use client'

import { useState, useSyncExternalStore } from 'react'
import {
  Copy,
  Check,
  Share2,
  Facebook,
  MessageCircle,
  Send,
  Cloud,
  Smartphone, // Icon for "App" sharing
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/utilities/ui'

interface ShareProps {
  url?: string
  title?: string
  className?: string
}

const noopSubscribe = () => () => {}

function getClientHref(): string {
  return typeof window !== 'undefined' ? window.location.href : ''
}

function getClientCanWebShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

export const Share = ({ url: propUrl, title, className }: ShareProps) => {
  const [copied, setCopied] = useState(false)

  const clientHref = useSyncExternalStore(noopSubscribe, getClientHref, () => '')
  const currentUrl = propUrl ?? clientHref

  const canWebShare = useSyncExternalStore(
    noopSubscribe,
    getClientCanWebShare,
    () => false,
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy signal', err)
    }
  }

  // The "Master Key" Function
  const handleSystemShare = async () => {
    try {
      await navigator.share({
        title: title || 'The Second Messenger',
        text: `Receiving transmission: ${title || 'The Second Messenger'}`,
        url: currentUrl,
      })
    } catch (err) {
      console.log(err, 'User cancelled share or failed')
    }
  }

  // --- INTENT GENERATORS ---
  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedTitle = encodeURIComponent(title || 'The Second Messenger')
  const encodedText = encodeURIComponent(
    `Receiving transmission: ${title || 'The Second Messenger'}`,
  )

  // Standard Web Links
  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook size={20} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-500 hover:border-blue-500/50',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={20} />,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:text-green-500 hover:border-green-500/50',
    },
    {
      name: 'Bluesky',
      icon: <Cloud size={20} />,
      href: `https://bsky.app/intent/compose?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:text-sky-500 hover:border-sky-500/50',
    },
    {
      name: 'Direct',
      icon: <Send size={20} />,
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Hey! I think you'll love this song by The Second Messenger!\n\n`)}${encodedUrl}`,
      color: 'hover:text-primary hover:border-primary/50',
    },
  ]

  return (
    <Card
      className={cn(
        'group relative border border-primary/50 bg-primary/5',
        className,
      )}
    >
      {/* Decorative "Scanner" Line */}
      <div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      {/* Header */}
      <CardHeader className="flex items-center gap-3">
        <div className="animate-pulse rounded-full border border-primary bg-primary/20 p-3 text-primary">
          <Share2 size={20} />
        </div>
        <div>
          <CardTitle className="font-heading text-lg tracking-wider uppercase">
            Share
          </CardTitle>
          <CardDescription className="font-mono text-sm tracking-wide text-muted-foreground uppercase">
            Amplify this signal
          </CardDescription>
        </div>
      </CardHeader>

      {/* Copy Input Zone */}
      <CardContent className="relative flex items-center">
        <div className="w-full truncate rounded-l-xl border border-r-0 border-primary/50 bg-background px-4 py-3 font-mono text-xs text-muted-foreground">
          {currentUrl}
        </div>
        <button
          onClick={handleCopy}
          className="group/btn flex min-w-[100px] items-center justify-center gap-2 rounded-r-xl border border-primary/30 bg-primary/10 px-4 py-3 text-primary transition-all hover:bg-primary/20"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="text-xs font-bold tracking-wider uppercase">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </CardContent>

      {/* Social actions: outer div is the query container only. Responsive @[…]: classes must
          live on *descendants* — an element cannot match @container against itself, so putting
          @container + @[30rem]:flex-row on the same node made the wide layout never apply. */}
      <CardContent
        className={
          canWebShare ? undefined : 'grid w-full min-w-0 grid-cols-4 gap-2'
        }
      >
        {canWebShare ? (
          <div
            className="@container w-full min-w-0"
            style={{ containerType: 'inline-size' } as React.CSSProperties}
          >
            <div className="flex w-full min-w-0 flex-col gap-2 @[24rem]:flex-row @[24rem]:flex-nowrap">
              <button
                onClick={handleSystemShare}
                className="flex min-h-[72px] w-full min-w-0 shrink-0 flex-col items-center justify-center gap-2 rounded border border-primary/50 bg-primary/20 p-3 transition-all duration-300 hover:bg-primary/30 @[24rem]:w-auto @[24rem]:flex-1 @[24rem]:shrink @[24rem]:basis-0"
                title="Open Share Menu"
              >
                <Smartphone size={24} className="text-primary" />
                <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
                  System
                </span>
              </button>
              <div className="grid min-w-0 grid-cols-4 gap-2 @[24rem]:contents">
                {shareLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-2 rounded border border-muted bg-background/50 p-3 transition-all duration-300 @[24rem]:flex-1 @[24rem]:basis-0',
                      link.color,
                      'hover:bg-muted/50',
                    )}
                    title={`Share on ${link.name}`}
                  >
                    {link.icon}
                    <span className="font-mono text-[10px] tracking-wider uppercase">
                      {link.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : (
          shareLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-2 rounded border border-muted bg-background/50 p-3 transition-all duration-300',
                link.color,
                'hover:bg-muted/50',
              )}
              title={`Share on ${link.name}`}
            >
              {link.icon}
              <span className="font-mono text-[10px] tracking-wider uppercase">
                {link.name}
              </span>
            </a>
          ))
        )}
      </CardContent>
    </Card>
  )
}
