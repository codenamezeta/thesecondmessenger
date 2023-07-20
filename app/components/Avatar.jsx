import Link from 'next/link'
import selectors from '../styles/Avatar.module.scss'
import Date from './Date'
import NewTabLink from './newTabLink'

export default function Avatar({
  name = '',
  picture = '',
  headlineText = '',
  date = false,
  url = '',
}) {
  return (
    <div className={selectors.avatar}>
      {/* Wrap the avatar and display name in a link if there is one */}
      {url ? (
        url.includes('thesecondmessenger.com' || 'localhost') ? (
          <>
            <Link href={url}>
              <img src={picture} alt={name} />
            </Link>
            <Link href={url}>
              <h4>{name}</h4>
            </Link>
          </>
        ) : (
          <>
            <a href={url} target='_blank' rel='noopener noreferrer'>
              <img src={picture} alt={name} />
            </a>
            <a href={url} target='_blank' rel='noopener noreferrer'>
              <h4>{name}</h4>
            </a>
          </>
        )
      ) : (
        <>
          <img src={picture} alt={name} />
          <h4>{name}</h4>
        </>
      )}
      {date ? <Date dateString={date} /> : null}
      {headlineText ? <span>{headlineText}</span> : null}
    </div>
  )
}
