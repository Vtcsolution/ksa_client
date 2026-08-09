import { NextRequest, NextResponse } from 'next/server';
import { deleteFeedback, setFeedbackResolved } from '@/lib/feedback/store';
import { isAuthed, isSameOrigin, isServiceAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const done = await deleteFeedback(params.id);
  if (!done) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

// PATCH — تبديل حالة "تم الحل"، من الداشبورد أو من لوحة المدير في الـCRM
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  if (!isAuthed() && !isServiceAuthed(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const resolved = body?.resolved;
  if (typeof resolved !== 'boolean') {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 422 });
  }
  const item = await setFeedbackResolved(params.id, resolved);
  if (!item) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true, feedback: item });
}
