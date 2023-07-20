import BlockContent from '@sanity/block-content-to-react'

export default function PostBody({ content }) {
  return (
    <main style={{ marginTop: 'var(--spacer)' }}>
      <BlockContent
        blocks={content}
        projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
        dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
      />
    </main>
  )
}
