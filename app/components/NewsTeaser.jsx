'use client'
import selectors from './NewsTeaser.module.scss'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'
import Link from 'next/link'
import Button from './Buttons'
import Image from 'next/image'

//* This component also requires the package 'prop-types' to function correctly.
//? https://www.npmjs.com/package/react-responsive-masonry
//? https://stackoverflow.com/questions/43357501/react-prop-types-error

export default function NewsTeaser({ posts, sectionTitle }) {
  return (
    <section className='container' id={selectors.news_teaser}>
      <h2>{sectionTitle ? sectionTitle : 'Latest Updates'}</h2>
      <hr />
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 400: 1, 800: 2, 1200: 3, 1600: 4 }}
      >
        <Masonry gutter='1em'>
          {posts.map((post) => (
            <article key={post.id}>
              <Link href={`/news/${post.slug}`}>
                <Image
                  src={post.cover_image_url}
                  alt="Post's Cover Image"
                  width={600}
                  height={600}
                />
              </Link>
              <div className='container'>
                <time dateTime={post.date}>{post.date}</time>
                <h3>
                  <Link href={`/news/${post.slug}`}>{post.title}</Link>
                </h3>
                <summary>{post.excerpt}</summary>
                <Button
                  text='Continue Reading...'
                  to={`/news/${post.slug}`}
                  size='small'
                  customClass='newsTeaserButton'
                />
              </div>
              {/* <Button text='Continue Reading' size='small' /> */}
            </article>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </section>
  )
}
