'use client'

import { useMemo, useState, useSyncExternalStore } from 'react'
import {
  Copy,
  Check,
  Share2,
  MessageCircle,
  Send,
  Cloud,
  Smartphone,
  ChevronDown,
  Facebook,
  MessageSquare,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/utilities/ui'
import {
  buildShareLinks,
  type ShareLink,
  type ShareLinkIconMap,
} from '@/lib/share/shareLinks'

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

function XBrandIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function RedditIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
    </svg>
  )
}

function TelegramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

const SHARE_ICONS: ShareLinkIconMap = {
  x: <XBrandIcon size={20} />,
  reddit: <RedditIcon size={20} />,
  whatsapp: <MessageCircle size={20} />,
  telegram: <TelegramIcon size={20} />,
  sms: <MessageSquare size={20} />,
  email: <Send size={20} />,
  bluesky: <Cloud size={20} />,
  facebook: <Facebook size={20} />,
}

const shareLinkButtonClass =
  'flex min-h-[72px] min-w-0 flex-col items-center justify-center gap-2 rounded border border-muted bg-background/50 p-3 transition-all duration-300 hover:bg-muted/50'

function ShareLinkButton({ link }: { link: ShareLink }) {
  const opensNewTab = link.id !== 'sms' && link.id !== 'email'

  return (
    <a
      href={link.href}
      {...(opensNewTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
      className={cn(shareLinkButtonClass, link.color)}
      title={`Share on ${link.name}`}
    >
      {SHARE_ICONS[link.id]}
      <span className="font-mono text-[10px] tracking-wider uppercase">
        {link.name}
      </span>
    </a>
  )
}

export const Share = ({ url: propUrl, title, className }: ShareProps) => {
  const [copied, setCopied] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const clientHref = useSyncExternalStore(
    noopSubscribe,
    getClientHref,
    () => '',
  )
  const currentUrl = propUrl ?? clientHref

  const canWebShare = useSyncExternalStore(
    noopSubscribe,
    getClientCanWebShare,
    () => false,
  )

  const { primaryLinks, secondaryLinks } = useMemo(() => {
    const links = buildShareLinks(currentUrl, title)
    return {
      primaryLinks: links.filter((link) => link.tier === 'primary'),
      secondaryLinks: links.filter((link) => link.tier === 'secondary'),
    }
  }, [currentUrl, title])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy signal', err)
    }
  }

  const handleSystemShare = async () => {
    try {
      await navigator.share({
        title: title || 'The Second Messenger',
        text: `Check out "${title || 'The Second Messenger'}" by The Second Messenger`,
        url: currentUrl,
      })
    } catch (err) {
      console.log(err, 'User cancelled share or failed')
    }
  }

  return (
    <Card
      className={cn(
        'group relative border border-primary/50 bg-primary/5',
        className,
      )}
    >
      <div className="absolute inset-0 h-[2px] w-full bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <CardHeader className="flex items-center gap-3">
        <div className="animate-pulse rounded-full border border-primary bg-primary/20 p-3 text-primary">
          <Share2 size={20} />
        </div>
        <div>
          <CardTitle className="flex items-center gap-2 font-body text-xl font-bold tracking-widest uppercase">
            Share
          </CardTitle>
          <CardDescription className="font-mono text-sm tracking-wider text-muted-foreground">
            Amplify this signal
          </CardDescription>
        </div>
      </CardHeader>

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

      <CardContent className="flex w-full min-w-0 flex-col gap-2">
        <div
          className={cn(
            'grid min-w-0 gap-2',
            canWebShare ? 'grid-cols-4' : 'grid-cols-3',
          )}
        >
          {canWebShare ? (
            <button
              onClick={handleSystemShare}
              className={cn(
                shareLinkButtonClass,
                'border-primary/50 bg-primary/20 hover:bg-primary/30',
              )}
              title="Open Share Menu"
            >
              <Smartphone size={20} className="text-primary" />
              <span className="font-mono text-[10px] tracking-wider text-primary uppercase">
                System
              </span>
            </button>
          ) : null}

          {primaryLinks.map((link) => (
            <ShareLinkButton key={link.id} link={link} />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setMoreOpen((open) => !open)}
          aria-expanded={moreOpen}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded border border-muted bg-background/50 px-3 py-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase transition-all duration-300 hover:border-primary/30 hover:bg-muted/50 hover:text-foreground"
        >
          <span>{moreOpen ? 'Fewer' : 'More'}</span>
          <ChevronDown
            size={14}
            className={cn(
              'transition-transform duration-300',
              moreOpen && 'rotate-180',
            )}
          />
        </button>

        {moreOpen ? (
          <div className="grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-5">
            {secondaryLinks.map((link) => (
              <ShareLinkButton key={link.id} link={link} />
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
