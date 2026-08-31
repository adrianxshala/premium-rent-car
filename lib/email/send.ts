import 'server-only'

/**
 * Minimal email sender over the Resend HTTP API (no SDK dependency).
 *
 * Sending is best-effort: if `RESEND_API_KEY` is not set (local dev) or the
 * request fails, we log and return `false` instead of throwing. A booking
 * confirmation must never break because an email could not be delivered
 * (ADR-6: email is async / non-blocking).
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export type SendEmailParams = {
  to: string
  subject: string
  html: string
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM

  if (!apiKey || !from) {
    console.warn(
      '[email] RESEND_API_KEY / EMAIL_FROM not set — skipping email to %s (%s)',
      to,
      subject,
    )
    return false
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (!res.ok) {
      const detail = await res.text().catch(() => '')
      console.error('[email] Resend rejected (%s): %s', res.status, detail)
      return false
    }
    return true
  } catch (error) {
    console.error('[email] send failed:', error)
    return false
  }
}
