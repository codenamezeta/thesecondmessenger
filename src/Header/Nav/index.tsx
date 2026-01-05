'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { SearchIcon, Menu, X, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import { SearchModal } from './SearchModal' // Ensure this file exists in the same folder

import type { Header as HeaderType } from '@/payload-types'
import { cn } from '@/utilities/ui'

export const Nav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const [navOpen, setNavOpen] = useState(false)
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)

  // Dropdown Logic (Desktop)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pathname = usePathname()

  // CMS Items (These come from the Admin Panel)
  const navItems = data?.navItems || []

  // Scroll Lock
  useEffect(() => {
    document.body.style.overflow = navOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [navOpen])

  // Close everything on route change
  useEffect(() => {
    setNavOpen(false)
    setMobileActiveIndex(null)
    setActiveDropdown(null)
    setIsSearchOpen(false)
  }, [pathname])

  // --- THE LOGIC TO PUSH THE NAV DOWN ---
  useEffect(() => {
    const heightValue: number = 100 / 12 // 1/12th of the screen height is my magic number. :)
    document.documentElement.style.setProperty('--main-nav-bar-height', `${heightValue}vh`)
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
  const NavLogo = () => (
    <>
      {!logoError ? (
        <div className="relative w-40 h-9">
          <Image
            src="/imgs/logos/white.png"
            alt="The 2nd Messenger Logo"
            sizes="(max-width: 768px) 100vw, 160px"
            fill
            className="object-contain object-left group-hover:opacity-80 transition-opacity"
            onError={() => setLogoError(true)}
            priority
          />
        </div>
      ) : (
        <div className="text-xl font-heading font-bold tracking-widest text-white group-hover:text-primary transition-colors leading-tight">
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
      <nav className="fixed flex w-full h-[var(--main-nav-bar-height)] top-[var(--admin-bar-height,0px)] z-40 bg-main/85 backdrop-blur-3xl border-b border-body/20">
        <div className="container flex justify-between">
          {/* Logo */}
          <Link href="/" className="group flex flex-col justify-center z-40">
            <NavLogo />
          </Link>

          {/* Desktop Links */}
          <ul className="portrait-hidden list-none flex items-center gap-8 font-heading text-sm uppercase tracking-widest relative z-40">
            {/* 1. Render CMS Items */}
            {navItems.map((item, i) => {
              // Cast to any to handle new fields before types are regenerated
              const type = (item as any).type || 'link'
              const isDropdown = type === 'dropdown'
              const isOpen = activeDropdown === i

              if (isDropdown) {
                const dropdownLabel = (item as any).dropdownLabel
                const dropdownItems = (item as any).dropdownItems || []

                return (
                  <li
                    key={i}
                    className="relative group h-[var(--totalNavBarHeight),80px] flex items-center"
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="relative h-full flex items-center cursor-pointer">
                      <button
                        className={`flex items-center gap-1 transition-colors ${isOpen ? 'text-primary' : 'text-muted hover:text-primary'}`}
                      >
                        {dropdownLabel}
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {/* Dropdown Panel */}
                      <div
                        className={`
                      absolute top-full right-0 w-56 pt-4 transition-all duration-300 ease-out 
                      before:absolute before:-top-4 before:left-0 before:w-full before:h-4 before:bg-transparent
                      ${isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}
                  `}
                      >
                        <div className="bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden p-2 relative">
                          <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-primary/50"></div>
                          <div className="flex flex-col gap-1 relative z-40">
                            {dropdownItems.map((subItem: any, j: number) => (
                              <CMSLink
                                key={j}
                                {...subItem.link}
                                appearance="noStyle"
                                className="px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-between group/sub"
                              />
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
                <li key={i} className="relative group h-20 flex items-center">
                  <CMSLink
                    {...item.link}
                    appearance="noStyle"
                    className="relative py-2 hover:text-primary transition-colors flex items-center gap-2 text-muted"
                  />
                </li>
              )
            })}

            {/* Search Trigger */}
            <li>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-muted hover:text-primary transition-colors p-2"
                aria-label="Search Site"
              >
                <SearchIcon size={20} />
              </button>
            </li>
          </ul>

          {/* Mobile Trigger */}
          <button
            onClick={() => setNavOpen(true)}
            className="landscape-hidden text-white hover:text-primary pl-2"
          >
            <Menu size={40} />
          </button>
        </div>
      </nav>

      {/* The Search Modal Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* --- MOBILE SIDE SHEET --- */}
      <div
        className={cn(
          'fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity duration-300',
          navOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setNavOpen(false)}
      />

      <aside
        className={cn(
          'fixed top-[var(--admin-bar-height,0px)] right-0 h-full w-[85vw] max-w-sm bg-surface border-l border-primary/75 z-50 transform transition-transform duration-300 ease-out shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col',
          navOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="p-6 flex justify-between items-center border-b border-white/10">
          <Link href="/" onClick={() => setNavOpen(false)} className="group">
            <NavLogo />
          </Link>
          <button onClick={() => setNavOpen(false)} className="text-muted hover:text-white">
            <X size={28} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-6" aria-label="Mobile">
          <ul className="flex flex-col gap-6">
            {/* 1. Mobile CMS Items */}
            {navItems.map((item, i) => {
              const type = (item as any).type || 'link'
              const isDropdown = type === 'dropdown'
              const isOpen = mobileActiveIndex === i

              if (isDropdown) {
                const dropdownLabel = (item as any).dropdownLabel
                const dropdownItems = (item as any).dropdownItems || []

                return (
                  <li key={i}>
                    <div>
                      <button
                        onClick={() => setMobileActiveIndex(isOpen ? null : i)}
                        className="flex items-center justify-between w-full text-2xl font-heading uppercase text-white hover:text-primary transition-colors"
                      >
                        {dropdownLabel}
                        <ChevronDown
                          size={24}
                          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                      <div
                        className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr] mt-4' : 'grid-rows-[0fr]'}`}
                      >
                        <div className="overflow-hidden">
                          <ul className="border-l-2 border-primary/20 pl-4 space-y-4 mb-2">
                            {dropdownItems.map((subItem: any, j: number) => (
                              <li key={j}>
                                <CMSLink
                                  {...subItem.link}
                                  appearance="noStyle"
                                  className="flex items-center gap-2 text-lg text-gray-400 hover:text-primary uppercase font-heading tracking-wide"
                                  onClick={() => setNavOpen(false)}
                                />
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
                  <CMSLink
                    {...item.link}
                    appearance="noStyle"
                    className="block text-2xl font-heading uppercase text-white hover:text-primary transition-colors"
                  />
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-white/10 text-center">
          <div className="text-xs font-mono text-gray-600">SECURE CONNECTION ESTABLISHED</div>
        </div>
      </aside>
    </>
  )
}
