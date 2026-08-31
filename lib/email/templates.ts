import 'server-only'

import { formatDate, formatEur } from '@/lib/format'

export type BookingConfirmationData = {
  customerName: string | null
  carTitle: string
  startDate: string
  endDate: string
  totalPrice: number
  manageUrl: string
}

/** Escape user-supplied text before interpolating into the HTML body. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Booking-confirmation email (Albanian). Inline styles only — email clients
 * strip <style> and external CSS. Returns the subject + a self-contained body.
 */
export function bookingConfirmationEmail(data: BookingConfirmationData): {
  subject: string
  html: string
} {
  const greetingName = data.customerName?.trim().split(' ')[0]
  const greeting = greetingName
    ? `Përshëndetje ${esc(greetingName)},`
    : 'Përshëndetje,'

  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:14px;">${label}</td>
      <td style="padding:6px 0;text-align:right;font-size:14px;${
        strong ? 'font-weight:600;color:#111827;' : 'color:#111827;'
      }">${value}</td>
    </tr>`

  const html = `<!doctype html>
<html lang="sq">
  <body style="margin:0;background:#f4f4f5;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#10b981;font-weight:600;">Rezervimi u konfirmua</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#111827;">${esc(data.carTitle)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 0;color:#374151;font-size:15px;line-height:1.6;">
          <p style="margin:0 0 8px;">${greeting}</p>
          <p style="margin:0;">Rezervimi yt është konfirmuar. Më poshtë janë detajet.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:8px 16px;">
            ${row('Makina', esc(data.carTitle))}
            ${row('Datat', `${formatDate(data.startDate)} → ${formatDate(data.endDate)}`)}
            ${row('Totali', formatEur(data.totalPrice), true)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 28px;">
          <a href="${data.manageUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:9999px;">Shiko rezervimin</a>
          <p style="margin:16px 0 0;color:#9ca3af;font-size:12px;line-height:1.5;">Pagesa kryhet në marrjen e makinës. Për çdo pyetje, përgjigju këtij emaili.</p>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return {
    subject: `Rezervimi u konfirmua — ${data.carTitle}`,
    html,
  }
}

export type NewBookingAdminData = {
  carTitle: string
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  startDate: string
  endDate: string
  totalPrice: number
  adminUrl: string
}

/**
 * Internal "new booking" alert sent to admins the moment a booking is created.
 * Inline styles only — same constraints as the customer email. Not
 * customer-facing, so it leans informational over decorative.
 */
export function newBookingAdminEmail(data: NewBookingAdminData): {
  subject: string
  html: string
} {
  const row = (label: string, value: string, strong = false) => `
    <tr>
      <td style="padding:6px 0;color:#6b7280;font-size:14px;">${label}</td>
      <td style="padding:6px 0;text-align:right;font-size:14px;${
        strong ? 'font-weight:600;color:#111827;' : 'color:#111827;'
      }">${value}</td>
    </tr>`

  const contactLine = [data.customerEmail, data.customerPhone]
    .filter(Boolean)
    .map((v) => esc(v as string))
    .join(' · ')

  const html = `<!doctype html>
<html lang="sq">
  <body style="margin:0;background:#f4f4f5;padding:24px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <tr>
        <td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:#f59e0b;font-weight:600;">Rezervim i ri</p>
          <h1 style="margin:8px 0 0;font-size:22px;color:#111827;">${esc(data.carTitle)}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px 0;color:#374151;font-size:15px;line-height:1.6;">
          <p style="margin:0;">Sapo u krijua një rezervim i ri i konfirmuar.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 4px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border-radius:12px;padding:8px 16px;">
            ${row('Klienti', esc(data.customerName?.trim() || '—'))}
            ${contactLine ? row('Kontakti', contactLine) : ''}
            ${row('Makina', esc(data.carTitle))}
            ${row('Datat', `${formatDate(data.startDate)} → ${formatDate(data.endDate)}`)}
            ${row('Totali', formatEur(data.totalPrice), true)}
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 32px 28px;">
          <a href="${data.adminUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:9999px;">Hap panelin e rezervimeve</a>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return {
    subject: `Rezervim i ri — ${data.carTitle}`,
    html,
  }
}
