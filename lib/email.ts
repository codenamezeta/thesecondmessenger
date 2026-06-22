import { PRIMARY_ARTIST } from '@/lib/branding'
import { getServerSideURL } from '@/utilities/getURL'

export const EMAIL_FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || 'noreply@thesecondmessenger.com'

export const EMAIL_FROM_NAME =
  process.env.RESEND_FROM_NAME || PRIMARY_ARTIST

export function getResetPasswordURL(token: string): string {
  return `${getServerSideURL()}/reset-password?token=${encodeURIComponent(token)}`
}

export function buildForgotPasswordEmailHTML({
  token,
  email,
}: {
  token: string
  email: string
}): string {
  const resetURL = getResetPasswordURL(token)

  return `
    <!doctype html>
    <html>
      <body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #111;">
        <p>Hello,</p>
        <p>We received a request to reset the password for <strong>${email}</strong>.</p>
        <p>
          <a href="${resetURL}" style="display: inline-block; padding: 10px 16px; background: #111; color: #fff; text-decoration: none;">
            Reset your password
          </a>
        </p>
        <p style="font-size: 14px; color: #555;">
          Or copy this link into your browser:<br />
          <a href="${resetURL}">${resetURL}</a>
        </p>
        <p style="font-size: 14px; color: #555;">
          If you did not request this, you can ignore this email.
        </p>
      </body>
    </html>
  `.trim()
}
