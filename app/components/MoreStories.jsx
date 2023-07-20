import PostPreview from './PostPreview'

export default function MoreStories({ posts }) {
  return (
    <div className='more-stories'>
      <style jsx>{`
        .more-stories {
          display: flex;
          flex-direction: column;
        }
        h2 {
          margin-top: var(--spacer-2);
        }
        @media (min-width: 800px) {
          .more-stories {
            display: grid;
            grid-template-columns: 1fr 1fr;
            column-gap: var(--spacer-2);
          }
          h2,
          hr {
            grid-column: 1/-1;
          }
        }
        @media (min-width: 1200px) {
          .more-stories {
            grid-template-columns: 1fr 1fr 1fr;
          }
        }
      `}</style>
      <h2>More Stories</h2>
      <hr />
      {posts.map((post) => (
        <PostPreview
          key={post.slug}
          title={post.title}
          coverImage={post.coverImage}
          date={post.date}
          author={post.author}
          slug={post.slug}
          excerpt={post.excerpt}
        />
      ))}
    </div>
  )
}
