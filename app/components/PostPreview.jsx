import Avatar from './Avatar'
import Date from './Date'
import CoverImage from './CoverImage'
import Button from './Buttons'
import Link from 'next/link'
import { imageBuilder } from '../lib/sanity'

export default function PostPreview({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  return (
    <article>
      <style jsx>{`
        article {
          margin-bottom: var(--spacer-3);
        }
      `}</style>
      <CoverImage
        slug={slug}
        title={title}
        imageObject={coverImage}
        url={imageBuilder(coverImage).url()}
      />
      <h3>
        <Link as={`/news/${slug}`} href='/news/[slug]'>
          {title}
        </Link>
      </h3>
      <Date dateString={date} />
      <summary>{excerpt}</summary>
      <Button
        text='Continue Reading...'
        to={`/news/${slug}`}
        size='small'
        customClass='newsTeaserButton'
      />
      {/* <Avatar name={author?.name} picture={author?.picture} /> */}
    </article>
  )
}
