import type { Payload } from 'payload'

/**
 * Owner-facing alerts (new account, membership change, new subscriber/download).
 *
 * Delivery uses Payload's configured email transport (Resend adapter when
 * `RESEND_API_KEY` is set — see payload.config.ts). Every send is best-effort
 * and fully guarded: a missing owner address or transport error never breaks
 * the user-facing operation that triggered it.
 */

function getOwnerEmail(): string | null {
  const email = process.env.OWNER_NOTIFICATION_EMAIL?.trim()
  return email || null
}

async function sendOwnerEmail(
  payload: Payload,
  subject: string,
  html: string,
): Promise<void> {
  const to = getOwnerEmail()
  if (!to) return
  try {
    await payload.sendEmail({ to, subject, html })
  } catch (error) {
    payload.logger.error({ msg: 'Owner notification email failed', error })
  }
}

export async function notifyOwnerNewAccount(
  payload: Payload,
  user: { username: string; email: string; id: number },
): Promise<void> {
  await sendOwnerEmail(
    payload,
    `New Crew account: ${user.username}`,
    `<h2>New account created</h2>
     <p><strong>Username:</strong> ${user.username}</p>
     <p><strong>Email:</strong> ${user.email}</p>
     <p><strong>User ID:</strong> ${user.id}</p>`,
  )
}

export async function notifyOwnerMembershipChange(
  payload: Payload,
  details: { username: string; email: string; newRank: string },
): Promise<void> {
  await sendOwnerEmail(
    payload,
    `Membership change: ${details.username} → ${details.newRank}`,
    `<h2>Membership updated</h2>
     <p><strong>Username:</strong> ${details.username}</p>
     <p><strong>Email:</strong> ${details.email}</p>
     <p><strong>New rank:</strong> ${details.newRank}</p>`,
  )
}

export async function notifyOwnerNewSubscriber(
  payload: Payload,
  details: { email: string; source: string; tags: string },
): Promise<void> {
  const isDownload = details.tags.includes('song_download')
  await sendOwnerEmail(
    payload,
    isDownload
      ? `New download lead: ${details.email}`
      : `New newsletter subscriber: ${details.email}`,
    `<h2>${isDownload ? 'Song download (email captured)' : 'New subscriber'}</h2>
     <p><strong>Email:</strong> ${details.email}</p>
     <p><strong>Source:</strong> ${details.source}</p>
     <p><strong>Tags:</strong> ${details.tags}</p>`,
  )
}
