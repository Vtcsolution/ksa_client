import { NextRequest, NextResponse } from 'next/server';
import { createLeadSchema } from '@/lib/leads/types';
import { createLead, listLeads } from '@/lib/leads/store';
import { isAuthed, isServiceAuthed } from '@/lib/leads/auth';
import { notifyNewLead } from '@/lib/leads/notify';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// حد بسيط للمعدل في الذاكرة (نسخة pm2 واحدة) — 6 طلبات لكل IP خلال 10 دقائق
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
  if (hits.size > 5000) hits.clear(); // حماية من التضخم
  return arr.length > MAX_HITS;
}

// POST عام — استقبال ليد من الموقع
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

  const parsed = createLeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'validation', issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  // ملاحظة: حقل "company" كان يُستخدم كمصيدة عناكب (يتجاهل الحفظ لو مليان) —
  // أُزيل هذا السلوك لأن بعض المتصفحات الحقيقية (الإكمال التلقائي/مديرو
  // كلمات المرور) تملأ حقولاً مخفية أيضًا، فكانت تُسقط ليدز حقيقية بصمت مع
  // إظهار رسالة نجاح. الحماية من السبام الآن تعتمد على حدّ المعدّل أعلاه فقط.
  const lead = await createLead(parsed.data, {
    referrer: req.headers.get('referer') || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
    ip,
  });

  // تنبيه فوري (تليجرام إن كان مضبوطًا) — لا يؤثر على نجاح الحفظ
  await notifyNewLead(lead).catch(() => {});

  // يُنشئ نسخة حقيقية من هذا الليد داخل الـCRM فورًا (بدلاً من انتظار مراجعة
  // يدوية من "استفسارات الموقع") — يدخل نفس مسار المتابعة المرحلي كأي ليد
  // آخر. أفضل جهد فقط: فشل هذا الاستدعاء لا يجب أبدًا أن يمنع حفظ الليد نفسه.
  const crmUrl = process.env.CRM_URL;
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (crmUrl && secret) {
    fetch(`${crmUrl}/api/leads/from-website`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-secret': secret },
      body: JSON.stringify({ name: lead.name, phone: lead.phone, email: lead.email, service: lead.service, message: lead.message }),
      signal: AbortSignal.timeout(5000),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}

// GET محمي — قائمة كل الليدز (للداشبورد، أو للـCRM عبر السرّ المشترك)
export async function GET(req: NextRequest) {
  if (!isAuthed() && !isServiceAuthed(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const leads = await listLeads();
  return NextResponse.json({ ok: true, leads });
}
