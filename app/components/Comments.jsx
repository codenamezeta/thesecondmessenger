import React from 'react'
import { useState } from 'react'
import { YouTube } from 'youtube'

const CommentComponent = ({ videoId }) => {
  const [comments, setComments] = useState([])

  const fetchComments = async () => {
    const youtube = new YouTube()
    const response = await youtube.commentThreads.list({
      part: 'snippet,replies',
      videoId,
    })
    setComments(response.items)
  }

  useEffect(() => {
    fetchComments()
  }, [])

  return (
    <div>
      <h1>Comments</h1>
      {comments.map((comment) => (
        <div key={comment.id}>
          <img
            src={comment.authorDetails.profileImageUrl}
            alt={comment.authorDetails.displayName}
          />
          <p>{comment.snippet.textOriginal}</p>
          {comment.replies && (
            <ul>
              {comment.replies.map((reply) => (
                <li key={reply.id}>
                  <img
                    src={reply.authorDetails.profileImageUrl}
                    alt={reply.authorDetails.displayName}
                  />
                  <p>{reply.snippet.textOriginal}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}

export default CommentComponent
