import assert from 'node:assert/strict'
import test from 'node:test'

import type { User } from '@/payload-types'

import { mapUserToPublicProfile } from './publicProfile'

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 7,
    username: 'spacedrifter',
    displayName: 'Commander spacedrifter',
    displayNameFormat: 'rank_username',
    crewRank: 'commander',
    role: 'user',
    email: 'private@example.com',
    firstName: 'Ava',
    lastName: 'Stone',
    zipCode: 90210,
    bio: 'Long-haul analog synth pilot.',
    avatar: {
      id: 11,
      alt: 'Crew avatar',
      updatedAt: '2026-01-01T00:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z',
      url: '/media/crew-avatar.png',
    } as User['avatar'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
    ...overrides,
  } as User
}

test('mapUserToPublicProfile returns only public profile fields', () => {
  const mapped = mapUserToPublicProfile(buildUser())

  assert.deepStrictEqual(Object.keys(mapped).sort(), [
    'avatarAlt',
    'avatarUrl',
    'bio',
    'createdAt',
    'crewRank',
    'displayName',
    'id',
    'updatedAt',
    'username',
  ])
  assert.equal(mapped.avatarUrl, '/media/crew-avatar.png')
  assert.equal(mapped.crewRank, 'commander')
})

test('mapUserToPublicProfile falls back to username and null bio', () => {
  const mapped = mapUserToPublicProfile(
    buildUser({
      displayName: '',
      bio: '   ',
      avatar: null,
    }),
  )

  assert.equal(mapped.displayName, 'spacedrifter')
  assert.equal(mapped.bio, null)
  assert.equal(mapped.avatarUrl, null)
})
