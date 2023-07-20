import Button from '../components/Buttons'
import Nav from '../components/Nav'

type Props = {
  title: string
  subtitle: string
}

export default function Header({ title, subtitle }: Props) {
  return (
    <header>
      <Nav />
      <div className='container'>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <Button to='#' text='Go now!' />
      </div>
    </header>
  )
}
