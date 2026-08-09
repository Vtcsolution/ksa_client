import { NextResponse } from 'next/server';
import { listLeads } from '@/lib/leads/store';
import { isAuthed } from '@/lib/leads/auth';
import { STATUS_LABEL_AR } from '@/lib/leads/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function csvCell(v: unknown): string {
  const s = v == null ? '' : String(v);
  return `"${s.replace(/"/g, '""')}"`;
}

// GET محمي — تصدير كل الليدز كملف CSV (يفتح في Excel بترميز عربي سليم)
export async function GET() {
  if (!isAuthed()) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const leads = await listLeads();
  const headers = ['التاريخ', 'الاسم', 'الجوال', 'البريد', 'الخدمة', 'الحالة', 'الأولوية', 'المصدر', 'الرسالة'];
  const rows = leads.map((l) =>
    [
      new Date(l.createdAt).toLocaleString('ar-EG'),
      l.name,
      l.phone,
      l.email || '',
      l.service || '',
      STATUS_LABEL_AR[l.status],
      l.priority === 'high' ? 'عالية' : 'عادية',
      l.source || '',
      (l.message || '').replace(/\r?\n/g, ' '),
    ]
      .map(csvCell)
      .join(','),
  );
  const csv = '﻿' + [headers.map(csvCell).join(','), ...rows].join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="omnira-leads-${stamp}.csv"`,
    },
  });
}
