import { redirect } from 'next/navigation'

/**
 * The redesign spec's CTAs point to `/register`; account creation lives on
 * the Register tab of the login page. Keep the friendly URL as a redirect.
 */
export default function RegisterPage() {
  redirect('/login?tab=register')
}
