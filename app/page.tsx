import Theater from './components/Theater'
import Nav from './components/Nav'
import Button from './components/Buttons'
import FeaturedSong from './components/FeaturedSong'
import SubscribeFormMC from './components/SubscribeFormMC'
import Link from 'next/link'
import NewsTeaser from './components/NewsTeaser'
import Footer from './components/Footer'
import { getLatestRelease } from '@/lib/firebase'

// export const revalidate = 0 // revalidate this page every 60 seconds

export default async function Home() {
  const latestRelease = await getLatestRelease()
  return (
    <>
      <Theater
        youTubePlaylistId='PLFhi_wBjERLqYiJSbS0jOKhcjnfT1EuE1' //- Hard coded to the discography playlist.
      />
      <Nav />

      <main
        className='container'
        id='intro'
        style={{ marginTop: 'var(--spacer-4)' }}
      >
        <h1>The Second Messenger</h1>
        <p>
          We are The Second Messenger, a team of DIY music producers,
          songwriters, and recording artists united by our quest to create a
          legacy of high-quality music. Unfettered by record labels or
          geographical limitations, we leverage the connective power of the
          internet to build direct relationships with our worldwide audience.
          Our quest has only just begun, but we&apos;re beyond excited for
          what&apos;s ahead. We hope you will join us because we like to think
          The Second Messenger always delivers.
        </p>
        <Button to='/bio' text='Learn More' outline />
        <Button to='/bio' text='Become A Fan' />
      </main>
      <FeaturedSong
        song={latestRelease}
        sectionHeading='Our Newest Release'
        titleAsH1={false}
      />

      <SubscribeFormMC />

      <section id='explore'>
        <Link href='/music' className='explore-column' id='column_1'>
          <h4>Music</h4>
        </Link>
        <Link href='/bio' className='explore-column' id='column_2'>
          <h4>Bio</h4>
        </Link>
        <Link href='/merch' className='explore-column' id='column_3'>
          <h4>Merch</h4>
        </Link>
        <Link href='/news' className='explore-column' id='column_4'>
          <h4>News</h4>
        </Link>
      </section>

      {/* <NewsTeaser posts={posts} sectionTitle={'Latest Posts'} /> */}

      <Footer />
    </>
  )
}
