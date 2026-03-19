import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center p-24">
      <h1 style={{ marginBottom: 0 }}>404</h1>
      <p className="mb-4">Oh no! This page could not be found.</p>

      <Button asChild variant="default">
        <Link href="/">Return to the home page</Link>
      </Button>
    </div>
  )
}
