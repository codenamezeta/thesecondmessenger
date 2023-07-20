import Link from 'next/link'
import { CSSProperties } from 'react'

type ButtonProps = {
  
    text? : string,
    to : string,
    size? : string,
    outline? : boolean,
    align? : string,
    fullWidth? : boolean,
    customClass? : string,
    customStyle? : CSSProperties,
    external? : boolean,
  
}

export default function Button({
  text,
  to,
  size,
  outline,
  align,
  fullWidth,
  customClass,
  customStyle,
  external,
}:ButtonProps) {
  const classList = `btn${outline ? ' outline' : ''}${
    align ? ' align-' + align : ''
  }${fullWidth ? ' full-width' : ''}${size ? ' ' + size : ''}${
    customClass ? ' ' + customClass : ''
  }`

  return external ? (
    <a
      href={to}
      className={classList}
      target='_blank'
      rel='noopener noreferrer'
    >
      {text}
    </a>
  ) : (
    <Link
      href={to}
      className={classList}
      style={customStyle}
    >
      {text}
    </Link>
  )
}

Button.defaultProps = {
  text: 'Go!',
  to: '#!',
  outline: false,
  fullWidth: false,
}
