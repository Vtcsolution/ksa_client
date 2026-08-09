import { NextRequest, NextResponse } from 'next/server';
import { markSendEvent } from '@/lib/marketing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { sendId: string } }) {
  await markSendEvent(params.sendId, 'clicked').catch(() => {});
  const target = req.nextUrl.searchParams.get('url');
  return NextResponse.redirect(target && target.startsWith('http') ? target : new URL('/', req.url));
}
