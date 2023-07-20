import { useSession, signIn, signOut } from 'next-auth/react'

export default function Auth() {
  const { data: session } = useSession()
  if (session) {
    console.log(session)
    return (
      <main className='container'>
        You are signed in.
        <br />
        Your name is {session.user.name} and your email address is{' '}
        {session.user.email} <br />
        <br />
        <button className='btn' onClick={() => signOut()}>
          Sign out
        </button>
      </main>
    )
  }
  return (
    <main className='container'>
      Oh Snap! You are not signed in. No worries, to fix this, just sign in,
      fool. <br />
      <br />
      <button className='btn' onClick={() => signIn()}>
        Sign in
      </button>
    </main>
  )
}
