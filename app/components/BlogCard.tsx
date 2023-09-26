import Image from 'next/image'
import Link from 'next/link'
import selectors from './BlogCard.module.scss'

interface BlogCardProps {
  title: string
  image: string
  description: string
  link: string
}

const BlogCard = ({ title, image, description, link }: BlogCardProps) => {
  return (
    <li className={selectors.card}>
      <Image src={image} alt={title} width={50} height={50} />
      <div className='card-body'>
        <h2>{title}</h2>
        <p>{description}</p>
        <Link href={link} className='btn btn-primary'>
          Read More
        </Link>
      </div>
    </li>
  )
}

export default BlogCard
