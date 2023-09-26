import Nav from '@/app/components/Nav'
import Footer from '../components/Footer'

export const metadata = {
  title: 'The Second Messenger',
  description: 'Posts Page',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header>
        <Nav />
        <div className='container'>
          <h1>Latest Posts</h1>
        </div>
      </header>
      {children}
      <Footer />
    </>
  )
}
