import { Resend } from 'resend'

/**
 * Thin wrapper around Resend Contacts for syncing the mailing list / opted-in
 * users into a Resend Audience for broadcasts. Fully optional: if
 * `RESEND_API_KEY` or `RESEND_AUDIENCE_ID` is unset, every call is a no-op so
 * local/dev and unconfigured environments keep working.
 */

let resendClient: Resend | null = null

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) return null
  if (!resendClient) resendClient = new Resend(apiKey)
  return resendClient
}

function getAudienceId(): string | null {
  return process.env.RESEND_AUDIENCE_ID?.trim() || null
}

export function isResendAudienceConfigured(): boolean {
  return Boolean(getResendClient() && getAudienceId())
}

type ContactInput = {
  email: string
  firstName?: string | null
  lastName?: string | null
  /** When true the contact is added as unsubscribed (respects opt-out). */
  unsubscribed?: boolean
}

/**
 * Idempotently add (or update) a contact in the configured Resend audience.
 * Errors are swallowed and logged so this never breaks the caller.
 */
export async function upsertAudienceContact(
  contact: ContactInput,
): Promise<void> {
  const client = getResendClient()
  const audienceId = getAudienceId()
  if (!client || !audienceId) return

  try {
    await client.contacts.create({
      audienceId,
      email: contact.email,
      firstName: contact.firstName ?? undefined,
      lastName: contact.lastName ?? undefined,
      unsubscribed: contact.unsubscribed ?? false,
    })
  } catch (error) {
    console.error('Resend audience contact upsert failed:', error)
  }
}
