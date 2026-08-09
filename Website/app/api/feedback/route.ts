import { NextRequest, NextResponse } from 'next/server';
import { createFeedbackSchema } from '@/lib/feedback/types';
import { createFeedback, listFeedback, updateFeedbackAiFlag } from '@/lib/feedback/store';
import { analyzeFeedback } from '@/lib/feedback/aiFlag';
import { isAuthed, isServiceAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// نفس حد المعدّل المستخدم في /api/leads — 6 طلبات لكل IP خلال 10 دقائق
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 6;
const hits = new Map<string, number[]>();

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hits.set(ip, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > MAX_HITS;
}

// POST عام — استقبال ملاحظة من الموقع
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const parsed = createFeedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // ملاحظة: "company" كان مصيدة عناكب تُسقط الحفظ بصمت — أُزيلت لأنها كانت
  // تُسقط ملاحظات حقيقية أيضًا (إكمال تلقائي يملأ حقولاً مخفية). الحماية من
  // السبام الآن تعتمد على حدّ المعدّل أعلاه فقط.
  const item = await createFeedback(parsed.data, {
    referrer: req.headers.get('referer') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
    ip,
  });

  // Every submission gets analyzed, regardless of star rating — a customer
  // can leave 5 stars out of habit/politeness while the written message
  // describes a real problem or a wrong suggestion, and that must still
  // reach staff. The AI itself weighs message content over the star number.
  const flag = await analyzeFeedback(item.rating, item.message);
  if (flag) await updateFeedbackAiFlag(item.id, flag);

  return NextResponse.json({ ok: true, id: item.id });
}

// GET محمي — كل الملاحظات (للداشبورد، أو للـCRM عبر السرّ المشترك)
export async function GET(req: NextRequest) {
  if (!isAuthed() && !isServiceAuthed(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const items = await listFeedback();
  return NextResponse.json({ ok: true, feedback: items });
}
