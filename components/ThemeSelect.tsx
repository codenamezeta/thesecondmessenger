'use client'

import { Palette } from 'lucide-react'

import { useTheme } from '@/components/ThemeProvider'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getTheme, isThemeId, THEMES } from '@/lib/themes'
import { cn } from '@/lib/utils'

const FEATURED_VALUE = '__featured__'

function Swatch({ color }: { color: string }) {
  return (
    <span
      aria-hidden
      className="inline-block size-3 shrink-0 rounded-full border border-foreground/20"
      style={{ background: color }}
    />
  )
}

type ThemeSelectProps = {
  className?: string
}

export function ThemeSelect({ className }: ThemeSelectProps) {
  const { activeTheme, siteDefault, isFollowingFeatured, setTheme, followFeatured } =
    useTheme()

  const featuredTheme = getTheme(siteDefault)

  // Always a defined value (keeps Radix controlled). SSR + first client render
  // both resolve to "Featured" before effects run, so they agree; the effect
  // then swaps to the stored/account choice.
  const value = isFollowingFeatured ? FEATURED_VALUE : activeTheme

  function handleChange(next: string) {
    if (next === FEATURED_VALUE) {
      followFeatured()
      return
    }
    if (isThemeId(next)) setTheme(next)
  }

  return (
    <div className={cn(className)}>
      <Select value={value} onValueChange={handleChange}>
        <SelectTrigger
          aria-label="Color theme"
          className="min-h-12 w-full rounded-none border-border/50 bg-background/40 font-mono text-xs tracking-wider uppercase backdrop-blur-sm sm:w-56"
        >
          <Palette className="size-4 shrink-0 text-primary" aria-hidden />
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent className="rounded-none">
          <SelectGroup>
            <SelectLabel className="font-mono text-[10px] tracking-widest uppercase">
              Featured
            </SelectLabel>
            <SelectItem
              value={FEATURED_VALUE}
              className="rounded-none font-mono text-xs tracking-wider uppercase"
            >
              <Swatch color={featuredTheme.swatch} />
              <span>Featured · {featuredTheme.label}</span>
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel className="font-mono text-[10px] tracking-widest uppercase">
              All themes
            </SelectLabel>
            {THEMES.map((theme) => (
              <SelectItem
                key={theme.id}
                value={theme.id}
                className="rounded-none font-mono text-xs tracking-wider uppercase"
              >
                <Swatch color={theme.swatch} />
                <span>{theme.label}</span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}
