import { ThemeSelect } from '@/components/ThemeSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  RankBadge,
  RANK_BADGE_LABELS,
  type CrewRank,
} from '@/components/RankBadges'

const CREW_RANKS: CrewRank[] = [
  'ensign',
  'lieutenant',
  'commander',
  'captain',
  'admiral',
]

const RANK_BADGE_SIZES = ['sm', 'md', 'lg'] as const

export default function ThemePlayground() {
  return (
    <main className="container mx-auto py-12">
      <h1 className="mb-4 font-heading text-4xl tracking-widest text-primary uppercase md:text-6xl">
        Theme Playground
      </h1>
      <p className="mb-4 font-heading text-xl tracking-widest uppercase">
        A super special secret page where you can test different CSS classes to
        make sure that the different themes always look good.
      </p>
      <div className="flex flex-col justify-between gap-4">
        <h2 className="mb-4 font-heading text-2xl tracking-widest text-secondary uppercase">
          Switch themes to preview
        </h2>
        <ThemeSelect />
        <Separator />
      </div>
      <div className="flex flex-wrap justify-between gap-y-4 py-12">
        <span className="w-full border-b border-border text-center font-heading text-2xl">
          Theme Colors
        </span>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-primary bg-primary">
          <span className="text-primary-foreground">Primary</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-secondary bg-secondary">
          <span className="text-secondary-foreground">Secondary</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-accent bg-accent">
          <span className="text-accent-foreground">Accent</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-border bg-background">
          <span className="text-foreground">Background</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-muted bg-muted">
          <span className="text-muted-foreground">Muted</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-card bg-card">
          <span className="text-card-foreground">Card</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-popover bg-popover">
          <span className="text-popover-foreground">Popover</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-sidebar bg-sidebar">
          <span className="text-sidebar-foreground">Sidebar</span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-sidebar-primary bg-sidebar-primary">
          <span className="text-sidebar-primary-foreground">
            Sidebar Primary
          </span>
        </div>

        <div className="flex h-80 w-[19%] items-center justify-center rounded-lg border border-sidebar-accent bg-sidebar-accent">
          <span className="text-sidebar-accent-foreground">Sidebar Accent</span>
        </div>
        <ButtonGroup>
          <Button variant="default">Default Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
          <Button variant="link">Link Button</Button>
        </ButtonGroup>
        <Separator />
        <span className="w-full border-b border-border text-center font-heading text-2xl">
          Form Elements
        </span>
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Name" />
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="orange">Orange</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
            <SelectItem value="strawberry">Strawberry</SelectItem>
            <SelectItem value="watermelon">Watermelon</SelectItem>
            <SelectItem value="peach">Peach</SelectItem>
            <SelectItem value="pear">Pear</SelectItem>
            <SelectItem value="plum">Plum</SelectItem>
            <SelectItem value="cherry">Cherry</SelectItem>
            <SelectItem value="raspberry">Raspberry</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grape">Grape</SelectItem>
            <SelectItem value="lime">Lime</SelectItem>
            <SelectItem value="lemon">Lemon</SelectItem>
          </SelectContent>
        </Select>
        <Checkbox />
        <Textarea />
        <Separator />
        <span className="w-full border-b border-border text-center font-heading text-2xl">
          Card
        </span>
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card Content</p>
          </CardContent>
          <CardFooter>
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      </div>
      <section className="space-y-6 py-10">
        <h2 className="border-b border-border pb-2 font-heading text-2xl tracking-widest uppercase">
          Typography Specimen
        </h2>

        <div>
          <h1>Heading One 1</h1>
          <h2>Heading Two</h2>
          <h3>Heading Three</h3>
          <h4>Heading Four</h4>
          <h5>Heading Five</h5>
          <h6>Heading Six</h6>
        </div>

        <div className="space-y-4 font-body text-foreground">
          <p className="text-lg leading-relaxed">
            This is a lead paragraph for testing readable long-form text,
            spacing, and contrast across themes.
          </p>
          <p>
            The quick brown fox jumps over the lazy dog. Pack my box with five
            dozen liquor jugs. Sphinx of black quartz, judge my vow. The quick
            brown fox jumps over the lazy dog. Pack my box with five dozen
            liquor jugs. Sphinx of black quartz, judge my vow. The quick brown
            fox jumps over the lazy dog. Pack my box with five dozen liquor
            jugs. Sphinx of black quartz, judge my vow. The quick brown fox
            jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            Sphinx of black quartz, judge my vow. The quick brown fox jumps over
            the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of
            black quartz, judge my vow. The quick brown fox jumps over the lazy
            dog. Pack my box with five dozen liquor jugs. Sphinx of black
            quartz, judge my vow. The quick brown fox jumps over the lazy dog.
            Pack my box with five dozen liquor jugs. Sphinx of black quartz,
            judge my vow.
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Small body copy: use this for supporting context, helper text, and
            dense but legible UI descriptions.
          </p>
          <p className="font-mono">
            The quick brown fox jumps over the lazy dog. Pack my box with five
            dozen liquor jugs. Sphinx of black quartz, judge my vow. The quick
            brown fox jumps over the lazy dog. Pack my box with five dozen
            liquor jugs. Sphinx of black quartz, judge my vow. The quick brown
            fox jumps over the lazy dog. Pack my box with five dozen liquor
            jugs. Sphinx of black quartz, judge my vow. The quick brown fox
            jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            Sphinx of black quartz, judge my vow. The quick brown fox jumps over
            the lazy dog. Pack my box with five dozen liquor jugs. Sphinx of
            black quartz, judge my vow. The quick brown fox jumps over the lazy
            dog. Pack my box with five dozen liquor jugs. Sphinx of black
            quartz, judge my vow. The quick brown fox jumps over the lazy dog.
            Pack my box with five dozen liquor jugs. Sphinx of black quartz,
            judge my vow.
          </p>
        </div>
      </section>

      <Separator className="my-4" />

      <section className="space-y-10 py-10">
        <h2 className="border-b border-border pb-2 font-heading text-2xl tracking-widest uppercase">
          Rank badges
        </h2>

        <p className="font-body text-sm text-muted-foreground">
          Matrix of every tier and badge size — default{' '}
          <code className="font-mono text-xs text-foreground">
            showLabel=true
          </code>
          .
        </p>

        <RankBadgePropMatrix showLabel />

        <p className="font-body text-sm text-muted-foreground">
          Same grid with{' '}
          <code className="font-mono text-xs text-foreground">
            showLabel=false
          </code>{' '}
          (insignia + stripes only).
        </p>

        <RankBadgePropMatrix showLabel={false} />
      </section>
    </main>
  )
}

function RankBadgePropMatrix({ showLabel }: { showLabel: boolean }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[min(100%,560px)] border-collapse border border-border">
        <thead>
          <tr className="bg-muted/40">
            <th
              scope="col"
              className="border border-border px-3 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
            >
              Tier (<span className="text-foreground">rank</span>)
            </th>
            {RANK_BADGE_SIZES.map((size) => (
              <th
                key={size}
                scope="col"
                className="border border-border px-3 py-2 text-left font-mono text-[10px] tracking-widest text-muted-foreground uppercase"
              >
                size=&quot;{size}&quot;
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {CREW_RANKS.map((rank) => (
            <tr key={`${rank}-${showLabel}`}>
              <th
                scope="row"
                className="border border-border px-3 py-2 text-left align-middle font-mono text-[10px] tracking-widest text-foreground uppercase"
              >
                {RANK_BADGE_LABELS[rank]}
                <span className="mt-1 block font-normal tracking-normal text-muted-foreground normal-case">
                  rank=&quot;{rank}&quot;
                </span>
              </th>
              {RANK_BADGE_SIZES.map((size) => (
                <td
                  key={size}
                  className="border border-border px-3 py-4 align-middle"
                >
                  <div className="flex flex-col items-start gap-2">
                    <RankBadge rank={rank} size={size} showLabel={showLabel} />
                    <span className="font-mono text-[9px] leading-tight text-muted-foreground">
                      showLabel={showLabel ? 'true' : 'false'}
                    </span>
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
