import { redirect } from 'next/navigation'

import { getMeUser } from '@/utilities/getMeUser'

export default async function MeRedirectPage() {
  const { user } = await getMeUser({ nullUserRedirect: '/login?redirect=/me' })

  if (!user) {
    redirect('/login?redirect=/me')
  }

  redirect(`/crew/${user.username}`)
}
