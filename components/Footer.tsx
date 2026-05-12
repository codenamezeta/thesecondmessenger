import type { ReactNode } from 'react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ThemeToggle'

const exploreLinks = [
  // { label: 'Home', href: '/' },
  { label: 'Music', href: '/music' },
  { label: 'Videos', href: '/videos' },
  // { label: 'Bio', href: '/bio' },
  { label: 'Posts', href: '/posts' },
] as const

const accessLinks = [
  { label: 'Join the Crew', href: '/crew' },
  { label: 'Members', href: '/login' },
] as const

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
] as const

function FooterColumn({
  hud,
  title,
  children,
}: {
  hud: string
  title: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
          {hud}
        </p>
        <h2 className="mt-1 font-heading text-sm font-bold tracking-widest text-foreground uppercase">
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}

function FooterLinkList({
  links,
}: {
  links: readonly { label: string; href: string }[]
}) {
  return (
    <ul className="flex flex-col gap-3">
      {links.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className="font-mono text-xs tracking-wider text-muted-foreground uppercase transition-colors hover:text-primary"
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

export function Footer() {
  return (
    <footer
      className="relative mt-auto border-t border-border/50 bg-card/10 backdrop-blur-md"
      aria-label="Site footer"
    >
      <div
        className="pointer-events-none absolute top-0 left-0 h-3 w-3 border-t border-l border-primary/40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-0 right-0 h-3 w-3 border-t border-r border-primary/40"
        aria-hidden
      />

      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              {'// Uplink closed'}
            </p>
            <p className="mt-2 font-heading text-2xl font-bold tracking-tight text-foreground uppercase md:text-3xl">
              The 2nd Messenger
            </p>
            <p className="mt-3 max-w-md border-l border-primary/30 pl-4 text-sm leading-relaxed text-muted-foreground">
              Foreground music, direct from the artist. Join the Crew to shape
              releases, hear demos early, and unlock the archive.
            </p>
            <Link
              href="/crew"
              className="mt-6 inline-flex min-h-12 items-center justify-center border border-border/50 bg-background/40 px-6 py-3 font-mono text-xs tracking-[0.2em] uppercase backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-primary"
            >
              Join the Crew
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 lg:col-span-7">
            <FooterColumn hud="// Index" title="Explore">
              <FooterLinkList links={exploreLinks} />
            </FooterColumn>
            <FooterColumn hud="// Access" title="Crew">
              <FooterLinkList links={accessLinks} />
            </FooterColumn>
            <FooterColumn hud="// Compliance" title="Legal">
              <FooterLinkList links={legalLinks} />
            </FooterColumn>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-8 border-t border-border/50 pt-8 md:flex-row md:items-end">
          <p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
            Copyright © {new Date().getFullYear()} The Second Messenger. All
            rights reserved.
            <br />
            This website was built by hand by{' '}
            <Link
              href="https://a2zeta.com"
              target="_blank"
              className="text-primary/50 hover:underline"
            >
              _codenamezeta
            </Link>
            .
          </p>
          <ThemeToggle />
          <p className="font-mono text-[10px] tracking-[0.25em] text-primary/70 uppercase lg:max-w-xs lg:text-right">
            Secure channel · End of file
          </p>
        </div>
      </div>
    </footer>
  )
}
