/* src/components/Link/index.tsx */
import Link from 'next/link'
import React from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/utilities/ui'
import type { Page, Post } from '@/payload-types'

type CMSLinkType = {
  appearance?: 'inline' | 'link' | ButtonProps['variant'] | 'noStyle' // Added noStyle
  children?: React.ReactNode
  className?: string
  label?: string | null
  newTab?: boolean | null
  reference?: {
    relationTo: 'pages' | 'posts'
    value: Page | Post | string | number
  } | null
  size?: ButtonProps['size'] | null
  type?: 'custom' | 'reference' | null
  url?: string | null
}

export const CMSLink: React.FC<CMSLinkType> = (props) => {
  const {
    type,
    appearance = 'inline',
    children,
    className,
    label,
    newTab,
    reference,
    size: sizeFromProps,
    url,
  } = props

  // Logic to build the HREF safely from CMS data
  const href =
    type === 'reference' && typeof reference?.value === 'object' && reference.value.slug
      ? `${reference?.relationTo !== 'pages' ? `/${reference?.relationTo}` : ''}/${reference.value.slug}`
      : url

  if (!href) return null

  const newTabProps = newTab ? { rel: 'noopener noreferrer', target: '_blank' } : {}

  // 1. Raw Link (For use inside your Custom Nav)
  if (appearance === 'noStyle') {
    return (
      <Link href={href} {...newTabProps} className={className}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  // 2. Standard Inline Link
  if (appearance === 'inline') {
    return (
      <Link className={cn(className)} href={href} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    )
  }

  // 3. Button Styled Link (For CTAs)
  return (
    <Button asChild className={className} size={sizeFromProps} variant={appearance as any}>
      <Link href={href} {...newTabProps}>
        {label && label}
        {children && children}
      </Link>
    </Button>
  )
}
