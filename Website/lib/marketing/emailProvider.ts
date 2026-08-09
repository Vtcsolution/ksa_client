import 'server-only';

export interface SendResult {
  delivered: boolean; // true = handed to a real provider; false = queued only (no RESEND_API_KEY configured)
  providerMessageId?: string;
  error?: string;
}

/**
 * Same "queue for real until the provider is connected" pattern already
 * established for WhatsApp (queueWhatsappFollowup in the CRM) — every part
 * of the campaign send pipeline (audience build, per-recipient rows, open/
 * click tracking) runs for real right now. Only the final "hand it to an
 * email provider" step is a no-op until RESEND_API_KEY exists; swapping in
 * the real send is a drop-in change to this one function.
 */
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { delivered: false };

  const from = process.env.RESEND_FROM_EMAIL || 'Omnira Valet <no-reply@omniravalet.com>';
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
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
