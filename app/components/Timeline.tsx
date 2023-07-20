import {
  VerticalTimeline,
  VerticalTimelineElement,
} from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'
import { MdMusicNote } from 'react-icons/md'
// import Date from '../components/Date'
// import Link from 'next/link'
// import Button from './Buttons'

// export default function Timeline({ songs }) {
//   return (
//     <VerticalTimeline lineColor={'var(--color-4)'}>
//       {
//         songs.map((song: any, index: number) => (
//           <VerticalTimelineElement
//             key={index}
//             contentStyle={{ background: 'var(--color-4)' }}
//             contentArrowStyle={{ borderRight: '12px solid var(--color-4)' }}
//             // date={<Date dateString={song.release_date} />}
//             // intersectionObserverProps={song.release_date}
//             iconStyle={{
//               background: 'var(--color-3)',
//             }}
//             icon={<MdMusicNote />}
//           >
//             <h3>
//               <Link href={song.slug}>{song.title}</Link>
//             </h3>
//             {/* {song.masterAudioFile ? (
//               <audio controls src={song.masterAudioFile.asset.url}>
//                 Your browser does not support the
//                 <code>audio</code> element.
//               </audio>
//             ) : null} */}
//             <p>{song.sonic_description}</p>
//             <Button
//               to={song.slug}
//               text='Learn More...'
//               fullWidth
//               customStyle={{
//                 background: 'var(--text-color)',
//                 color: 'var(--color-2)',
//                 marginTop: 'var(--spacer)',
//               }}
//             />
//           </VerticalTimelineElement>
//         ))}
//     </VerticalTimeline>
//   )
// }

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
