'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { AdminBar } from './AdminBar'
import { SearchIcon, Menu, X, ChevronDown } from 'lucide-react'
import { SearchModal } from './SearchModal' // Ensure this file exists in the same folder
import { cn } from '@/utilities/ui'

type NavLinkItem = {
  type: 'link'
  label: string
  href: string
}

type NavDropdownItem = {
  type: 'dropdown'
  label: string
  items: NavLinkItem[]
}

type NavItem = NavLinkItem | NavDropdownItem

const navItems: NavItem[] = [
  { type: 'link', label: 'Home', href: '/' },
  { type: 'link', label: 'Music', href: '/music' },
  { type: 'link', label: 'Videos', href: '/videos' },
  { type: 'link', label: 'Personal File', href: '/bio' },
  { type: 'link', label: "Admiral's Log", href: '/posts' },
  {
    type: 'dropdown',
    label: 'Members',
    items: [
      { type: 'link', label: 'Memberships', href: '/memberships' },
      { type: 'link', label: 'Login', href: '/login' },
    ],
  },
  // {
  //   type: 'dropdown',
  //   label: 'Dropdown',
  //   items: [
  //     { type: 'link', label: 'Item 1', href: '/item1' },
  //     { type: 'link', label: 'Item 2', href: '/item2' },
  //     { type: 'link', label: 'Item 3', href: '/item3' },
  //   ],
  // },
]

export const Nav: React.FC = () => {
  const [navOpen, setNavOpen] = useState(false)
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(
    null,
  )
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  // Dropdown Logic (Desktop)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pathname = usePathname()

  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  // Close everything on route change
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setNavOpen(false)
      setMobileActiveIndex(null)
      setActiveDropdown(null)
      setIsSearchOpen(false)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [pathname])

  // --- THE LOGIC TO PUSH THE NAV DOWN ---
  useEffect(() => {
    const heightValue: number = 100 / 16 // 1/16th of the screen height
    document.documentElement.style.setProperty(
      '--main-nav-bar-height',
      `${heightValue}vh`,
    )
  }, [])

  // Desktop Hover Handlers
  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200)
  }

  // --- REUSABLE LOGO COMPONENT ---
  const renderNavLogo = () => (
    <>
      {!logoError ? (
        <Image
          src="/imgs/logos/radio-dish-logo.png"
          alt="The 2nd Messenger Logo"
          sizes="(max-width: 768px) 100vw, 160px"
          width={200}
          height={50}
          className="object-contain opacity-85 transition-opacity group-hover:opacity-100"
          onError={() => setLogoError(true)}
          priority
        />
      ) : (
        <div className="h-12 w-40 font-heading text-xl leading-tight font-bold tracking-widest text-foreground transition-colors group-hover:text-primary">
          THE 2ND
          <br />
          MESSENGER
        </div>
      )}
    </>
  )

  return (
    <>
      {/* --- DESKTOP NAV --- */}
      <nav className="h-(calc(var(--admin-bar-height,0px)+var(--main-nav-bar-height,0px))) sticky top-0 z-40 flex w-full flex-col border-b border-border bg-transparent backdrop-blur-3xl">
        <AdminBar />
        <div className="container flex justify-between">
          {/* Logo */}
          <Link href="/" className="group z-40 flex flex-col justify-center">
            {renderNavLogo()}
          </Link>

          {/* Desktop Links */}
          <ul className="relative z-40 hidden list-none items-center gap-8 font-heading text-sm tracking-widest uppercase md:flex">
            {/* 1. Render CMS Items */}
            {navItems.map((item, i) => {
              const isDropdown = item.type === 'dropdown'
              const isOpen = activeDropdown === i

              if (isDropdown) {
                return (
                  <li
                    key={i}
                    className="group relative flex h-[var(--totalNavBarHeight),80px] items-center"
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="relative flex h-full cursor-pointer items-center">
                      <button
                        className={`flex items-center gap-1 uppercase transition-colors ${isOpen ? 'text-muted-foreground' : 'text-foreground/75 hover:text-accent'}`}
                      >
                        {item.label}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Dropdown Panel */}
                      <div
                        className={`absolute top-full right-0 w-56 pt-4 transition-all duration-300 ease-out before:absolute before:-top-4 before:left-0 before:h-4 before:w-full before:bg-transparent ${isOpen ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'} `}
                      >
                        <div className="relative overflow-hidden rounded-sm border border-border/10 bg-background/95 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl">
                          <div className="absolute top-0 right-0 h-4 w-4 border-t border-r border-primary/50"></div>
                          <div className="absolute bottom-0 left-0 h-4 w-4 border-b border-l border-primary/50"></div>
                          <div className="relative z-40 flex flex-col gap-1">
                            {item.items.map((subItem, j) => (
                              <Link
                                key={j}
                                href={subItem.href}
                                className="group/sub flex items-center justify-between px-4 py-3 text-sm text-foreground/75 transition-colors hover:bg-border/5 hover:text-accent"
                              >
                                {subItem.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              }

              // Standard Link
              return (
                <li key={i} className="group relative flex h-20 items-center">
                  <Link
                    href={item.href}
                    className="relative flex items-center gap-2 py-2 text-foreground/75 transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}

            {/* Search Trigger */}
            <li>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-foreground/50 transition-colors hover:text-primary"
                aria-label="Search Site"
              >
                <SearchIcon size={20} />
              </button>
            </li>
          </ul>

          {/* Mobile Trigger */}
          <button
            onClick={() => setNavOpen(true)}
            className="block pl-2 text-foreground transition-colors hover:text-primary md:hidden"
          >
            <Menu size={48} />
          </button>
        </div>
      </nav>

      {/* The Search Modal Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* --- MOBILE SIDE SHEET --- */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-sidebar/50 backdrop-blur-sm transition-opacity duration-300',
          navOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={() => setNavOpen(false)}
      />

      <aside
        className={cn(
          'fixed top-[var(--admin-bar-height,0px)] right-0 z-50 flex h-full w-[85vw] max-w-sm transform flex-col border-l border-sidebar-primary/50 bg-sidebar shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-out',
          navOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/20 p-6">
          <Link href="/" onClick={() => setNavOpen(false)} className="group">
            {renderNavLogo()}
          </Link>
          <button
            onClick={() => setNavOpen(false)}
            className="text-sidebar-foreground hover:text-sidebar-primary"
          >
            <X size={28} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile">
          <ul className="flex flex-col gap-6">
            {/* 1. Mobile CMS Items */}
            {navItems.map((item, i) => {
              const isDropdown = item.type === 'dropdown'
              const isOpen = mobileActiveIndex === i

              if (isDropdown) {
                return (
                  <li key={i}>
                    <div>
                      <button
                        onClick={() => setMobileActiveIndex(isOpen ? null : i)}
                        className="flex w-full items-center justify-between font-heading text-2xl text-sidebar-foreground uppercase transition-colors hover:text-secondary"
                      >
                        {item.label}
                        <ChevronDown
                          size={24}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'mt-4 grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                      >
                        <div className="overflow-hidden">
                          <ul className="mb-2 space-y-4 border-l-2 border-sidebar-primary pl-4">
                            {item.items.map((subItem, j) => (
                              <li key={j}>
                                <Link
                                  href={subItem.href}
                                  className="flex items-center gap-2 font-heading text-lg tracking-wide text-sidebar-foreground uppercase hover:text-primary"
                                  onClick={() => setNavOpen(false)}
                                >
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              }

              return (
                <li key={i}>
                  <Link
                    href={item.href}
                    className="block font-heading text-2xl text-sidebar-foreground uppercase transition-colors hover:text-primary"
                    onClick={() => setNavOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-muted p-6 text-center">
          <div className="font-mono text-xs text-muted-foreground/50">
            SECURE CONNECTION ESTABLISHED
          </div>
        </div>
      </aside>
    </>
  )
}
