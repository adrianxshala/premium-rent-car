import { sendEmail } from '@/lib/email/send'

/**
 * GET /api/test-email — dev smoke test for the Resend integration.
 *
 * Sends one hard-coded email so you can confirm RESEND_API_KEY / EMAIL_FROM are
 * wired correctly. Open http://localhost:3000/api/test-email in the browser.
 *
 * Reuses lib/email/send.ts — the project's Resend HTTP sender (no SDK, per
 * ADR-6). The "From" address comes from EMAIL_FROM (set to onboarding@resend.dev
 * in .env.local). Delete this route before production.
 */

// Side-effecting and reads env at request time — never prerender or cache it.
export const dynamic = 'force-dynamic'

const TEST_RECIPIENT = 'adrianxshalax@gmail.com'

export async function GET() {
  console.log('[test-email] sending test email to %s', TEST_RECIPIENT)

  const ok = await sendEmail({
    to: TEST_RECIPIENT,
    subject: 'Rent Car Test Email',
    html: '<p>This email was sent successfully from my Rent Car application.</p>',
  })

  if (!ok) {
    console.error(
      '[test-email] send failed — confirm RESEND_API_KEY and EMAIL_FROM are set in .env.local, and check the [email] log line above for the Resend response.',
    )
    return Response.json(
      {
        ok: false,
        error:
          'Email failed to send. Check the server terminal for the [email] log line, and confirm RESEND_API_KEY and EMAIL_FROM are set in .env.local.',
      },
      { status: 502 },
    )
  }

  console.log('[test-email] sent OK to %s', TEST_RECIPIENT)
  return Response.json({ ok: true, to: TEST_RECIPIENT })
}
