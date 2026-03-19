'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { usePlayer } from '@/context/PlayerContext'

export default function HomePage() {
  const { playMedia } = usePlayer()
  return (
    <main className="container">
      <h1>Hello World!</h1>
      <Link href="/theme-playground">Theme Playground</Link>
      <Button variant="secondary" onClick={() => playMedia('dQw4w9WgXcQ')}>
        Play a song
      </Button>
    </main>
  )
}
