import { getAllPosts } from '../../lib/supabase'
import NewsTeaser from '../components/NewsTeaser'
import Header from '../components/Header'

export default async function AllPostsPage() {
  const allPosts = await getAllPosts()
  return (
    <>
      <Header title='Updates' subtitle={''} />
      <NewsTeaser
        posts={allPosts}
        sectionTitle='Latest News & Updates from The Second Messenger'
      />
    </>
  )
}
