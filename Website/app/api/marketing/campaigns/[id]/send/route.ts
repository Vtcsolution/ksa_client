import { NextRequest, NextResponse } from 'next/server';
import { getCampaign } from '@/lib/marketing/store';
import { sendCampaignNow } from '@/lib/marketing/sendCampaign';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const campaign = await getCampaign(params.id);
  if (!campaign) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (campaign.status !== 'draft') return NextResponse.json({ ok: false, error: 'already_sent' }, { status: 409 });

  await sendCampaignNow(params.id, req.nextUrl.origin);
  return NextResponse.json({ ok: true });
}
