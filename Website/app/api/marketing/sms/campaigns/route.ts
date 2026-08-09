import { NextRequest, NextResponse } from 'next/server';
import { createSmsCampaignSchema } from '@/lib/marketing/types';
import { createSmsCampaign, listSmsCampaigns } from '@/lib/marketing/store';
import { buildSmsAudience } from '@/lib/marketing/audience';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const campaigns = await listSmsCampaigns();
  return NextResponse.json({ ok: true, campaigns });
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = createSmsCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'validation', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const audienceFilter = { status: parsed.data.status, service: parsed.data.service || undefined };
  const audience = await buildSmsAudience(audienceFilter);

  const campaign = await createSmsCampaign({
    name: parsed.data.name,
    message: parsed.data.message,
    audienceFilter,
    recipientCount: audience.length,
  });

  return NextResponse.json({ ok: true, campaign });
}
