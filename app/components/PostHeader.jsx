import Avatar from './Avatar'
import Date from './Date'
import CoverImage from './CoverImage'
// import PostTitle from './post-title'
// import { imageBuilder } from '../lib/sanity'
export default function PostHeader({ title, coverImage, date, author }) {
  return (
    <header>
      <CoverImage title={title} imageObject={coverImage} url={coverImage} />
      <h1>{title}</h1>
      <Date dateString={date} />
      <Avatar name={author?.name} picture={author?.picture} />
      {/* <hr /> */}
    </header>
  )
}
