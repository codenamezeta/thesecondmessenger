'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePlayer } from '@/context/PlayerContext'

export default function HomePage() {
  const { playMedia } = usePlayer()
  return (
    <main className="container h-[600vh]">
      <h1>Hello World!</h1>
      <Link href="/theme-playground">Theme Playground</Link>
      <br />
      <Button
        variant="secondary"
        className="my-4"
        onClick={() => playMedia('KYf5cJJQxrE')}
      >
        Play a song
      </Button>
    </main>
  )
}
