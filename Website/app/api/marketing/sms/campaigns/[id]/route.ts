import { NextRequest, NextResponse } from 'next/server';
import { deleteSmsCampaign } from '@/lib/marketing/store';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const done = await deleteSmsCampaign(params.id);
  if (!done) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
