import { NextResponse } from 'next/server';
import { isAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Proxies the CRM's WhatsApp queue summary into this dashboard, same
 * direction-reversed pattern as the CRM's own /api/testimonials proxy —
 * keeps CRM_URL/WHATSAPP_SUMMARY_SECRET server-only and never surfaces a
 * hard error to the UI: an unconfigured or unreachable CRM just means an
 * empty WhatsApp section, not a broken dashboard.
 */
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const crmUrl = process.env.CRM_URL;
  const secret = process.env.WHATSAPP_SUMMARY_SECRET;
  if (!crmUrl || !secret) return NextResponse.json({ ok: true, total: 0, items: [] });

  try {
    const res = await fetch(`${crmUrl}/api/whatsapp/queue-summary`, {
      headers: { 'x-api-secret': secret },
      signal: AbortSignal.timeout(4000),
      cache: 'no-store',
    });
    if (!res.ok) return NextResponse.json({ ok: true, total: 0, items: [] });
    const data = await res.json();
    return NextResponse.json({ ok: true, total: data.total ?? 0, items: data.items ?? [] });
  } catch {
    return NextResponse.json({ ok: true, total: 0, items: [] });
  }
}
