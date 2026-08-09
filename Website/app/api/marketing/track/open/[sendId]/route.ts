import { NextResponse } from 'next/server';
import { markSendEvent } from '@/lib/marketing/store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// 1x1 transparent GIF, served regardless of outcome — a tracking pixel must never break email rendering.
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7', 'base64');

export async function GET(_req: Request, { params }: { params: { sendId: string } }) {
  await markSendEvent(params.sendId, 'opened').catch(() => {});
  return new NextResponse(PIXEL, { headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store' } });
}
