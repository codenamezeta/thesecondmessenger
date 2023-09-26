import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export default function SongPageLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Header title='Hello' subtitle='Subtitle' />
      {children}
      <Footer />
    </>
  )
}
