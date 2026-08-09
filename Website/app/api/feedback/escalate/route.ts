import { NextRequest, NextResponse } from 'next/server';
import { listFeedback, markFeedbackNotified } from '@/lib/feedback/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Recurring "keep nagging until someone deals with it" sweep — every AI-
 * flagged, unresolved feedback gets re-alerted to the CRM's managers on a
 * cadence scaled by how severe the AI judged it (severityPct), not a flat
 * interval. A single flag+forget notification isn't enough for something a
 * manager might miss once; this is what makes it recurring. Meant to be
 * invoked on an interval by an external scheduler — see
 * scripts/feedback-escalation-loop.ts for local dev, or Vercel Cron in
 * production. Same shared-secret pattern as /api/followups/escalate in the CRM.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  if (req.headers.get('x-poll-secret') === secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

function renotifyIntervalMs(severityPct: number): number {
  if (severityPct >= 70) return 6 * 3600000; // severe — nudge every 6h
  if (severityPct >= 40) return 12 * 3600000; // moderate — every 12h
  return 24 * 3600000; // minor — daily is enough
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const crmUrl = process.env.CRM_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!crmUrl || !secret) return NextResponse.json({ ok: true, scanned: 0, notified: 0, errors: ['CRM_URL or FEEDBACK_SYNC_SECRET not set'] });

  const all = await listFeedback();
  const eligible = all.filter((f) => f.aiFlag?.flagged && !f.resolved);

  const now = Date.now();
  let notified = 0;
  const errors: string[] = [];

  for (const f of eligible) {
    const severity = f.aiFlag!.severityPct;
    const last = f.lastNotifiedAt ? new Date(f.lastNotifiedAt).getTime() : null;
    if (last !== null && now - last < renotifyIntervalMs(severity)) continue;

    try {
      const res = await fetch(`${crmUrl}/api/feedback-alerts/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-secret': secret },
        body: JSON.stringify({
          feedbackId: f.id,
          name: f.name,
          rating: f.rating,
          severityPct: severity,
          urgency: f.aiFlag!.urgency,
          reasonAr: f.aiFlag!.reasonAr,
          message: f.message,
          notifyCount: (f.notifyCount ?? 0) + 1,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        await markFeedbackNotified(f.id);
        notified++;
      } else {
        errors.push(`${f.id}: crm responded ${res.status}`);
      }
    } catch (err) {
      errors.push(`${f.id}: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  return NextResponse.json({ ok: errors.length === 0, scanned: eligible.length, notified, errors });
}

export const POST = handle;
export const GET = handle;
