import type { ReactNode } from 'react'

type LegalLayoutProps = {
  eyebrow: string
  title: string
  lastUpdated: string
  intro?: ReactNode
  children: ReactNode
}

function formatLastUpdated(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return iso
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function LegalLayout({
  eyebrow,
  title,
  lastUpdated,
  intro,
  children,
}: LegalLayoutProps) {
  return (
    <main className="relative overflow-hidden bg-transparent py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <article className="relative z-10 container flex max-w-4xl flex-col gap-10">
        <header className="space-y-4 border border-border/50 bg-card/20 p-6 backdrop-blur-sm md:p-8">
          <p className="font-mono text-[10px] tracking-[0.25em] text-primary uppercase">
            {eyebrow}
          </p>
          <h1 className="font-heading text-4xl leading-[0.95] tracking-tight text-foreground uppercase md:text-5xl">
            {title}
          </h1>
          <p className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
          {intro && (
            <div className="max-w-3xl border-l border-primary/40 pl-4 text-sm leading-relaxed text-muted-foreground md:text-base">
              {intro}
            </div>
          )}
        </header>

        <div className="space-y-10">{children}</div>
      </article>
    </main>
  )
}

type LegalSectionProps = {
  id: string
  number: string
  title: string
  children: ReactNode
}

export function LegalSection({
  id,
  number,
  title,
  children,
}: LegalSectionProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-4 border border-border/40 bg-card/15 p-5 backdrop-blur-sm md:p-7"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
          {number}
        </span>
        <h2 className="font-heading text-xl tracking-tight text-foreground uppercase md:text-2xl">
          {title}
        </h2>
      </div>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base [&_a]:text-primary [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  )
}

type LegalSubsectionProps = {
  title: string
  children: ReactNode
}

export function LegalSubsection({ title, children }: LegalSubsectionProps) {
  return (
    <div className="space-y-3 border-l border-border/50 pl-4">
      <h3 className="font-mono text-xs tracking-[0.18em] text-foreground uppercase">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
