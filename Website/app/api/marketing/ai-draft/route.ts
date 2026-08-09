import { NextRequest, NextResponse } from 'next/server';
import { draftCampaign } from '@/lib/marketing/aiDraft';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const brief = typeof body?.brief === 'string' ? body.brief.trim() : '';
  if (!brief || brief.length < 3) return NextResponse.json({ ok: false, error: 'brief_required' }, { status: 422 });

  const draft = await draftCampaign(brief);
  if (!draft) return NextResponse.json({ ok: false, error: 'ai_unavailable' }, { status: 502 });
  return NextResponse.json({ ok: true, draft });
}
