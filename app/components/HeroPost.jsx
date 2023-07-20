import Avatar from './Avatar'
import Date from './Date'
import CoverImage from './CoverImage'
import Link from 'next/link'

export default function HeroPost({
  title,
  coverImage,
  date,
  excerpt,
  author,
  slug,
}) {
  return (
    <article>
      <CoverImage
        slug={slug}
        imageObject={coverImage}
        title={title}
        url={coverImage}
      />
      <h3>
        <Link as={`/news/${slug}`} href='/news/[slug]'>
          {title}
        </Link>
      </h3>
      <Date dateString={date} />
      <summary>{excerpt}</summary>
      <Avatar name={author?.name} picture={author?.picture} />
    </article>
  )
}
