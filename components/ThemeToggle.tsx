'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { cn } from '@/lib/utils'

type ThemeToggleProps = {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className={cn(className)} role="group" aria-label="Color theme">
      <div className="flex rounded-none border border-border/50 bg-background/40 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-pressed={resolvedTheme === 'light'}
          className={cn(
            'inline-flex min-h-12 flex-1 items-center justify-center gap-2 border-r border-border/50 px-4 font-mono text-xs tracking-wider uppercase transition-colors sm:min-w-26 sm:flex-none',
            resolvedTheme === 'light'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Sun className="size-4 shrink-0" aria-hidden />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-pressed={resolvedTheme === 'dark'}
          className={cn(
            'inline-flex min-h-12 flex-1 items-center justify-center gap-2 px-4 font-mono text-xs tracking-wider uppercase transition-colors sm:min-w-26 sm:flex-none',
            resolvedTheme === 'dark'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Moon className="size-4 shrink-0" aria-hidden />
          <span>Dark</span>
        </button>
      </div>
    </div>
  )
}
