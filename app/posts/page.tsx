import Image from 'next/image'
import selectors from './page.module.scss'

export default function Posts() {
  return (
    <main id={selectors.all_posts_lists}>
      <div className='container'>
        <h2>All Posts</h2>
      </div>
      <ul>
        <li>
          <a className='container' href='/blog/post-1'>
            <time dateTime='2008-02-14 20:00'>November 03, 2024</time>
            <h3>Post 1 Title</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <Image
              src='https://firebasestorage.googleapis.com/v0/b/the-second-messenger-website.appspot.com/o/images%2Feuuv9_Artwork%20Saving%20Aleah.jpg?alt=media&token=af799d4e-7de6-4981-b981-ea488c46c47c'
              width={250}
              height={250}
              alt='Placeholder'
            />
          </a>
        </li>
        <li>
          <a href='/blog/post-2'>
            <h3>Post 2 Title</h3>
            <p>
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
          </a>
        </li>
      </ul>
    </main>
  )
}
