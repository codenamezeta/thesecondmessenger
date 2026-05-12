'use client'

import React, { useState, useEffect } from 'react'
import { VideoBackground } from '@/components/VideoBackground'
import Image from 'next/image'
import {
  Radio,
  Guitar,
  Mic2,
  Cpu,
  Globe,
  Terminal,
  Hash,
  FileText,
  Fingerprint,
} from 'lucide-react'
import { cn } from '@/utilities/ui'

// --- NAVIGATION LINKS ---
const CHAPTERS = [
  { id: 'intro', label: '00: PROLOGUE', icon: Terminal },
  { id: 'ch1', label: '01: THE SPARK', icon: Radio },
  { id: 'ch2', label: '02: THE LOGIC', icon: Guitar },
  { id: 'ch3', label: '03: THE ACADEMY', icon: Mic2 },
  { id: 'ch4', label: '04: THE ARCHITECT', icon: Cpu },
  { id: 'ch5', label: '05: THE COSMOS', icon: Globe },
  { id: 'outro', label: 'XX: TRANSMISSION', icon: Hash },
]

export default function BioPage() {
  const [activeSection, setActiveSection] = useState('intro')

  // Scroll Spy
  useEffect(() => {
    const handleScroll = () => {
      const sections = CHAPTERS.map((c) => document.getElementById(c.id))
      const scrollPosition = window.scrollY + 300

      sections.forEach((section) => {
        if (
          section &&
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id)
        }
      })
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 100, behavior: 'smooth' })
    }
  }

  return (
    <article className="relative z-0 min-h-screen pb-20">
      {/* <VideoBackground src="/vids/glitch-vid-01.mp4" fixed opacity={0.02} blendMode="screen" /> */}
      {/* --- HERO SECTION (NEW) --- */}
      <section className="relative isolate mb-20 flex h-[60vh] min-h-[500px] items-end overflow-hidden border-b border-border bg-transparent pb-20">
        <div className="absolute top-12 right-0 bottom-0 z-10 opacity-50 md:opacity-100 xl:right-[10vw]">
          <Image
            src="/imgs/profile-01.png"
            className="z-30 size-full object-cover"
            alt="profile"
            width={786}
            height={786}
            priority
          />
        </div>

        {/* Background Elements */}
        <VideoBackground
          src="/vids/glitch-vid-01.mp4"
          opacity={0.75}
          blendMode="screen"
        />
        <div className="pointer-events-none absolute inset-0 bg-[url('/imgs/backgrounds/scanlines.png')] opacity-10" />
        <div className="absolute inset-0 bg-linear-to-tr from-black to-transparent" />

        <div className="relative z-10 container">
          <div className="max-w-4xl">
            {/* Identification Header */}
            <div className="mb-4 flex items-center gap-3 opacity-70">
              <div className="border border-primary bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-primary uppercase">
                Class: Architect
              </div>
              <div className="border border-border/50 px-2 py-0.5 font-mono text-[10px] tracking-widest text-foreground uppercase">
                Clearance: Level 5
              </div>
            </div>

            <h1 className="mb-6 font-heading text-5xl leading-none tracking-widest text-foreground uppercase md:text-8xl">
              <span className="mb-2 block text-2xl tracking-[0.5em] text-primary/80 md:text-4xl">
                Identity:
              </span>
              The Second
              <br />
              Messenger
            </h1>

            <blockquote className="max-w-2xl border-l-2 border-primary pl-6 font-mono text-xl text-foreground/50">
              &quot;I didn&apos;t write these songs to become famous. I wrote
              them because I wanted to leave a legacy behind.&quot;
            </blockquote>

            {/* Decorative Data Grid */}
            <div className="mt-12 grid grid-cols-2 gap-8 border-t border-border/50 pt-6 md:grid-cols-4">
              <div>
                <div className="mb-1 text-[10px] tracking-widest text-foreground/50 uppercase">
                  Civilian Name
                </div>
                <div className="font-bold text-foreground/80">Michael Zeta</div>
              </div>
              <div>
                <div className="mb-1 text-[10px] tracking-widest text-foreground/50 uppercase">
                  Origin
                </div>
                <div className="font-bold text-foreground/80">
                  Earth &gt; California
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] tracking-widest text-foreground/50 uppercase">
                  Specialty
                </div>
                <div className="font-bold text-foreground/80">
                  Audio Synthesis
                </div>
              </div>
              <div>
                <div className="mb-1 text-[10px] tracking-widest text-foreground/50 uppercase">
                  Status
                </div>
                <div className="flex animate-pulse items-center gap-2 font-bold text-primary">
                  <div className="size-2 rounded-full bg-primary" />
                  Transmitting
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 gap-12 lg:grid-cols-[250px_1fr]">
        {/* --- LEFT SIDEBAR (The Directory) --- */}
        <aside className="sticky top-28 hidden h-[calc(100vh-150px)] lg:block">
          <div className="bg-surface flex h-full flex-col rounded-lg border border-border/50 p-6 backdrop-blur-sm">
            <h3 className="mb-6 flex items-center gap-2 border-b border-border/50 pb-4 text-xs font-bold tracking-widest text-foreground/50 uppercase">
              <Fingerprint size={14} /> Personnel File
            </h3>
            <nav className="flex-1 space-y-1">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => scrollTo(chapter.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded px-3 py-2 text-left font-mono text-xs tracking-wider uppercase transition-all',
                    activeSection === chapter.id
                      ? 'bg-accent font-bold text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.85)]'
                      : 'text-foreground/50 hover:bg-card/50 hover:text-foreground hover:shadow-[0_0_15px_hsl(var(--primary)/0.25)]',
                  )}
                >
                  <chapter.icon size={14} />
                  {chapter.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* --- RIGHT CONTENT (The Story) --- */}
        <main className="relative space-y-24">
          {/* BACKGROUND DECORATION: The Timeline Spine */}
          <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-linear-to-b from-transparent via-foreground/50 to-transparent lg:left-0" />

          {/* INTRO */}
          <section id="intro" className="relative pl-12 lg:pl-16">
            <div className="absolute top-0 left-4 h-2 w-2 translate-x-[-3px] rounded-full bg-primary lg:left-0" />

            <h2 className="glitch-text mb-6 font-heading text-4xl tracking-widest text-foreground uppercase md:text-5xl">
              000: Prologue
            </h2>

            <div className="bg-surface/5 group relative overflow-hidden rounded-r-lg border-l-2 border-accent p-8">
              <div className="pointer-events-none absolute inset-0 bg-[url('/imgs/backgrounds/scanlines.png')] opacity-10" />
              <FileText className="absolute top-4 right-4 h-24 w-24 rotate-12 text-foreground/5" />

              <blockquote className="relative z-10 border-0 font-heading text-xl leading-relaxed text-foreground/90 italic md:text-2xl">
                &quot;I&apos;ve always believed that a great song is a great
                song, regardless of the icing you put on top. If the melody and
                the chords are honest, the song will live forever.&quot;
              </blockquote>
            </div>
          </section>

          {/* CHAPTER I */}
          <BioChapter
            id="ch1"
            title="001: The Spark"
            meta="DATE: 1999 // LOC: DAD'S CAR // SUB: ORIGIN"
            image="/imgs/young-mikey-01.jpg"
            icon={<Radio className="size-12 text-primary-foreground" />}
          >
            <p>
              It started with a terrifying proposition in the passenger seat of
              my dad&apos;s car. I had just turned ten years old when Green
              Day&apos;s &quot;Brain Stew&quot; comes on the radio. My father -
              a lifelong professional musician - turns to me with an idea that
              changed the directory of my life forever. He was turning forty and
              celebrating by throwing a backyard party where his band would be
              performing, and he wanted me to sit in on the bass and play Brain
              Stew.
            </p>
            <p>
              At that age, I looked at radio music as some kind of unattainable
              magic, a craft far too complex for &quot;little ol&apos; me.&quot;
              But my dad saw something I didn&apos;t. I practiced that simple,
              descending riff until my fingers knew it by heart. Standing on
              that stage just a few days later, I felt the vibration of the
              amplifiers and the energy of the crowd for the first time. I
              didn&apos;t know it then, but my life had just found its rhythm.
            </p>
          </BioChapter>

          {/* CHAPTER II */}
          <BioChapter
            id="ch2"
            title="002: The Logic of the Six-String"
            meta="SUB: DISCOVERY // ASSET: ACOUSTIC GUITAR"
            image="/imgs/michael-01.jpg"
            icon={<Guitar className="size-12 text-primary-foreground" />}
            imageRight={false}
          >
            <p>
              I played the bass for a few months after that, but I’ll be honest:
              I was getting bored. I was playing simplified parts that
              didn&apos;t quite make sense to me. I needed patterns, logic, and
              a way to experiment that didn&apos;t just feel like randomness. I
              needed to see the whole picture.
            </p>
            <p>
              To keep me from walking away, my dad handed me an acoustic guitar
              and showed me the opening to &quot;Good Riddance (Time of Your
              Life).&quot; I remember carrying guitar picks to school and
              obsessively practicing the down-down-up-up-down-up pattern against
              the seam of my jeans until the stitching started to fray.
            </p>
            <p>
              Then, the &quot;a-ha&quot; moment happened. The moment I
              understood how multiple notes combined to make chords, the
              polyphonic nature of the guitar ignited something in me. Suddenly,
              music seemed obvious. I could see how the vocals sat on top of the
              chords, how the bass locked in, and where the harmonies belonged.
              Something in my brain was built to manipulate music. I never set
              the guitar down again.
            </p>
          </BioChapter>

          {/* CHAPTER III */}
          <BioChapter
            id="ch3"
            title="003: The Academy"
            meta="LOC: WEST COAST ROCK SCHOOL // ASSET: M-AUDIO INTERFACE"
            image="/imgs/young-mikey-02.jpg"
            icon={<Mic2 className="size-12 text-primary-foreground" />}
          >
            <p>
              I grew up in the halls of West Coast Rock School, the music
              academy my father founded when I was fourteen. While other kids
              had traditional after-school jobs, I spent my free time surrounded
              by instruments, mentors, and the hum of amplifiers. It was here
              that I learned the &quot;family trade.&quot;
            </p>
            <p>
              In those early years, my dad bought us one of the first home
              recording setups available - an M-Audio FireWire interface running
              into GarageBand. I quickly realized that a Digital Audio
              Workstation (DAW) wasn&apos;t just a tool - it was an instrument
              in and of itself. By thirteen, I was building fully-fledged songs.
              They might have sounded rough, but the core was there.
            </p>
            <p>
              Over the next twelve years, I became a teacher at that school. I
              learned thousands of songs, produced dozens of records, and taught
              hundreds of students. I saw how music could change a person&apos;s
              life, just as it had changed mine.
            </p>
          </BioChapter>

          {/* CHAPTER IV */}
          <BioChapter
            id="ch4"
            title='004: The "Mike of All Trades"'
            meta="PHILOSOPHY: DIY // ROLE: PRODUCER"
            image="/imgs/michael-today.jpg"
            icon={<Cpu className="size-12 text-primary-foreground" />}
            imageRight={false}
          >
            <p>
              To those of you listening to these songs years from now, know that
              The Second Messenger was built by hand. Every note, every beat,
              every mix, and every master. No AI either. My wife gave me the
              nickname &quot;Mike of all trades&quot; because I couldn&apos;t
              seem to stay in one lane. I’m the guy on the sofa writing the
              lyrics - I’m the guy at the desk tracking, editing, mixing, and
              mastering every note.
            </p>
            <div className="my-6 rounded-lg border border-border/50 bg-muted/50 p-4 font-mono text-sm">
              <strong className="mb-2 block tracking-widest text-primary uppercase">
                // Sonic Profile
              </strong>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="text-foreground/80">Songwriting:</span> Vocal
                  Power Pop & Beatles-esque harmony.
                </li>
                <li>
                  <span className="text-foreground/80">Energy:</span>{' '}
                  High-voltage Pop-Punk (Blink-182, Green Day).
                </li>
                <li>
                  <span className="text-foreground/80">Sound:</span> 90s Analog
                  Warmth & Saturation.
                </li>
              </ul>
            </div>
            <p>
              I never wanted to be stuck in a box. I wanted to write the
              &quot;Helter Skelter&quot; rock anthems and the
              &quot;Yesterday&quot; introspective ballads. I want you to hear
              the variety and know that I wasn&apos;t just following a trend—I
              was following the song.
            </p>
          </BioChapter>

          {/* CHAPTER V */}
          <BioChapter
            id="ch5"
            title="005: The Intellectual Heart"
            meta="THEME: COSMOS // RELIGION: SCIENCE"
            image="/imgs/profile-01.png"
            icon={<Globe className="h-12 w-12 text-black" />}
          >
            <p>
              I consider myself an intellectual, and science is, in many ways,
              my religion. I&apos;ve always been drawn to the stars and the
              logic of the universe. That&apos;s why you&apos;ll hear sci-fi
              themes and scientific metaphors woven into my lyrics. Like
              Train&apos;s &quot;Drops of Jupiter&quot; or The Beatles&apos;
              &quot;Across the Universe,&quot; I try to use the language of the
              cosmos to explain the mysteries of the heart.
            </p>
            <p>
              I didn&apos;t write these songs to become famous or to make a
              fortune. I wrote them because I wanted to leave a signal behind. I
              wanted to create a repertoire of music that would stand the test
              of time—something you could listen to and feel like you know me,
              even if we&apos;ve never met.
            </p>
          </BioChapter>

          {/* OUTRO */}
          <section id="outro" className="relative pt-12 pl-12 lg:pl-16">
            <div className="absolute top-12 left-4 size-2 translate-x-[-3px] rounded-full bg-special lg:left-0" />

            <div className="rounded-lg border border-special/30 bg-special/10 p-8">
              <div className="mb-6 flex items-center gap-3">
                <Terminal size={20} className="text-special" />
                <h2 className="font-heading text-xl tracking-wider text-foreground uppercase">
                  Encrypted Message: To My Descendants
                </h2>
              </div>
              <p className="mb-6 font-mono text-sm leading-relaxed text-foreground/75">
                &quot;If you ever feel like you&apos;re struggling to find your
                path, remember that it&apos;s okay to be a &quot;jack of all
                trades.&quot; Don&apos;t be afraid to learn the logic behind the
                magic. Whether you&apos;re writing a song, building a business,
                or studying the stars, do it with everything you&apos;ve
                got.&quot;
              </p>
              <div className="flex animate-pulse items-center justify-end gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                <span>...Transmission End</span>
                <div className="h-4 w-2 bg-primary" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </article>
  )
}

// --- REUSABLE CHAPTER COMPONENT ---
interface BioChapterProps {
  id: string
  title: string
  meta: string
  image: string
  children: React.ReactNode
  icon: React.ReactNode
  imageRight?: boolean
}

const BioChapter = ({
  id,
  title,
  meta,
  image,
  children,
  icon,
  imageRight = true,
}: BioChapterProps) => {
  const [isRevealed, setIsRevealed] = useState(false)

  return (
    <section id={id} className="group relative scroll-mt-32 pl-12 lg:pl-16">
      {/* Timeline Node */}
      <div className="absolute top-0 left-4 h-2 w-2 translate-x-[-3px] rounded-full bg-accent lg:left-0" />

      <div
        className={cn(
          'grid grid-cols-1 gap-8 md:grid-cols-2',
          !imageRight && 'md:flex-row-reverse',
        )}
      >
        {/* Text Content */}
        <div
          className={cn(
            'space-y-4 text-sm leading-relaxed text-foreground/75 md:text-base',
            !imageRight && 'md:order-2',
          )}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-primary uppercase">
              {meta}
            </span>
          </div>

          <h2 className="mb-2 font-heading text-2xl tracking-wider text-foreground uppercase md:text-3xl">
            {title}
          </h2>
          {children}
        </div>

        {/* Visual Placeholder (The "Card") */}
        <button
          type="button"
          onClick={() => setIsRevealed((prev) => !prev)}
          aria-label={isRevealed ? 'Hide bio image' : 'Reveal bio image'}
          aria-pressed={isRevealed}
          data-revealed={isRevealed}
          className={cn(
            'group relative aspect-square cursor-pointer overflow-hidden rounded-sm border border-transparent bg-transparent p-1 text-left transition-all hover:border-primary/50 focus-visible:border-primary/50 focus-visible:outline-none data-[revealed=true]:border-primary/50',
            !imageRight && 'md:order-1',
          )}
        >
          {/* Placeholder Background */}
          <VideoBackground
            src="/vids/glitch-vid-02.mp4"
            opacity={0.15}
            blendMode="screen"
          />
          <Image
            src={image}
            alt="Bio Image"
            width={500}
            height={500}
            className={cn(
              'h-full w-full object-cover saturate-0 transition-all',
              'opacity-0 group-hover:animate-pulse group-hover:opacity-50 group-hover:saturate-100',
              isRevealed &&
                'glitch-text-2 animate-pulse opacity-100 saturate-100',
            )}
          />
          <div
            className={cn(
              'pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-500 group-hover:opacity-0',
              isRevealed && 'opacity-0',
            )}
          >
            <div className="rounded-full bg-primary p-6 shadow-[0_0_30px_rgba(0,255,0,0.4)]">
              {icon}
            </div>
          </div>

          {/* Scanlines */}
          <div className="scanlines pointer-events-none absolute inset-0 opacity-100 mix-blend-screen" />

          {/* Data Overlay */}
          <div className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-center justify-between gap-2 bg-linear-to-t from-black to-transparent p-4">
            <div className="font-mono text-[10px] tracking-widest text-foreground/50 uppercase">
              {isRevealed ? '// ACCESS_GRANTED' : '// TAP_TO_DECRYPT'}
            </div>
            <div
              className={cn(
                'size-1.5 rounded-full transition-colors',
                isRevealed
                  ? 'animate-pulse bg-primary shadow-[0_0_8px_hsl(var(--primary))]'
                  : 'bg-foreground/30',
              )}
            />
          </div>

          {/* Corner Cuts */}
          <div className="pointer-events-none absolute top-2 left-2 h-4 w-4 rounded-tl border-t border-l border-primary/50" />
          <div className="pointer-events-none absolute right-2 bottom-2 h-4 w-4 rounded-br border-r border-b border-primary/50" />
        </button>
      </div>
    </section>
  )
}
