import { NextRequest, NextResponse } from 'next/server';
import { createCampaignSchema } from '@/lib/marketing/types';
import { createCampaign, listCampaigns, listSendsByCampaign } from '@/lib/marketing/store';
import { buildAudience } from '@/lib/marketing/audience';
import { isAuthed, isServiceAuthed, isSameOrigin } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manager-only end to end (dashboard session or CRM shared secret) — unlike leads/feedback there's no public submission side to this API.
export async function GET(req: NextRequest) {
  if (!isAuthed() && !isServiceAuthed(req)) return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  const campaigns = await listCampaigns();
  // open/click counts are derived live from email_sends (the source of truth
  // the tracking pixel/link routes write to) rather than incremented in place,
  // so concurrent opens/clicks can never race a stored counter out of sync.
  const withStats = await Promise.all(
    campaigns.map(async (c) => {
      if (c.status === 'draft') return c;
      const sends = await listSendsByCampaign(c.id);
      const openCount = sends.filter((s) => s.status === 'opened' || s.status === 'clicked').length;
      const clickCount = sends.filter((s) => s.status === 'clicked').length;
      return { ...c, openCount, clickCount };
    }),
  );
  return NextResponse.json({ ok: true, campaigns: withStats });
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

  const parsed = createCampaignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'validation', issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const audienceFilter = { status: parsed.data.status, service: parsed.data.service || undefined };
  const audience = await buildAudience(audienceFilter);

  const campaign = await createCampaign({
    name: parsed.data.name,
    subject: parsed.data.subject,
    bodyHtml: parsed.data.bodyHtml,
    audienceFilter,
    scheduledAt: parsed.data.scheduledAt || undefined,
    recipientCount: audience.length,
  });

  return NextResponse.json({ ok: true, campaign });
}
