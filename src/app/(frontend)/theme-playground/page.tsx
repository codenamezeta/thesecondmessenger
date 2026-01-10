import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function ThemePlayground() {
  return (
    <main className="container py-12">
      <h1 className="text-4xl md:text-6xl font-heading uppercase tracking-widest mb-4 text-primary">
        Theme Playground
      </h1>
      <p className="text-xl font-heading uppercase tracking-widest mb-4">
        A super special secret page where you can test different CSS classes to make sure that the
        different themes always look good.
      </p>
      <div className="flex flex-col gap-4 justify-between">
        <h2 className="text-2xl font-heading uppercase tracking-widest mb-4 text-secondary">
          Choose theme
        </h2>
        <ThemeSelector />
        <hr />
      </div>
      <div className="flex justify-between py-12 flex-wrap gap-y-4">
        <span className="text-center border-b border-border text-2xl font-heading w-full">
          Theme Colors
        </span>

        <div className="bg-primary border border-primary rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-primary-foreground">Primary</span>
        </div>

        <div className="bg-secondary border border-secondary rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-secondary-foreground">Secondary</span>
        </div>

        <div className="bg-accent border border-accent rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-accent-foreground">Accent</span>
        </div>

        <div className="bg-background border border-border rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-foreground">Background</span>
        </div>

        <div className="bg-muted border border-muted rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-muted-foreground">Muted</span>
        </div>

        <div className="bg-card border border-card rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-card-foreground">Card</span>
        </div>

        <div className="bg-popover border border-popover rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-popover-foreground">Popover</span>
        </div>

        <div className="bg-sidebar border border-sidebar rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-sidebar-foreground">Sidebar</span>
        </div>

        <div className="bg-sidebar-primary border border-sidebar-primary rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-sidebar-primary-foreground">Sidebar Primary</span>
        </div>

        <div className="bg-sidebar-accent border border-sidebar-accent rounded-lg w-[19%] h-80 flex items-center justify-center">
          <span className="text-sidebar-accent-foreground">Sidebar Accent</span>
        </div>

        <Button variant="default">Default Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
        <Button variant="ghost">Ghost Button</Button>
        <Button variant="link">Link Button</Button>
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
          </SelectContent>
        </Select>
        <Checkbox />
        <Textarea />
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
    </main>
  )
}
