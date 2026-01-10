'use client'

import React, { useState, useEffect } from 'react'
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
  ScanFace, // New icon for the "ID Photo"
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
    <div className="min-h-screen pb-20 relative">
      {/* --- HERO SECTION (NEW) --- */}
      <section className="relative h-[60vh] min-h-[500px] flex items-end pb-20 border-b border-white/10 mb-20 bg-black overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-10" />

        {/* Placeholder for Hero Image (The "Face" of the file) */}
        <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-30 md:opacity-50">
          {/* Replace this div with an <Image /> when you have a photo */}
          <div className="w-full h-full bg-gradient-to-l from-surface/20 to-transparent flex items-center justify-center">
            <ScanFace size={200} className="text-white/10 animate-pulse" />
          </div>
        </div>

        <div className="container relative z-20">
          <div className="max-w-4xl">
            {/* Identification Header */}
            <div className="flex items-center gap-3 mb-4 opacity-70">
              <div className="px-2 py-0.5 border border-primary text-primary text-[10px] font-mono uppercase tracking-widest bg-primary/10">
                Class: Architect
              </div>
              <div className="px-2 py-0.5 border border-white/20 text-white/50 text-[10px] font-mono uppercase tracking-widest">
                Clearance: Level 5
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-heading text-white uppercase tracking-widest leading-none mb-6">
              <span className="block text-primary/80 text-2xl md:text-4xl mb-2 tracking-[0.5em]">
                Identity:
              </span>
              The Second
              <br />
              Messenger
            </h1>

            <p className="text-xl text-muted font-mono max-w-2xl border-l-2 border-primary pl-6">
              "I didn't write these songs to become famous. I wrote them because I wanted to leave a
              signal behind."
            </p>

            {/* Decorative Data Grid */}
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/10 pt-6">
              <div>
                <div className="text-[10px] text-muted uppercase tracking-widest mb-1">
                  Civilian Name
                </div>
                <div className="text-white font-bold">Michael Zeta</div>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Origin</div>
                <div className="text-white font-bold">Earth / California</div>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase tracking-widest mb-1">
                  Specialty
                </div>
                <div className="text-white font-bold">Audio Synthesis</div>
              </div>
              <div>
                <div className="text-[10px] text-muted uppercase tracking-widest mb-1">Status</div>
                <div className="flex items-center gap-2 text-primary font-bold">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
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
          <div className="bg-surface/5 border border-white/10 rounded-lg p-6 h-full flex flex-col backdrop-blur-sm">
            <h3 className="text-xs font-bold text-muted uppercase tracking-widest mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
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
                      ? 'bg-primary text-black font-bold shadow-[0_0_15px_rgba(0,255,0,0.3)]'
                      : 'text-muted hover:text-white hover:bg-white/5',
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
          <div className="absolute left-4 lg:left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

          {/* INTRO */}
          <section id="intro" className="relative pl-12 lg:pl-16">
            <div className="absolute left-4 lg:left-0 top-0 w-2 h-2 bg-primary rounded-full -translate-x-[3px]" />

            <h2 className="text-4xl md:text-5xl font-heading text-white uppercase tracking-widest mb-6 glitch-text">
              00: Prologue
            </h2>

            <div className="p-8 bg-surface/5 border-l-2 border-primary rounded-r-lg relative overflow-hidden group">
              <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-10 pointer-events-none" />
              <FileText className="absolute top-4 right-4 text-white/5 w-24 h-24 rotate-12" />

              <p className="font-heading text-xl md:text-2xl text-white/90 leading-relaxed italic relative z-10">
                "I’ve always believed that a great song is a great song, regardless of the icing you
                put on top. If the melody and the chords are honest, the song will live forever."
              </p>
            </div>
          </section>

          {/* CHAPTER I */}
          <BioChapter
            id="ch1"
            title="Chapter I: The Ten-Year-Old on the Bass"
            meta="DATE: 1999 // LOC: DAD'S CAR // SUB: ORIGIN"
            icon={<Radio className="text-black w-12 h-12" />}
          >
            <p>
              It started with a terrifying proposition in the passenger seat of my dad’s car. I was
              nine years old. Green Day’s "Brain Stew" came on the radio, and my father—a man whose
              life has been a symphony of performance and teaching—turned to me with a wild idea. He
              was turning forty, throwing a massive backyard party with his band, and he wanted me
              to sit in on the bass.
            </p>
            <p>
              At that age, I looked at radio music as some kind of unattainable magic, a craft far
              too complex for "little ol' me." But my dad saw something I didn't. I practiced that
              simple, descending riff until my fingers knew it by heart. Standing on that stage just
              a few days after my tenth birthday, I felt the vibration of the amplifiers and the
              energy of the crowd for the first time. I didn't know it then, but my life had just
              found its rhythm.
            </p>
          </BioChapter>

          {/* CHAPTER II */}
          <BioChapter
            id="ch2"
            title="Chapter II: The Logic of the Six-String"
            meta="SUB: DISCOVERY // ASSET: ACOUSTIC GUITAR"
            icon={<Guitar className="text-black w-12 h-12" />}
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
              of my jeans until my leg was sore.
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
            title="Chapter III: The Family Business"
            meta="LOC: WEST COAST ROCK SCHOOL // ASSET: M-AUDIO INTERFACE"
            icon={<Mic2 className="text-black w-12 h-12" />}
          >
            <p>
              I grew up in the halls of West Coast Rock School, the music academy my father founded
              when I was fourteen. While other kids had traditional after-school jobs, I spent my
              free time surrounded by instruments, mentors, and the hum of amplifiers. It was here
              that I learned the "family trade."
            </p>
            <p>
              In those early years, my dad bought us one of the first home recording setups
              available—an M-Audio FireWire interface running into GarageBand. I quickly realized
              that a Digital Audio Workstation (DAW) wasn't just a tool; it was an instrument in
              itself. By thirteen, I was building fully-fledged songs. They might have sounded
              rough, but the core was there.
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
            title='Chapter IV: The \"Mike of All Trades\"'
            meta="PHILOSOPHY: DIY // ROLE: PRODUCER"
            icon={<Cpu className="text-black w-12 h-12" />}
            imageRight={false}
          >
            <p>
              To those of you listening to these songs years from now: know that The Second
              Messenger was built by hand. My wife gave me the nickname "Mike of all trades" because
              I couldn't seem to stay in one lane. I’m the guy on the sofa writing the lyrics; I’m
              the guy at the desk tracking, editing, mixing, and mastering every note.
            </p>
            <div className="my-6 p-4 bg-black/40 border border-white/10 rounded-lg text-sm font-mono">
              <strong className="text-primary block mb-2 uppercase tracking-widest">
                // Sonic Profile
              </strong>
              <ul className="space-y-2 text-muted">
                <li>
                  <span className="text-white">Songwriting:</span> Vocal Power Pop & Beatles-esque
                  harmony.
                </li>
                <li>
                  <span className="text-white">Energy:</span> High-voltage Pop-Punk (Blink-182,
                  Green Day).
                </li>
                <li>
                  <span className="text-white">Sound:</span> 90s Analog Warmth & Saturation.
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
            title="Chapter V: The Intellectual Heart"
            meta="THEME: COSMOS // RELIGION: SCIENCE"
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
            <div className="absolute left-4 lg:left-0 top-12 w-2 h-2 bg-primary rounded-full -translate-x-[3px]" />

            <div className="bg-primary/5 border border-primary/30 p-8 rounded-lg">
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={20} className="text-primary" />
                <h2 className="text-xl font-heading text-white uppercase tracking-wider">
                  Encrypted Message: To My Descendants
                </h2>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 font-mono text-sm">
                "If you ever feel like you're struggling to find your path, remember that it’s okay
                to be a 'jack of all trades.' Don't be afraid to learn the logic behind the magic.
                Whether you’re writing a song, building a business, or studying the stars, do it
                with everything you’ve got."
              </p>
              <div className="flex items-center justify-end gap-2 text-xs font-mono text-muted uppercase tracking-widest">
                <span>Transmission Ends</span>
                <div className="w-2 h-4 bg-primary animate-pulse" />
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

// --- REUSABLE CHAPTER COMPONENT ---
interface BioChapterProps {
  id: string
  title: string
  meta: string
  children: React.ReactNode
  icon: React.ReactNode
  imageRight?: boolean
}

const BioChapter = ({ id, title, meta, children, icon, imageRight = true }: BioChapterProps) => {
  return (
    <section id={id} className="relative pl-12 lg:pl-16 scroll-mt-32">
      {/* Timeline Node */}
      <div className="absolute left-4 lg:left-0 top-0 w-2 h-2 bg-white/20 rounded-full -translate-x-[3px]" />

      <div className="mb-2 flex items-center gap-3">
        <span className="text-[10px] font-mono text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
          {meta}
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-heading text-white uppercase tracking-wider mb-8">
        {title}
      </h2>

      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 gap-8 items-center',
          !imageRight && 'md:flex-row-reverse',
        )}
      >
        {/* Text Content */}
        <div
          className={cn(
            'space-y-4 text-gray-400 leading-relaxed text-sm md:text-base',
            !imageRight && 'md:order-2',
          )}
        >
          {children}
        </div>

        {/* Visual Placeholder (The "Card") */}
        <div
          className={cn(
            'relative aspect-square md:aspect-video bg-black border border-white/10 rounded-xl overflow-hidden group hover:border-primary/50 transition-all',
            !imageRight && 'md:order-1',
          )}
        >
          {/* Placeholder Background */}
          <div className="absolute inset-0 bg-surface/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-500">
            <div className="p-6 bg-primary rounded-full shadow-[0_0_30px_rgba(0,255,0,0.4)] group-hover:scale-110 transition-transform duration-500">
              {icon}
            </div>
          </div>

          {/* Scanlines */}
          <div className="absolute inset-0 bg-[url('/scanlines.png')] opacity-20 pointer-events-none mix-blend-overlay" />

          {/* Data Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
              // IMAGE_DATA_MISSING
            </div>
          </div>

          {/* Corner Cuts */}
          <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-white/30 rounded-tl" />
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-white/30 rounded-br" />
        </div>
      </div>
    </section>
  )
}
