import './theme.scss'
import './page.scss'
import Play from './components/Play'

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
      {/* <Play youTubePlaylistId='PLFhi_wBjERLqYiJSbS0jOKhcjnfT1EuE1' /> */}
      <body>{children}</body>
    </html>
  )
}
