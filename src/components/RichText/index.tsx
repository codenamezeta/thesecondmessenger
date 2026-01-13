import { MediaBlock } from '@/blocks/MediaBlock/Component'
import {
  DefaultNodeTypes,
  SerializedBlockNode,
  SerializedLinkNode,
  type DefaultTypedEditorState,
} from '@payloadcms/richtext-lexical'
import {
  JSXConvertersFunction,
  LinkJSXConverter,
  RichText as ConvertRichText,
} from '@payloadcms/richtext-lexical/react'

import { CodeBlock, CodeBlockProps } from '@/blocks/Code/Component'

import type {
  BannerBlock as BannerBlockProps,
  CallToActionBlock as CTABlockProps,
  MediaBlock as MediaBlockProps,
} from '@/payload-types'
import { BannerBlock } from '@/blocks/Banner/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { cn } from '@/utilities/ui'

type NodeTypes =
  | DefaultNodeTypes
  | SerializedBlockNode<CTABlockProps | MediaBlockProps | BannerBlockProps | CodeBlockProps>

const internalDocToHref = ({ linkNode }: { linkNode: SerializedLinkNode }) => {
  const { value, relationTo } = linkNode.fields.doc!
  if (typeof value !== 'object') {
    throw new Error('Expected value to be an object')
  }
  const slug = value.slug
  return relationTo === 'posts' ? `/posts/${slug}` : `/${slug}`
}

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({ internalDocToHref }),
  blocks: {
    banner: ({ node }) => <BannerBlock className="col-start-2 mb-4" {...node.fields} />,
    mediaBlock: ({ node }) => (
      <MediaBlock
        className="col-start-1 col-span-3"
        imgClassName="m-0"
        {...node.fields}
        captionClassName="mx-auto max-w-[48rem]"
        enableGutter={false}
        disableInnerContainer={true}
      />
    ),
    code: ({ node }) => <CodeBlock className="col-start-2" {...node.fields} />,
    cta: ({ node }) => <CallToActionBlock {...node.fields} />,
  },
})

type Props = {
  data: DefaultTypedEditorState
  enableGutter?: boolean
  enableProse?: boolean
} & React.HTMLAttributes<HTMLDivElement>

export default function RichText(props: Props) {
  const { className, enableProse = false, enableGutter = false, ...rest } = props
  return (
    <ConvertRichText
      converters={jsxConverters}
      className={cn(
        // 'payload-richtext',
        // 'rich-text',
        {
          container: enableGutter,
          'max-w-none': !enableGutter,
          'mx-auto prose md:prose-md dark:prose-invert': enableProse,
        },
        className,
      )}
      {...rest}
    />
  )
}

// export function RichTextSimplified(props: Props) {
//   // Helper component for rendering Payload CMS Rich Text (Lexical)
//     if (!props) return null

//     const renderChildren = (children: any[]) => {
//       return children?.map((child: any, i: number) => {
//         if (child.type === 'text') {
//           let textNode: React.ReactNode = child.text
//           if (child.format & 1) textNode = <strong key="bold">{textNode}</strong>
//           if (child.format & 2) textNode = <em key="italic">{textNode}</em>
//           if (child.format & 8) textNode = <u key="underline">{textNode}</u>
//           return <span key={i}>{textNode}</span>
//         }
//         return null
//       })
//     }

//     return (
//       <div className="space-y-3 p-4 pb-12 text-xs text-muted font-sans">
//         {props.map((node: any, i: number) => {
//           if (node.type === 'heading') {
//             const Tag = node.tag as keyof JSX.IntrinsicElements
//             return (
//               <Tag key={i} className="font-heading font-bold text-white mt-4 text-sm">
//                 {renderChildren(node.children)}
//               </Tag>
//             )
//           }
//           if (node.type === 'paragraph') {
//             return (
//               <p key={i} className="leading-relaxed whitespace-pre-wrap">
//                 {renderChildren(node.children)}
//               </p>
//             )
//           }
//           if (node.type === 'list') {
//             const Tag = node.tag === 'ol' ? 'ol' : 'ul'
//             return (
//               <Tag
//                 key={i}
//                 className={`pl-4 space-y-1 ${node.tag === 'ol' ? 'list-decimal' : 'list-disc'}`}
//               >
//                 {node.children.map((li: any, j: number) => (
//                   <li key={j} className="pl-1">
//                     {renderChildren(li.children)}
//                   </li>
//                 ))}
//               </Tag>
//             )
//           }
//           return null
//         })}
//       </div>
//     )
//   }
