'use client'

import { useMemo } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/utilities/ui'
import {
  FIELD_LABELS,
  type SongTagField,
} from '@/lib/songs/tagFields'
import {
  activeTagFilterCount,
  type FilterState,
} from '@/lib/music/filterState'
import type { FacetGroup } from '@/lib/music/facetCounts'

interface MusicFilterDrawerProps {
  state: FilterState
  groups: FacetGroup[]
  onToggleTag: (field: SongTagField, slug: string) => void
  onClearLayer: (field: SongTagField) => void
  onClearAll: () => void
}

const TOP_LAYERS_TO_AUTO_OPEN = 3

/**
 * Faceted filter drawer for `/music`. Renders one collapsible section
 * per ontology layer that has at least one tag in scope.
 *
 * Desktop and mobile both use a left-side `Sheet` for consistency —
 * keeps the toolbar uncluttered on small screens and gives the layer
 * list room to breathe on large ones.
 *
 * Smart default: the top N most-populated layers (by current scope)
 * are expanded on first paint; the rest stay collapsed to keep the
 * drawer scannable.
 */
export const MusicFilterDrawer = ({
  state,
  groups,
  onToggleTag,
  onClearLayer,
  onClearAll,
}: MusicFilterDrawerProps) => {
  const populatedGroups = useMemo(
    () => groups.filter((g) => g.options.length > 0),
    [groups],
  )

  const defaultOpenItems = useMemo(() => {
    const open: string[] = []
    // Always expand layers with active filters so users see what's selected.
    for (const g of populatedGroups) {
      if (state.tags[g.field]?.length) open.push(g.field)
    }
    // Then fill the rest of the auto-open quota with the highest-coverage
    // layers (so genre/mood/activity tend to win).
    const sortedByCoverage = [...populatedGroups]
      .filter((g) => !open.includes(g.field))
      .sort((a, b) => b.totalCoverage - a.totalCoverage)
    for (const g of sortedByCoverage) {
      if (open.length >= TOP_LAYERS_TO_AUTO_OPEN) break
      open.push(g.field)
    }
    return open
  }, [populatedGroups, state.tags])

  const tagCount = activeTagFilterCount(state)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            'gap-2 text-xs',
            tagCount > 0 && 'border-primary/50 text-primary',
          )}
          aria-label={
            tagCount > 0
              ? `Open filter drawer (${tagCount} active)`
              : 'Open filter drawer'
          }
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
          Filters
          {tagCount > 0 ? (
            <span
              className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground"
              aria-hidden
            >
              {tagCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="left"
        className="flex w-full max-w-sm flex-col overflow-hidden border-border/60 bg-background/95 backdrop-blur-md sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/40 px-6 py-5">
          <SheetTitle className="font-heading text-xl tracking-widest text-primary uppercase">
            Filter Database
          </SheetTitle>
          <SheetDescription className="font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
            Combine layers to drill into the catalog. Filters AND across
            categories; choices within a category OR together.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {populatedGroups.length === 0 ? (
            <p className="mt-10 text-center font-mono text-xs tracking-wider text-muted-foreground uppercase">
              No tagged data in current scope.
            </p>
          ) : (
            <Accordion
              type="multiple"
              defaultValue={defaultOpenItems}
              className="w-full"
            >
              {populatedGroups.map((group) => {
                const selectedInLayer = state.tags[group.field] ?? []
                return (
                  <AccordionItem key={group.field} value={group.field}>
                    <AccordionTrigger className="py-3 font-mono text-xs tracking-widest text-foreground uppercase">
                      <span className="flex items-center gap-2">
                        {FIELD_LABELS[group.field]}
                        {selectedInLayer.length > 0 ? (
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary">
                            {selectedInLayer.length}
                          </span>
                        ) : (
                          <span className="text-[10px] font-normal text-muted-foreground/60">
                            ({group.options.length})
                          </span>
                        )}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent>
                      {selectedInLayer.length > 0 ? (
                        <button
                          type="button"
                          onClick={() => onClearLayer(group.field)}
                          className="mb-2 font-mono text-[10px] tracking-wider text-muted-foreground uppercase transition-colors hover:text-destructive"
                        >
                          Clear {FIELD_LABELS[group.field]}
                        </button>
                      ) : null}
                      <ul className="flex flex-col gap-1.5 py-1">
                        {group.options.map((opt) => {
                          const inputId = `facet-${group.field}-${opt.id}`
                          const dimmed = opt.count === 0 && !opt.selected
                          return (
                            <li key={opt.id}>
                              <Label
                                htmlFor={inputId}
                                className={cn(
                                  'group flex cursor-pointer items-center gap-3 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-muted/40',
                                  dimmed && 'opacity-40',
                                )}
                              >
                                <Checkbox
                                  id={inputId}
                                  checked={opt.selected}
                                  onCheckedChange={() =>
                                    onToggleTag(group.field, opt.slug)
                                  }
                                  disabled={dimmed}
                                />
                                <span className="flex-1 truncate">
                                  {opt.name}
                                </span>
                                <span className="font-mono text-[10px] tracking-wider text-muted-foreground tabular-nums">
                                  {opt.count}
                                </span>
                              </Label>
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          )}
        </div>

        <SheetFooter className="border-t border-border/40">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            disabled={tagCount === 0}
            className="gap-2 text-xs"
          >
            <X className="size-3" aria-hidden />
            Clear all filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
