import { MdMusicNote } from 'react-icons/md'
// import Date from '../components/Date'
// import Link from 'next/link'
// import Button from './Buttons'

export default function Timeline({ songs }: any) {
  return (
    <>
      {songs.map((song: any, index: number) => (
        <div key={index} className='container'>
          <h2>{song.title}</h2>
          <p>{song.sonic_description}</p>
        </div>
      ))}
    </>
  )
}
