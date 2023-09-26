import './theme.scss'
import './page.scss'
import SongPlayer from './components/SongPlayer'
import { YoutubeVideoIdProvider } from './context/store'
// import Play from './components/Play'

export const metadata = {
  title: 'The Second Messenger',
  description: 'Home Page',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en'>
      <body>
        <YoutubeVideoIdProvider>
          {children}
          <SongPlayer />
        </YoutubeVideoIdProvider>
      </body>
    </html>
  )
}
