import { NextRequest, NextResponse } from 'next/server';
import { listCampaigns } from '@/lib/marketing/store';
import { sendCampaignNow } from '@/lib/marketing/sendCampaign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Fires every draft email campaign whose scheduledAt has passed — "pre-
 * scheduling" only meant anything once something actually checks the clock,
 * otherwise scheduledAt just sat on the campaign unused. Meant to be invoked
 * on an interval by an external scheduler — see
 * scripts/campaign-scheduler-loop.ts for local dev, or Vercel Cron in
 * production. Same shared-secret pattern as /api/feedback/escalate.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  if (req.headers.get('x-poll-secret') === secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const campaigns = await listCampaigns();
  const now = Date.now();
  const due = campaigns.filter((c) => c.status === 'draft' && c.scheduledAt && new Date(c.scheduledAt).getTime() <= now);

  let sent = 0;
  const errors: string[] = [];
  for (const c of due) {
    try {
      await sendCampaignNow(c.id, req.nextUrl.origin);
      sent++;
    } catch (err) {
      errors.push(`${c.id}: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  return NextResponse.json({ ok: errors.length === 0, scanned: due.length, sent, errors });
}

export const POST = handle;
export const GET = handle;
