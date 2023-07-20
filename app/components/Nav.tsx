'use client'

import { useState } from 'react'
import useScrollBlock from '../hooks/useScrollBlock'
import Link from 'next/link'
import { RiMenu2Fill, RiCloseFill } from 'react-icons/ri'
import Image from 'next/image'
import './Nav.scss'

export default function Nav() {
  const [blockScroll, allowScroll] = useScrollBlock()
  const [navOpen, setNavOpen] = useState(false)

  function openSideSheet(): void {
    blockScroll()
    setNavOpen(true)
  }
  function closeSideSheet(): void {
    allowScroll()
    setNavOpen(false)
  }

  return (
    <>
      <nav id='navbar'>
        <ul className='container'>
          <li id='navbar_brand'>
            <Link href='/'>
              <Image
                src='/imgs/logos/white.png'
                // layout='responsive'
                // objectFit
                height='64'
                width='179'
                alt='TSM logo'
              />
            </Link>
          </li>
          <li className='nav-item'>
            <Link href='/music' className='nav-link'>
              Music
            </Link>
          </li>
          <li className='nav-item'>
            <Link href='/videos' className='nav-link'>
              Videos
            </Link>
          </li>
          <li className='nav-item'>
            <Link href='/bio' className='nav-link'>
              Bio
            </Link>
          </li>
          <li className='nav-item'>
            <Link href='/news' className='nav-link'>
              News
            </Link>
          </li>
          <li className='nav-item'>
            <Link href='/merch' className='nav-link'>
              Merch
            </Link>
          </li>
          <li className='nav-item'>
            <a className='nav-link button button-cta' href='/'>
              More
            </a>
          </li>
          <li id='nav_open_item' onClick={openSideSheet}>
            <RiMenu2Fill />
          </li>
        </ul>
      </nav>
      {/* Click blocker expands when Side Sheet is open to prevent accidental clicks on the document body */}
      <div
        id='click_blocker'
        className={navOpen ? 'on' : 'off'}
        onClick={closeSideSheet}
      ></div>
      {/* <!-- Mobile Navigation --> */}
      <nav id='side_sheet' className={navOpen ? 'open' : 'closed'}>
        <ul>
          <li id='nav_close_item' className='nav-item' onClick={closeSideSheet}>
            <RiCloseFill />
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/' id='side_nav_brand'>
              The Second
              <br />
              Messenger
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/music' className='side-nav-link'>
              Music
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/videos' className='side-nav-link'>
              Videos
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/bio' className='side-nav-link'>
              Bio
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/news' className='side-nav-link'>
              News
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <Link href='/merch' className='side-nav-link'>
              Merch
            </Link>
          </li>
          <li className='nav-item' onClick={closeSideSheet}>
            <a href='/' className='side-nav-link'>
              More
            </a>
          </li>
          <li className='nav-item'>
            <a href='#!' className='side-nav-link'>
              <i className='fab fa-facebook'></i>
              <i className='fab fa-instagram'></i>
              <i className='fab fa-youtube'></i>
              <i className='fab fa-twitter'></i>
            </a>
          </li>
        </ul>
      </nav>
    </>
  )
}
