import 'server-only';
import nodemailer from 'nodemailer';

export interface SendResult {
  delivered: boolean; // true = handed to a real provider; false = queued only (no provider configured)
  providerMessageId?: string;
  error?: string;
}

let smtpTransport: nodemailer.Transporter | null = null;

/** Built once, reused across sends — creating a new transport per email would reopen the connection every time. */
function getSmtpTransport(): nodemailer.Transporter | null {
  if (smtpTransport) return smtpTransport;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  const port = Number(process.env.SMTP_PORT || 587);
  smtpTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = implicit TLS, 587 = STARTTLS (nodemailer negotiates this automatically when secure:false)
    auth: { user, pass },
  });
  return smtpTransport;
}

/**
 * Same "queue for real until a provider is connected" pattern already
 * established for WhatsApp (queueWhatsappFollowup in the CRM) — every part
 * of the campaign send pipeline (audience build, per-recipient rows, open/
 * click tracking) runs for real right now. Only the final "hand it to a
 * provider" step is a no-op until either is configured.
 *
 * Two providers, tried in order:
 *   1. Resend (RESEND_API_KEY) — what the system was originally built
 *      around; better deliverability for bulk/marketing mail.
 *   2. SMTP (SMTP_HOST/SMTP_USER/SMTP_PASSWORD, e.g. a Hostinger mailbox) —
 *      a practical alternative when there's no separate Resend account.
 * Whichever is configured first wins; if neither is set, the email is
 * queued only (delivered: false), same honest behavior as before.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.RESEND_FROM_EMAIL || 'Omnira Valet <no-reply@omniravalet.com>';
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to, subject, html }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        return { delivered: false, error: `resend_${res.status}: ${body.slice(0, 200)}` };
      }
      const data = await res.json();
      return { delivered: true, providerMessageId: data?.id };
    } catch (err) {
      return { delivered: false, error: err instanceof Error ? err.message : 'send_failed' };
    }
  }

  const transport = getSmtpTransport();
  if (!transport) return { delivered: false };

  const from = process.env.SMTP_FROM || `Omnira Valet <${process.env.SMTP_USER}>`;
  try {
    const info = await transport.sendMail({ from, to, subject, html });
    return { delivered: true, providerMessageId: info.messageId };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : 'send_failed' };
  }
}
