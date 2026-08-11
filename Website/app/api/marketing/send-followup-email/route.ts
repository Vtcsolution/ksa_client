import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/marketing/emailProvider';
import { isServiceAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * One-off transactional send — not a campaign (no audience builder, no
 * per-recipient tracking row). This is what the CRM's tiered follow-up
 * cadence calls to deliver the email side of a touchpoint whenever a lead
 * has an email on file (see omnira-crm/src/lib/supabase/followupCadence.ts).
 * Same shared-secret pattern as every other CRM<->Website integration.
 */
export async function POST(req: NextRequest) {
  if (!isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const to = typeof body?.to === 'string' ? body.to.trim() : '';
  const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
  const html = typeof body?.html === 'string' ? body.html : '';
  if (!to || !subject || !html) return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 422 });

  const result = await sendEmail(to, subject, html);
  return NextResponse.json({ ok: true, delivered: result.delivered, error: result.error });
}
