import { isValid, parseISO, format } from 'date-fns'

type AppProps = {
  dateString: String | any
}

export default function Date({ dateString }: AppProps) {
  if (!isValid(parseISO(dateString))) {
    return dateString
  }
  const date = parseISO(dateString)
  return <time dateTime={dateString}>{format(date, 'LLLL	d, yyyy')}</time>
}
