import { NextRequest, NextResponse } from 'next/server';
import { createTestimonialSchema } from '@/lib/testimonials/types';
import { createTestimonial, listTestimonials, listApprovedTestimonials } from '@/lib/testimonials/store';
import { isAuthed, isServiceAuthed } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// نفس حد المعدّل المستخدم في /api/leads و /api/feedback
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

// POST عام — إرسال شهادة جديدة (تبقى pending حتى تتم مراجعتها يدويًا)
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

  const parsed = createTestimonialSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // ملاحظة: "company" كان مصيدة عناكب تُسقط الحفظ بصمت — أُزيلت لأنها كانت
  // تُسقط شهادات حقيقية أيضًا (إكمال تلقائي يملأ حقولاً مخفية). الحماية من
  // السبام الآن تعتمد على حدّ المعدّل أعلاه فقط.
  const item = await createTestimonial(parsed.data);
  return NextResponse.json({ ok: true, id: item.id });
}

// GET — بدون تسجيل دخول: الشهادات المعتمدة فقط (للمكتبة العامة، قابلة للتصفية بالقطاع).
// GET — مع تسجيل الدخول: كل الشهادات (للوحة تحكم الإدارة، بما فيها المعلّقة والمرفوضة).
export async function GET(req: NextRequest) {
  const segment = req.nextUrl.searchParams.get('segment') || undefined;
  if (isAuthed() || isServiceAuthed(req)) {
    const items = await listTestimonials();
    return NextResponse.json({ ok: true, testimonials: items });
  }
  const items = await listApprovedTestimonials(segment);
  return NextResponse.json({ ok: true, testimonials: items });
}
