import Link from 'next/link'
import Image from 'next/image'

export default function Avatar({
  imageSrc = '',
  displayName = '',
  url = '',
  altText = '',
  size = 75,
  anchorClass = '',
  imageClass = '',
}) {
  const avatar = (
    <Image
      src={imageSrc}
      alt={altText || displayName}
      width={size}
      height={size}
      style={{ borderRadius: '50%' }}
      className={imageClass}
    />
  )

  if (!url) {
    return avatar
  }

  const avatarLink = <Link href={url}>{avatar}</Link>

  if (url.includes('thesecondmessenger.com' || 'localhost')) {
    return avatarLink
  }

  return (
    <Link
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className={anchorClass}
    >
      {avatar}
    </Link>
  )
}
