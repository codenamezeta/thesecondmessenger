import supabase from '../../../lib/supabase'
import { notFound } from 'next/navigation'
import Nav from '@/app/components/Nav'

export const revalidate = 60

export async function generateStaticParams() {
  const { data: posts } = await supabase.from('Posts').select('slug')

  return posts?.map(({ slug }) => ({
    slug,
  }))
}

export default async function Post({ params }: { params: { post: string } }) {
  let slug = params.post

  const { data: post } = await supabase
    .from('Posts')
    .select()
    .match({ slug })
    .single()

  if (!post) {
    notFound()
  }

  // const post = post
  // console.log(post);

  return (
    <article id={`article_${post.id}`} className='post'>
      <header style={{ backgroundImage: `url(${post.cover_image_url})` }}>
        <Nav />
      </header>
      <main className='container'>
        <h1>{post.title}</h1>
        <time dateTime={new Date(post.publish_date).toLocaleDateString()}>
          {new Date(post.publish_date).toLocaleDateString()}
        </time>
        {post.body}
      </main>
      <footer></footer>
    </article>
  )
}
