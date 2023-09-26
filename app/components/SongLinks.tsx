'use client'
import { BsDownload } from 'react-icons/bs'
import selectors from './SongLinks.module.scss'

export default function SongLinks({ downloadURL }: any) {
  const downloadFileAtURL = (url: string) => {
    const aTag = document.createElement('a')
    aTag.href = url
    aTag.setAttribute('download', 'filename.mp3') // Set desired filename here
    document.body.appendChild(aTag)
    aTag.click()
    document.body.removeChild(aTag) // Cleanup the added element
  }

  return (
    <div id={selectors['song_links']}>
      {downloadURL ? (
        <a
          href={downloadURL}
          onClick={(e) => {
            e.preventDefault() // Prevent the default behavior
            downloadFileAtURL(downloadURL)
          }}
        >
          <BsDownload />
        </a>
      ) : null}
    </div>
  )
}

// 'use client'
// import Link from 'next/link'
// import {
//   SiYoutubemusic,
//   SiSpotify,
//   SiAmazon,
//   SiApplemusic,
//   SiSoundcloud,
//   SiPandora,
// } from 'react-icons/si'
// import { BsDownload } from 'react-icons/bs'
// import { Tooltip } from 'react-tooltip'
// import 'react-tooltip/dist/react-tooltip.css'
// import selectors from './SongLinks.module.scss'

// interface StreamLinks {
//   links: {
//     soundcloud?: string
//     amazon_music?: string
//     youtube?: string
//     spotify?: string
//     apple_music?: string
//     pandora?: string
//   }
//   downloadURL?: string
// }

// export default function SongLinks({ links, downloadURL }: StreamLinks) {
//   console.log(
//     '🚀 ~ file: SongLinks.tsx:29 ~ SongLinks ~ downloadURL:',
//     downloadURL
//   )
//   return (
//     <div id={selectors['song_links']}>
//       {links.youtube ? (
//         <Link
//           href={links.youtube}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='youtube'
//           data-tooltip-content='Listen on YouTube'
//         >
//           <SiYoutubemusic />
//           <Tooltip anchorSelect='#youtube' place='bottom' />
//         </Link>
//       ) : null}
//       {links.spotify ? (
//         <Link
//           href={links.spotify}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='spotify'
//           data-tooltip-content='Stream on Spotify'
//         >
//           <SiSpotify />
//           <Tooltip anchorSelect='#spotify' place='bottom' />
//         </Link>
//       ) : null}
//       {links.apple_music ? (
//         <Link
//           href={links.apple_music}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='apple_music'
//           data-tooltip-content='Stream on Apple Music'
//         >
//           <SiApplemusic />
//           <Tooltip anchorSelect='#apple_music' place='bottom' />
//         </Link>
//       ) : null}
//       {links.amazon_music ? (
//         <Link
//           href={links.amazon_music}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='amazon_music'
//           data-tooltip-content='Stream on Amazon Music'
//         >
//           <SiAmazon />
//           <Tooltip anchorSelect='#amazon_music' place='bottom' />
//         </Link>
//       ) : null}
//       {links.soundcloud ? (
//         <Link
//           href={links.soundcloud}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='soundcloud'
//           data-tooltip-content='Stream on SoundCloud'
//         >
//           <SiSoundcloud />
//           <Tooltip anchorSelect='#soundcloud' place='bottom' />
//         </Link>
//       ) : null}
//       {links.pandora ? (
//         <Link
//           href={links.pandora}
//           rel='noopener noreferrer'
//           target='_blank'
//           id='pandora'
//           data-tooltip-content='Stream on Pandora'
//         >
//           <SiPandora />
//           <Tooltip anchorSelect='#pandora' place='bottom' />
//         </Link>
//       ) : null}
//       {downloadURL ? (
//         <a
//           href='https://firebasestorage.googleapis.com/v0/b/the-second-messenger-website.appspot.com/o/audio%2Fmrpm0_Saving%20Aleah.mp3'
//           download='Saving Aleah.mp3'
//         >
//           <BsDownload />
//           <Tooltip anchorSelect='#download' place='bottom' />
//         </a>
//       ) : null}
//     </div>
//   )
// }
