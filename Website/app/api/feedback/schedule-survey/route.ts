import { NextRequest, NextResponse } from 'next/server';
import { scheduleSurvey } from '@/lib/feedback/surveySchedule';
import { isServiceAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Called by the CRM the moment a lead is marked won (see
 * mutations.ts:setResultWon) — schedules a post-deal feedback survey SMS a
 * few days out rather than sending immediately (a customer mid-contract
 * signing isn't ready to rate the service yet). Shared-secret only: no
 * session path, since the caller is always the CRM server, never a browser.
 */
export async function POST(req: NextRequest) {
  if (!isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
  const delayDays = Number.isFinite(body?.delayDays) ? Number(body.delayDays) : 3;
  if (!name || !phone) return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 422 });

  const survey = await scheduleSurvey(name, phone, delayDays);
  return NextResponse.json({ ok: true, survey });
}
