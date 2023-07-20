//* This is what users will see when the navigate to a specific song's page. Links to these are our most sharable asset, so make it count! e.g. https://thesecondmessenger.com/the-best-song-ever
import { getSongById } from '@/lib/firebase'
import { getVideoOrPlaylistIdFromUrl } from '@/lib/youtube'
import Nav from '@/app/components/Nav'
import Button from '@/app/components/Buttons'
import Theater from '@/app/components/Theater'
import FeaturedSong from '@/app/components/FeaturedSong'
import Play from '@/app/components/Play'

// export const revalidate = 0

export default async function SongPage({
  params,
}: {
  params: { slug: string }
}) {
  //- Tries to help fix common errors if a user mistypes a slug
  function fixSlug(userTypedSlug: string): string {
    //- Convert to lowercase
    let fixedSlug = userTypedSlug.toLowerCase()
    //- Decode URL encoding (e.g., "%20" to space)
    fixedSlug = decodeURIComponent(fixedSlug)
    //- Remove leading and trailing spaces
    fixedSlug = fixedSlug.trim()
    //- Replace spaces and underscores with hyphens
    fixedSlug = fixedSlug.replace(/\s+|_+/g, '-')
    //- Remove any other special characters except letters, numbers, and hyphens
    fixedSlug = fixedSlug.replace(/[^a-z0-9-]/g, '')
    return fixedSlug
  }

  const song: any = await getSongById(fixSlug(params.slug))

  //- Converts the full link URL into just a video ID
  // const youTubeVideoId = getVideoOrPlaylistIdFromUrl(song.stream_links.youtube)

  return (
    <>
      Hello
      {/* <Nav />
      <FeaturedSong titleAsH1={true} song={song} /> */}
      {/* <header>
        <h1>{song.title}</h1>
      </header>
      <main>
        <section className='song-info'>
          <div className='cover-art'>
            <img src='cover-art.jpg' alt='Album Cover' />
          </div>
          <div className='song-details'>
            <h2>{song.title}</h2>
            <p>The Second Messenger</p>
            <p>Album Title</p>
            <audio controls>
              <source src='song.mp3' type='audio/mpeg' />
              Your browser does not support the audio element.
            </audio>
          </div>
        </section>
        <section className='lyrics'>
          <h2>Lyrics</h2>
          <pre>{song.lyrics}</pre>
        </section>
        <section className='comments'>
          <h2>Comments</h2>
          <ul>
            <li>
              <img src='user-avatar.jpg' alt='User Avatar' />
              <div className='comment-details'>
                <p className='comment-author'>Comment Author</p>
                <p className='comment-text'>Comment text goes here...</p>
              </div>
            </li>
          </ul>
        </section>
      </main> */}
    </>
  )
}
