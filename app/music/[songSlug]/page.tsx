import { getSongBySlug } from '@/lib/firebase'
import { useYoutubeVideoId } from '@/app/context/store'
import PlayButton from '@/app/context/PlayButton'
import { getVideoOrPlaylistIdFromUrl } from '@/lib/youtube'

export default async function SongPage({
  params,
}: {
  params: { songSlug: string }
}) {
  const song: any = await getSongBySlug(params.songSlug)
  const youtubeVideoId = getVideoOrPlaylistIdFromUrl(song.stream_links.youtube)
  console.log('🚀 ~ file: page.tsx:12 ~ youtubeVideoId:', youtubeVideoId)

  return (
    <main>
      <h2>About {song.title}</h2>
      {/* This button should somehow pass youtubeVideoId to SongPlayer component when clicked */}
      <PlayButton videoId={youtubeVideoId} />
    </main>
  )
}

// //* This is what users will see when the navigate to a specific song's page. Links to these are our most sharable asset, so make it count!
// //- e.g. https://thesecondmessenger.com/the-best-song-ever
// import SongLinks from '@/app/components/SongLinks'
// import Comments from '@/app/components/Comments'
// import {
//   getSongBySlug,
//   getCoverArtUrl,
//   getAudioDownloadUrl,
// } from '@/lib/firebase'
// import selectors from './songpage.module.scss'
// import Image from 'next/image'
// import ExpandableText from '@/app/components/ExpandableText'
// import { getVideoComments, getVideoOrPlaylistIdFromUrl } from '@/lib/youtube'

// export default async function SongPage({
//   params,
// }: {
//   params: { songSlug: string }
// }) {
//   //* Tries to help fix common errors if a user mistypes a slug.
//   function fixSlug(userTypedSlug: string): string {
//     //- Convert to lowercase
//     let fixedSlug = userTypedSlug.toLowerCase()
//     //- Decode URL encoding (e.g., "%20" to space)
//     fixedSlug = decodeURIComponent(fixedSlug)
//     //- Remove leading and trailing spaces
//     fixedSlug = fixedSlug.trim()
//     //- Replace spaces and underscores with hyphens
//     fixedSlug = fixedSlug.replace(/\s+|_+/g, '-')
//     //- Remove any other special characters except letters, numbers, and hyphens
//     fixedSlug = fixedSlug.replace(/[^a-z0-9-]/g, '')
//     return fixedSlug
//   }

//   const song: any = await getSongBySlug(fixSlug(params.songSlug))

//   const coverArtUrl = await getCoverArtUrl(song.cover_art)
//   const bannerUrl = await getCoverArtUrl(
//     song.banner ? song.banner : song.cover_art
//   )
//   const audioDownloadUrl = await getAudioDownloadUrl({
//     audioFilePath: song.master_audio ? song.master_audio : null,
//   })
//   const youtubeVideoId = await getVideoOrPlaylistIdFromUrl(
//     song.stream_links.youtube
//   )
//   const { comments, commentsEnabled } = await getVideoComments(youtubeVideoId)

//   return (
//     <article className={`container ${selectors.song}`}>
//       <aside>
//         <Image
//           src={coverArtUrl}
//           height={700}
//           width={700}
//           sizes='(max-width: 1400px) 100%'
//           alt={`${song.title} cover art`}
//           style={{ height: 'auto' }}
//         />

//         {song.lyrics ? (
//           <>
//             <h4>Lyrics</h4>
//             <hr />
//             <ExpandableText text={song.lyrics} />
//           </>
//         ) : null}
//       </aside>
//       <main>
//         <section id='story'>
//           <h2>About {song.title}</h2>
//           <SongLinks links={song.stream_links} downloadURL={audioDownloadUrl} />
//           <p>{song.story}</p>
//         </section>
//         <section id='video'>
//           <h2>Video</h2>
//           <hr />
//         </section>
//       </main>
//       <Comments
//         comments={comments}
//         commentsEnabled={commentsEnabled}
//         customClassName={selectors.comments}
//       />
//     </article>
//   )
// }
