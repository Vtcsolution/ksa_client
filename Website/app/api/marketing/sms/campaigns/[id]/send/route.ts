import { NextRequest, NextResponse } from 'next/server';
import { getSmsCampaign } from '@/lib/marketing/store';
import { sendSmsCampaignNow } from '@/lib/marketing/sendSmsCampaign';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  const campaign = await getSmsCampaign(params.id);
  if (!campaign) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  if (campaign.status !== 'draft') return NextResponse.json({ ok: false, error: 'already_sent' }, { status: 409 });

  await sendSmsCampaignNow(params.id);
  return NextResponse.json({ ok: true });
}
