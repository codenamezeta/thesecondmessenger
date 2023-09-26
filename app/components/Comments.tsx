// import { getVideoComments } from '@/lib/youtube'
// import Image from 'next/image'
import Link from 'next/link'
import Avatar from '@/app/components/Avatar'
import selectors from '@/app/components/Comments.module.scss'
import Date from './Date'

export default async function Comments({
  comments,
  commentsEnabled,
  customClassName,
}: {
  comments: Array<any>
  commentsEnabled: boolean
  customClassName?: string
}) {
  // console.log('🚀 ~ file: Comments.jsx:8 ~ Comments ~ comments:', comments)
  // const comments = await getVideoComments(videoId)
  // console.log('🚀 comments[0]:', comments[0].snippet.topLevelComment.snippet)

  if (comments.length === 0 && commentsEnabled) {
    console.log('No comments yet:', comments)
    return (
      <section id={selectors['comments']} className={customClassName}>
        <h2>Comments</h2>
        <hr />
        <p>Be The First To Comment</p>
      </section>
    )
    //TODO: Add a form to add your own comment.
  } else if (!commentsEnabled) {
    console.log('Comments are disabled:', comments)
    return (
      <section id={selectors['comments']} className={customClassName}>
        <h2>Comments</h2>
        <hr />
        <p style={{ fontSize: '0.75em' }}>
          Unfortunately, YouTube doesn&apos;t allow comments on this type of
          post. 😕
        </p>
      </section>
    )
  }

  return (
    <section id={selectors['comments']} className={customClassName}>
      <h2>Comments</h2>
      <hr />
      {comments.map((comment) => (
        <div key={comment.id} className={selectors['comment']}>
          <Avatar
            imageSrc={
              comment.snippet.topLevelComment.snippet.authorProfileImageUrl
            }
            url={comment.snippet.topLevelComment.snippet.authorChannelUrl}
            anchorClass={selectors.avatar}
          />
          <Link
            href={comment.snippet.topLevelComment.snippet.authorChannelUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={selectors.displayName}
          >
            <h3>{comment.snippet.topLevelComment.snippet.authorDisplayName}</h3>
          </Link>
          <time>
            <Date
              dateString={comment.snippet.topLevelComment.snippet.updatedAt}
            />
          </time>
          <p>{comment.snippet.topLevelComment.snippet.textDisplay}</p>
        </div>
      ))}
    </section>
  )
}
