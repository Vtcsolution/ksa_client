import crypto from 'crypto';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

/**
 * مصادقة الداشبورد — كوكي جلسة موقّعة بـHMAC (بدون أي اعتماديات خارجية).
 * كلها تعمل في Node runtime (route handlers + server components).
 */

export const SESSION_COOKIE = 'omnira_admin';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 أيام

function secret(): string {
  return process.env.LEADS_SESSION_SECRET || 'omnira-valet-dev-secret-change-me';
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString('base64url');
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', secret()).update(payload).digest('base64url');
}

/** ينشئ توكن جلسة موقّع مع تاريخ انتهاء */
export function issueSession(): string {
  const body = b64url(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }));
  return `${body}.${sign(body)}`;
}

/** يتحقق من صحة التوكن (توقيع + انتهاء) بمقارنة زمن-ثابت */
export function verifySession(token: string | undefined): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [body, sig] = parts;
  const expected = sign(body);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof exp === 'number' && exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function timingEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

/**
 * مقارنة كلمة المرور بزمن-ثابت.
 * الأفضلية لـ LEADS_DASHBOARD_PASSWORD_HASH (SHA-256 hex) — يسمح بكلمات مرور
 * تحتوي رموزًا خاصة دون مشاكل ترميز ملف البيئة، ولا يخزّن الكلمة الخام.
 * fallback: LEADS_DASHBOARD_PASSWORD (خام) لسهولة التغيير لكلمات بسيطة.
 */
export function checkPassword(input: string): boolean {
  const hash = process.env.LEADS_DASHBOARD_PASSWORD_HASH;
  if (hash) {
    const inputHash = crypto.createHash('sha256').update(String(input), 'utf8').digest('hex');
    return timingEqual(inputHash, hash.trim().toLowerCase());
  }
  const raw = process.env.LEADS_DASHBOARD_PASSWORD;
  if (raw) return timingEqual(String(input), raw);
  return false; // لا يُسمح بالدخول ما لم تُضبط كلمة المرور
}

export const sessionCookieOptions = {
  httpOnly: true as const,
  secure: true as const,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};

/** حارس للاستخدام داخل route handlers/مكونات الخادم */
export function isAuthed(): boolean {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/**
 * مصادقة سيرفر-إلى-سيرفر (CRM يقرأ/يحدّث بيانات الملاحظات) — سرّ مشترك عبر
 * رأس x-api-secret، بمقارنة زمن-ثابت. يُستخدم بدلاً من كوكي الجلسة عندما لا
 * يوجد متصفح مسجّل دخول (طلب قادم من omnira-crm مباشرة).
 */
export function isServiceAuthed(req: NextRequest): boolean {
  const secret = process.env.FEEDBACK_SYNC_SECRET;
  if (!secret) return false;
  const provided = req.headers.get('x-api-secret');
  if (!provided) return false;
  return timingEqual(provided, secret);
}

/**
 * فحص المصدر (CSRF) — يرفض الطلبات المغيّرة القادمة من أصل مختلف.
 * يسمح بغياب رأس Origin (طلبات نفس-الأصل، أدوات الخادم) ويقارن المضيف فقط
 * (آمن خلف بروكسي nginx حيث قد يختلف البروتوكول الداخلي).
 */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return true;
  try {
    return new URL(origin).host === req.headers.get('host');
  } catch {
    return false;
  }
}
