'use client'

import React, { useState, useEffect } from 'react'
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
import { cn } from '@/utilities/ui'

interface ShareProps {
  url?: string
  title?: string
  className?: string
}

export const Share = ({ url: propUrl, title, className }: ShareProps) => {
  const [copied, setCopied] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [canWebShare, setCanWebShare] = useState(false)

  // Hydrate URL & Check Feature Support
  useEffect(() => {
    if (propUrl) {
      setCurrentUrl(propUrl)
    } else if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href)
    }

    // Check if the browser supports the native "System Share" (Master Key)
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanWebShare(true)
    }
  }, [propUrl])

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
      console.log('User cancelled share or failed')
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
      icon: <Facebook size={18} />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:text-blue-500 hover:border-blue-500/50',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle size={18} />,
      href: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:text-green-500 hover:border-green-500/50',
    },
    {
      name: 'Bluesky',
      icon: <Cloud size={18} />,
      href: `https://bsky.app/intent/compose?text=${encodedText}%20${encodedUrl}`,
      color: 'hover:text-sky-500 hover:border-sky-500/50',
    },
    {
      name: 'Direct',
      icon: <Send size={18} />,
      href: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check out this track:\n\n`)}${encodedUrl}`,
      color: 'hover:text-primary hover:border-primary/50',
    },
  ]

  return (
    <div
      className={cn(
        'bg-background border border-primary/20 rounded-lg p-6 relative overflow-hidden group',
        className,
      )}
    >
      {/* Decorative "Scanner" Line */}
      <div className="absolute inset-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/10 border border-primary/20 rounded-full text-primary animate-pulse">
          <Share2 size={20} />
        </div>
        <div>
          <h4 className="text-foreground font-heading font-bold uppercase tracking-widest text-sm">
            Relay Signal
          </h4>
          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wide">
            Amplify the transmission
          </p>
        </div>
      </div>

      {/* Copy Input Zone */}
      <div className="relative flex items-center mb-6">
        <div className="w-full bg-background border border-border/50 rounded-l-md py-3 px-4 text-xs font-mono text-muted-foreground truncate border-r-0">
          {currentUrl}
        </div>
        <button
          onClick={handleCopy}
          className="bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary rounded-r-md px-4 py-3 transition-all flex items-center gap-2 min-w-[100px] justify-center group/btn"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span className="text-xs font-bold uppercase tracking-wider">
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>

      {/* Social Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {/* 1. The "Native App" Share (For TikTok/Instagram/etc.) */}
        {canWebShare && (
          <button
            onClick={handleSystemShare}
            className="flex flex-col items-center justify-center gap-2 p-3 rounded bg-primary/20 border border-primary/50 hover:bg-primary/30 transition-all duration-300 col-span-2 sm:col-span-1"
            title="Open Share Menu"
          >
            <Smartphone size={20} className="text-primary" />
            <span className="text-[10px] font-heading uppercase tracking-wider text-primary">
              System Share
            </span>
          </button>
        )}

        {/* 2. Standard Web Links */}
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-3 rounded bg-muted border border-muted transition-all duration-300',
              link.color,
              'hover:bg-muted/50',
            )}
            title={`Share on ${link.name}`}
          >
            {link.icon}
            <span className="text-[10px] font-heading uppercase tracking-wider">{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
