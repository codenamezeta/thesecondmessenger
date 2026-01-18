import type { Metadata } from 'next'

export default function PrivacyPage() {
  return (
    <main className="container pt-16 pb-24">
      <h1 className="text-4xl font-bold">Privacy Policy</h1>
      <p className="text-lg">This is the privacy policy page.</p>
      <p className="text-lg">
        We collect emails for newsletters and use Spotify tokens only for library syncing.
      </p>
      <p className="text-lg">We do not sell or share your data with any third parties.</p>
      <p className="text-lg">We do not store any personal data on our servers.</p>
    </main>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Privacy Policy',
    description: 'Privacy Policy',
  }
}
