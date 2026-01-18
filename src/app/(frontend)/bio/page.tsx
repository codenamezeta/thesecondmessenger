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
    <article className="min-h-screen pb-20 relative z-0 ">
      {/* <VideoBackground src="/vids/glitch-vid-01.mp4" fixed opacity={0.02} blendMode="screen" /> */}
      {/* --- HERO SECTION (NEW) --- */}
      <section className="relative isolate h-[60vh] min-h-[500px] flex items-end pb-20 border-b border-border mb-20 bg-transparent overflow-hidden">
        <div className="absolute bottom-0 right-0 xl:right-[10vw] top-12 opacity-50 md:opacity-100 z-10">
          <Image
            src="/imgs/michael/profile-01.png"
            className="size-full object-cover"
            alt="profile"
            width={786}
            height={786}
            priority
          />
        </div>

        {/* Background Elements */}
        <VideoBackground src="/vids/glitch-vid-01.mp4" opacity={0.75} blendMode="screen" />
        <div className="absolute inset-0 bg-[url('/imgs/scanlines.png')] opacity-10 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-tr from-black to-transparent" />

        <div className="container relative z-20">
          <div className="max-w-4xl">
            {/* Identification Header */}
            <div className="flex items-center gap-3 mb-4 opacity-70">
              <div className="px-2 py-0.5 border border-primary text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/10">
                Class: Architect
              </div>
              <div className="px-2 py-0.5 border border-border/50 text-foreground text-[10px] font-mono uppercase tracking-widest">
                Clearance: Level 5
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-heading text-foreground uppercase tracking-widest leading-none mb-6">
              <span className="block text-primary/80 text-2xl md:text-4xl mb-2 tracking-[0.5em]">
                Identity:
              </span>
              The Second
              <br />
              Messenger
            </h1>

            <blockquote className="text-xl text-foreground/50 font-mono max-w-2xl border-l-2 border-primary pl-6">
              "I didn't write these songs to become famous. I wrote them because I wanted to leave a
              legacy behind."
            </blockquote>

            {/* Decorative Data Grid */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-border/50 pt-6">
              <div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">
                  Civilian Name
                </div>
                <div className="text-foreground/80 font-bold">Michael Zeta</div>
              </div>
              <div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">
                  Origin
                </div>
                <div className="text-foreground/80 font-bold">Earth &gt; California</div>
              </div>
              <div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">
                  Specialty
                </div>
                <div className="text-foreground/80 font-bold">Audio Synthesis</div>
              </div>
              <div>
                <div className="text-[10px] text-foreground/50 uppercase tracking-widest mb-1">
                  Status
                </div>
                <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                  <div className="size-2 bg-primary rounded-full" />
                  Transmitting
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
        {/* --- LEFT SIDEBAR (The Directory) --- */}
        <aside className="hidden lg:block h-[calc(100vh-150px)] sticky top-28">
          <div className="bg-surface border border-border/50 rounded-lg p-6 h-full flex flex-col backdrop-blur-sm">
            <h3 className="text-xs font-bold text-foreground/50 uppercase tracking-widest mb-6 border-b border-border/50 pb-4 flex items-center gap-2">
              <Fingerprint size={14} /> Personnel File
            </h3>
            <nav className="space-y-1 flex-1">
              {CHAPTERS.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => scrollTo(chapter.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 rounded text-xs font-mono uppercase tracking-wider transition-all text-left',
                    activeSection === chapter.id
                      ? 'bg-primary text-primary-foreground font-bold shadow-[0_0_15px_hsl(var(--primary)/0.85)]'
                      : 'text-foreground/50 hover:text-foreground hover:bg-card/50 hover:shadow-[0_0_15px_hsl(var(--primary)/0.25)]',
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
        <main className="space-y-24 relative">
          {/* BACKGROUND DECORATION: The Timeline Spine */}
          <div className="absolute left-4 lg:left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* INTRO */}
          <section id="intro" className="relative pl-12 lg:pl-16">
            <div className="absolute left-4 lg:left-0 top-0 w-2 h-2 bg-primary rounded-full -translate-x-[3px]" />

            <h2 className="text-4xl md:text-5xl font-heading text-foreground uppercase tracking-widest mb-6 glitch-text">
              000: Prologue
            </h2>

            <div className="p-8 bg-surface/5 border-l-2 border-primary rounded-r-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/imgs/scanlines.png')] opacity-10 pointer-events-none" />
              <FileText className="absolute top-4 right-4 text-foreground/5 w-24 h-24 rotate-12" />

              <blockquote className="font-heading text-xl md:text-2xl text-foreground/90 leading-relaxed italic relative z-10">
                "I’ve always believed that a great song is a great song, regardless of the icing you
                put on top. If the melody and the chords are honest, the song will live forever."
              </blockquote>
            </div>
          </section>

          {/* CHAPTER I */}
          <BioChapter
            id="ch1"
            title="001: The Spark"
            meta="DATE: 1999 // LOC: DAD'S CAR // SUB: ORIGIN"
            image="/imgs/michael/young-mikey-01.jpg"
            icon={<Radio className="text-primary-foreground size-12" />}
          >
            <p>
              It started with a terrifying proposition in the passenger seat of my dad’s car. I had
              just turned ten years old when Green Day’s "Brain Stew" comes on the radio. My father
              - a lifelong professional musician - turns to me with an idea that changed the
              directory of my life forever. He was turning forty and celebrating by throwing a
              backyard party where his band would be performing, and he wanted me to sit in on the
              bass and play Brain Stew.
            </p>
            <p>
              At that age, I looked at radio music as some kind of unattainable magic, a craft far
              too complex for "little ol' me." But my dad saw something I didn't. I practiced that
              simple, descending riff until my fingers knew it by heart. Standing on that stage just
              a few days later, I felt the vibration of the amplifiers and the energy of the crowd
              for the first time. I didn't know it then, but my life had just found its rhythm.
            </p>
          </BioChapter>

          {/* CHAPTER II */}
          <BioChapter
            id="ch2"
            title="002: The Logic of the Six-String"
            meta="SUB: DISCOVERY // ASSET: ACOUSTIC GUITAR"
            image="/imgs/michael/michael-01.jpg"
            icon={<Guitar className="text-primary-foreground size-12" />}
            imageRight={false}
          >
            <p>
              I played the bass for a few months after that, but I’ll be honest: I was getting
              bored. I was playing simplified parts that didn't quite make sense to me. I needed
              patterns, logic, and a way to experiment that didn't just feel like randomness. I
              needed to see the whole picture.
            </p>
            <p>
              To keep me from walking away, my dad handed me an acoustic guitar and showed me the
              opening to "Good Riddance (Time of Your Life)." I remember carrying guitar picks to
              school and obsessively practicing the down-down-up-up-down-up pattern against the seam
              of my jeans until the stitching started to fray.
            </p>
            <p>
              Then, the "a-ha" moment happened. The moment I understood how multiple notes combined
              to make chords, the polyphonic nature of the guitar ignited something in me. Suddenly,
              music seemed obvious. I could see how the vocals sat on top of the chords, how the
              bass locked in, and where the harmonies belonged. Something in my brain was built to
              manipulate music. I never set the guitar down again.
            </p>
          </BioChapter>

          {/* CHAPTER III */}
          <BioChapter
            id="ch3"
            title="003: The Academy"
            meta="LOC: WEST COAST ROCK SCHOOL // ASSET: M-AUDIO INTERFACE"
            image="/imgs/michael/young-mikey-02.jpg"
            icon={<Mic2 className="text-primary-foreground size-12" />}
          >
            <p>
              I grew up in the halls of West Coast Rock School, the music academy my father founded
              when I was fourteen. While other kids had traditional after-school jobs, I spent my
              free time surrounded by instruments, mentors, and the hum of amplifiers. It was here
              that I learned the "family trade."
            </p>
            <p>
              In those early years, my dad bought us one of the first home recording setups
              available - an M-Audio FireWire interface running into GarageBand. I quickly realized
              that a Digital Audio Workstation (DAW) wasn't just a tool - it was an instrument in
              and of itself. By thirteen, I was building fully-fledged songs. They might have
              sounded rough, but the core was there.
            </p>
            <p>
              Over the next twelve years, I became a teacher at that school. I learned thousands of
              songs, produced dozens of records, and taught hundreds of students. I saw how music
              could change a person’s life, just as it had changed mine.
            </p>
          </BioChapter>

          {/* CHAPTER IV */}
          <BioChapter
            id="ch4"
            title='004: The "Mike of All Trades"'
            meta="PHILOSOPHY: DIY // ROLE: PRODUCER"
            image="/imgs/michael/michael-today.jpg"
            icon={<Cpu className="text-primary-foreground size-12" />}
            imageRight={false}
          >
            <p>
              To those of you listening to these songs years from now, know that The Second
              Messenger was built by hand. Every note, every beat, every mix, and every master. No
              AI either. My wife gave me the nickname "Mike of all trades" because I couldn't seem
              to stay in one lane. I’m the guy on the sofa writing the lyrics - I’m the guy at the
              desk tracking, editing, mixing, and mastering every note.
            </p>
            <div className="my-6 p-4 bg-muted/50 border border-border/50 rounded-lg text-sm font-mono">
              <strong className="text-primary block mb-2 uppercase tracking-widest">
                // Sonic Profile
              </strong>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <span className="text-foreground/80">Songwriting:</span> Vocal Power Pop &
                  Beatles-esque harmony.
                </li>
                <li>
                  <span className="text-foreground/80">Energy:</span> High-voltage Pop-Punk
                  (Blink-182, Green Day).
                </li>
                <li>
                  <span className="text-foreground/80">Sound:</span> 90s Analog Warmth & Saturation.
                </li>
              </ul>
            </div>
            <p>
              I never wanted to be stuck in a box. I wanted to write the "Helter Skelter" rock
              anthems and the "Yesterday" introspective ballads. I want you to hear the variety and
              know that I wasn't just following a trend—I was following the song.
            </p>
          </BioChapter>

          {/* CHAPTER V */}
          <BioChapter
            id="ch5"
            title="005: The Intellectual Heart"
            meta="THEME: COSMOS // RELIGION: SCIENCE"
            image="/imgs/michael/profile-01.png"
            icon={<Globe className="text-black w-12 h-12" />}
          >
            <p>
              I consider myself an intellectual, and science is, in many ways, my religion. I’ve
              always been drawn to the stars and the logic of the universe. That’s why you’ll hear
              sci-fi themes and scientific metaphors woven into my lyrics. Like Train’s "Drops of
              Jupiter" or The Beatles' "Across the Universe," I try to use the language of the
              cosmos to explain the mysteries of the heart.
            </p>
            <p>
              I didn't write these songs to become famous or to make a fortune. I wrote them because
              I wanted to leave a signal behind. I wanted to create a repertoire of music that would
              stand the test of time—something you could listen to and feel like you know me, even
              if we’ve never met.
            </p>
          </BioChapter>

          {/* OUTRO */}
          <section id="outro" className="relative pl-12 lg:pl-16 pt-12">
            <div className="absolute left-4 lg:left-0 top-12 size-2 bg-primary rounded-full -translate-x-[3px]" />

            <div className="bg-primary/10 border border-primary/30 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={20} className="text-primary" />
                <h2 className="text-xl font-heading text-foreground uppercase tracking-wider">
                  Encrypted Message: To My Descendants
                </h2>
              </div>
              <p className="text-foreground/75 leading-relaxed mb-6 font-mono text-sm">
                "If you ever feel like you're struggling to find your path, remember that it’s okay
                to be a 'jack of all trades.' Don't be afraid to learn the logic behind the magic.
                Whether you’re writing a song, building a business, or studying the stars, do it
                with everything you’ve got."
              </p>
              <div className="flex items-center justify-end gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest animate-pulse">
                <span>...Transmission End</span>
                <div className="w-2 h-4 bg-primary" />
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
  return (
    <section id={id} className="relative pl-12 lg:pl-16 scroll-mt-32 group">
      {/* Timeline Node */}
      <div className="absolute left-4 lg:left-0 top-0 w-2 h-2 bg-secondary rounded-full -translate-x-[3px]" />

      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-8',
          !imageRight && 'md:flex-row-reverse',
        )}
      >
        {/* Text Content */}
        <div
          className={cn(
            'space-y-4 text-foreground/75 leading-relaxed text-sm md:text-base',
            !imageRight && 'md:order-2',
          )}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              {meta}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-heading text-foreground uppercase tracking-wider mb-2">
            {title}
          </h2>
          {children}
        </div>

        {/* Visual Placeholder (The "Card") */}
        <div
          className={cn(
            'relative aspect-square p-1 bg-transparent rounded-sm overflow-hidden group hover:border-primary/50 transition-all',
            !imageRight && 'md:order-1',
          )}
        >
          {/* Placeholder Background */}
          <VideoBackground src="/vids/glitch-vid-02.mp4" opacity={0.15} blendMode="screen" />
          <img
            src={image}
            alt="Image"
            className="w-full h-full object-cover opacity-5 saturate-0 group-hover:saturate-100 group-hover:opacity-80 group-hover:animate-pulse transition-all"
          />
          <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-colors duration-500">
            <div className="p-6 bg-primary rounded-full shadow-[0_0_30px_rgba(0,255,0,0.4)] group-hover:opacity-0 transition-transform duration-500">
              {icon}
            </div>
          </div>

          {/* Scanlines */}
          {/* <div className="absolute inset-0 scanlines opacity-100 group-hover:opacity-100 pointer-events-none mix-blend-screen" /> */}

          {/* Data Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="text-[10px] font-mono text-foreground/50 uppercase tracking-widest">
              // IMAGE_DATA_MISSING
            </div>
          </div>

          {/* Corner Cuts */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-border/50 rounded-tl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-border/50 rounded-br" />
        </div>
      </div>
    </section>
  )
}
