'use client'
import { useState } from 'react'
import selectors from './ExpandableText.module.scss'

interface ExpandableTextProps {
  text: string
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text }) => {
  const [expanded, setExpanded] = useState(false)

  const toggleExpand = () => {
    setExpanded(!expanded)
  }

  return (
    <div>
      <pre
        className={
          expanded
            ? `${selectors['expandable-text']} ${selectors['expanded']}`
            : `${selectors['expandable-text']}`
        }
      >
        {text}
      </pre>
      <button className='btn' onClick={toggleExpand}>
        {expanded ? 'Read Less' : 'Read More'}
      </button>
    </div>
  )
}

export default ExpandableText
