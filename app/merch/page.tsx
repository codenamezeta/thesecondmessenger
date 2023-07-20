import Nav from '../components/Nav'
import { NextPage } from 'next'

interface Props {}

const Page: NextPage<Props> = ({}) => {
  return (
    <div>
      <Nav />
      <div className='container'>
        <h1>Merch will be Coming Soon!</h1>
      </div>
    </div>
  )
}

export default Page
