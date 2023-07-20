import Avatar from './Avatar'
// import SectionSeparator from '../components/section-separator'
import selectors from '../styles/YouTubeCommentsThread.module.scss'
import { useSession, signIn } from 'next-auth/react'

export default function YouTubeCommentsThread({ thread, videoId }) {
  // console.log(thread)
  const { data: session } = useSession()
  // const [statuses, setStatuses] = useState()
  const handleOnCommentSubmit = async (event) => {
    event.preventDefault()
    console.log(session)
    // console.log('Comment Value: ', event.target.comment.value)
    const res = await fetch('/api/YouTube/postAComment', {
      body: JSON.stringify({
        comment: event.target.comment.value,
        videoId: videoId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    })
    if (res.status != 200) {
      console.log(res)
    } else {
      console.log(res)
    }
  }

  return (
    <section className={selectors.comments}>
      <h2>Comments:</h2>
      <hr />
      <ul style={{ listStyle: 'none' }}>
        {thread.items?.map((comment) => (
          <li key={comment.snippet.topLevelComment.id}>
            <Avatar
              picture={
                comment.snippet.topLevelComment.snippet.authorProfileImageUrl
              }
              name={comment.snippet.topLevelComment.snippet.authorDisplayName}
              url={comment.snippet.topLevelComment.snippet.authorChannelUrl}
              date={comment.snippet.topLevelComment.snippet.updatedAt}
            />
            <p
              dangerouslySetInnerHTML={{
                __html: comment.snippet.topLevelComment.snippet.textDisplay,
              }}
            ></p>
            <hr />
          </li>
        ))}
        <li>
          {!session ? (
            <button onClick={() => signIn()} className='btn'>
              Sign In
            </button>
          ) : (
            <>
              <Avatar
                picture={session.user.image}
                name={session.user.name}
                url={session.user.email}
              />
              <form onSubmit={handleOnCommentSubmit}>
                <label htmlFor='comment'>Add your comment</label>
                <textarea
                  name='comment'
                  rows='1'
                  placeholder='Enter your comment here. Make it count.'
                  required
                ></textarea>
                <button className='btn' type='submit'>
                  Submit
                </button>
              </form>
            </>
          )}
        </li>
      </ul>
    </section>
  )
}
