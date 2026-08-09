import 'server-only';

export interface SmsSendResult {
  delivered: boolean; // true = handed to Unifonic; false = queued only (no credentials configured)
  error?: string;
}

/** Same "queue for real until connected" pattern as emailProvider.ts and the CRM's WhatsApp queue. */
export async function sendSms(to: string, message: string): Promise<SmsSendResult> {
  const apiId = process.env.UNIFONIC_API_ID;
  const senderId = process.env.UNIFONIC_SENDER_ID;
  if (!apiId || !senderId) return { delivered: false };

  try {
    const res = await fetch('https://el.cloud.unifonic.com/rest/SMS/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ AppSid: apiId, SenderID: senderId, Recipient: to, Body: message }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { delivered: false, error: `unifonic_${res.status}: ${body.slice(0, 200)}` };
    }
    return { delivered: true };
  } catch (err) {
    return { delivered: false, error: err instanceof Error ? err.message : 'send_failed' };
  }
}
