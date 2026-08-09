import { NextRequest, NextResponse } from 'next/server';
import { checkPassword, issueSession, isSameOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/lib/leads/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// حد بسيط لمحاولات الدخول لكل IP
const attempts = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const arr = (attempts.get(ip) || []).filter((t) => now - t < 15 * 60 * 1000);
  arr.push(now);
  attempts.set(ip, arr);
  return arr.length > 10;
}

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  }
  const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
  if (tooMany(ip)) {
    return NextResponse.json({ ok: false, error: 'too_many_attempts' }, { status: 429 });
  }
  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!checkPassword(body.password || '')) {
    return NextResponse.json({ ok: false, error: 'invalid_password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, issueSession(), sessionCookieOptions);
  return res;
}
