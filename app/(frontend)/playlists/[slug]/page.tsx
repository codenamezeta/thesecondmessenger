import { redirect } from 'next/navigation'

type Args = {
  params: Promise<{ slug: string }>
}

/** Playlists do not have a public detail route yet — send users to the archive. */
export default async function PlaylistShortcutPage({ params }: Args) {
  const { slug } = await params
  redirect(`/music?q=${encodeURIComponent(decodeURIComponent(slug))}`)
}
