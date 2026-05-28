import type { Media, User } from '@/payload-types'

export type PublicProfile = {
  id: number
  username: string
  displayName: string
  bio: string | null
  crewRank: User['crewRank']
  avatarUrl: string | null
  avatarAlt: string
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
