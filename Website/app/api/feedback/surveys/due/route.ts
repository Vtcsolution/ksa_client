import { NextRequest, NextResponse } from 'next/server';
import { listDueSurveys, markSurveySent } from '@/lib/feedback/surveySchedule';
import { sendSms } from '@/lib/marketing/smsProvider';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Sends every post-deal survey whose scheduled delay has passed — same
 * "queue for real until connected" pattern as campaign sends: with no
 * UNIFONIC_API_ID/UNIFONIC_SENDER_ID configured, sendSms() reports
 * delivered:false and the survey is left unmarked so the next sweep retries
 * it once credentials exist, instead of silently dropping it. Meant to be
 * invoked on an interval by an external scheduler — see
 * scripts/campaign-scheduler-loop.ts, or Vercel Cron in production. Same
 * shared-secret pattern as /api/marketing/campaigns/due.
 */
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  if (req.headers.get('x-poll-secret') === secret) return true;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

async function handle(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const due = await listDueSurveys();
  const feedbackUrl = `${req.nextUrl.origin}/feedback`;

  let sent = 0;
  const errors: string[] = [];
  for (const s of due) {
    try {
      const message = `أومنيرا فاليه: نتمنى أن تكون تجربتكم معنا ممتازة. رأيكم يهمنا — شاركونا تقييمكم من هنا: ${feedbackUrl}`;
      const result = await sendSms(s.phone, message);
      if (result.delivered) {
        await markSurveySent(s.id);
        sent++;
      }
      // not delivered (no provider configured) -> left unmarked, retried next sweep
    } catch (err) {
      errors.push(`${s.id}: ${err instanceof Error ? err.message : 'failed'}`);
    }
  }

  return NextResponse.json({ ok: errors.length === 0, scanned: due.length, sent, errors });
}

export const POST = handle;
export const GET = handle;
