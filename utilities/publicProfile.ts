import type { Media, Song, User } from '@/payload-types'

export type PublicProfile = {
  id: number
  username: string
  displayName: string
  bio: string | null
  crewRank: User['crewRank']
  avatarUrl: string | null
  avatarAlt: string
  favoriteSong: { title: string; slug: string | null } | null
  createdAt: string
  updatedAt: string
}

type PublicProfileSource = Pick<
  User,
  | 'id'
  | 'username'
  | 'displayName'
  | 'bio'
  | 'crewRank'
  | 'avatar'
  | 'favoriteSong'
  | 'createdAt'
  | 'updatedAt'
>

function readAvatar(avatar: User['avatar']): {
  avatarUrl: string | null
  avatarAlt: string
} {
  if (avatar && typeof avatar === 'object') {
    const media = avatar as Media
    return {
      avatarUrl: media.url ?? null,
      avatarAlt: media.alt ?? 'Crew profile avatar',
    }
  }

  return {
    avatarUrl: null,
    avatarAlt: 'Crew profile avatar',
  }
}

function readFavoriteSong(
  favoriteSong: User['favoriteSong'],
): { title: string; slug: string | null } | null {
  if (favoriteSong && typeof favoriteSong === 'object') {
    const song = favoriteSong as Song
    const title = song.title?.trim()
    if (!title) return null
    return { title, slug: song.slug ?? null }
  }
  return null
}

export function mapUserToPublicProfile(
  user: PublicProfileSource,
): PublicProfile {
  const avatar = readAvatar(user.avatar)

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName?.trim() || user.username,
    bio: user.bio?.trim() ? user.bio : null,
    crewRank: user.crewRank,
    avatarUrl: avatar.avatarUrl,
    avatarAlt: avatar.avatarAlt,
    favoriteSong: readFavoriteSong(user.favoriteSong),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
