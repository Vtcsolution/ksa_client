import { NextRequest, NextResponse } from 'next/server';
import { decideTestimonial, deleteTestimonial, setTestimonialAiMeta } from '@/lib/testimonials/store';
import { classifyTestimonial } from '@/lib/testimonials/aiClassify';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  const status = (body as { status?: string }).status;
  if (status !== 'approved' && status !== 'rejected') {
    return NextResponse.json({ ok: false, error: 'invalid_status' }, { status: 422 });
  }

  const item = await decideTestimonial(params.id, status);
  if (!item) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });

  // AI classification only matters once something is actually going public —
  // never spend a call on a testimonial that just got rejected.
  if (status === 'approved') {
    const ai = await classifyTestimonial(item.segment, item.rating, item.quote);
    if (ai) await setTestimonialAiMeta(item.id, ai);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const done = await deleteTestimonial(params.id);
  if (!done) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
