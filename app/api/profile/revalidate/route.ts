import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { getMeUser } from '@/utilities/getMeUser'

function normalizeUsernames(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => entry.length > 0)
}

export async function POST(request: Request) {
  const { user } = await getMeUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const requestedUsernames = normalizeUsernames(body?.usernames)
  const usernames = new Set<string>(requestedUsernames)
  usernames.add(user.username.toLowerCase())

  for (const username of usernames) {
    revalidatePath(`/crew/${username}`)
  }

  revalidatePath('/crew')

  return NextResponse.json({
    revalidated: true,
    usernames: Array.from(usernames),
  })
}
