import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NOT_FOUND_LINKS: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/admin', label: 'Admin Panel' },
  { href: '/login', label: 'Login' },
  { href: '/crew', label: 'Crew' },
  { href: '/memberships', label: 'Memberships' },
  { href: '/posts', label: 'Posts' },
  { href: '/videos', label: 'Videos' },
]

export type NotFoundViewProps = {
  /**
   * `hard` — `<a href>` full navigations (use in root `app/not-found.tsx` across Next root-layout boundaries).
   * `next` — `next/link` client transitions (use under `(frontend)` layout).
   */
  linkMode: 'hard' | 'next'
  sectionClassName?: string
}

export function NotFoundView({
  linkMode,
  sectionClassName,
}: NotFoundViewProps) {
  return (
    <section
      className={cn(
        'container flex flex-col items-center justify-center bg-background p-24 text-foreground',
        sectionClassName,
      )}
    >
      <h1
        style={{ marginBottom: 0 }}
        className="glitch-text font-heading text-9xl tracking-wider uppercase"
      >
        404
      </h1>
      <p className="my-4 text-muted-foreground">
        Oh no! This page could not be found.
      </p>

      <Button asChild variant="default">
        {linkMode === 'next' ? (
          <Link href="/">Return to the home page</Link>
        ) : (
          // Root not-found lives outside the frontend root layout; full page navigations avoid nested html/body issues.
          // eslint-disable-next-line @next/next/no-html-link-for-pages
          <a href="/">Return to the home page</a>
        )}
      </Button>
      <p className="mt-12 font-mono text-lg tracking-wider text-muted-foreground uppercase">
        Other helpful links:
      </p>
      <ul className="flex w-full flex-wrap justify-between gap-4">
        {NOT_FOUND_LINKS.map(({ href, label }) => (
          <li
            key={href + label}
            className="my-2 font-mono text-xs tracking-wider text-muted-foreground uppercase"
          >
            {linkMode === 'next' ? (
              <Link href={href}>{label}</Link>
            ) : (
              // eslint-disable-next-line @next/next/no-html-link-for-pages
              <a href={href}>{label}</a>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-12 text-muted-foreground">
        If you think this is an error, please contact us at{' '}
        <a href="mailto:support@thesecondmessenger.com">
          support@thesecondmessenger.com
        </a>
      </p>
    </section>
  )
}
