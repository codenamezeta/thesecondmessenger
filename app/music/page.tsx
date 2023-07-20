import { getAllSongs } from '@/lib/firebase'
import Nav from '../components/Nav'
import Timeline from '../components/Timeline'

const MusicPage = async ({}) => {
  const allSongs: any[] = await getAllSongs()

  console.log(allSongs)

  return (
    <>
      <header style={{ backgroundColor: 'var(--color-3)', minHeight: '33vh' }}>
        <Nav />
        <div className='container'>
          <h1>Music</h1>
        </div>
      </header>

      <Timeline songs={allSongs} />
    </>
  )
}

export default MusicPage
