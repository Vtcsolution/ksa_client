'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Trash2, Star, MessageSquare, TrendingUp, CalendarDays, AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { Feedback, FeedbackStats } from '@/lib/feedback/types';

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function FeedbackClient({
  initialFeedback,
  initialStats,
}: {
  initialFeedback: Feedback[];
  initialStats: FeedbackStats;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Feedback[]>(initialFeedback);
  const [stats, setStats] = useState<FeedbackStats>(initialStats);
  const [refreshing, setRefreshing] = useState(false);

  function recompute(list: Feedback[]) {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    let today = 0;
    let sum = 0;
    let flagged = 0;
    for (const f of list) {
      if (new Date(f.createdAt).getTime() >= startToday) today++;
      if (f.aiFlag?.flagged && !f.resolved) flagged++;
      sum += f.rating;
    }
    setStats({ total: list.length, today, flagged, avgRating: list.length ? Math.round((sum / list.length) * 10) / 10 : 0 });
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/feedback', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) { setItems(data.feedback); recompute(data.feedback); }
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  const removeItem = useCallback(
    async (id: string) => {
      if (!confirm('حذف هذه الملاحظة نهائيًا؟')) return;
      const res = await fetch(`/api/feedback/${id}`, { method: 'DELETE' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => { const next = prev.filter((f) => f.id !== id); recompute(next); return next; });
      }
    },
    [router],
  );

  const toggleResolved = useCallback(
    async (id: string, resolved: boolean) => {
      const res = await fetch(`/api/feedback/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved }),
      });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => {
          const next = prev.map((f) => (f.id === id ? data.feedback : f));
          recompute(next);
          return next;
        });
      }
    },
    [router],
  );

  const kpis = [
    { label: 'إجمالي الملاحظات', value: stats.total, icon: MessageSquare, tint: 'text-white' },
    { label: 'اليوم', value: stats.today, icon: CalendarDays, tint: 'text-gold-light' },
    { label: 'متوسط التقييم', value: `${stats.avgRating} / 5`, icon: TrendingUp, tint: 'text-emerald-300' },
    { label: 'تحتاج متابعة', value: stats.flagged, icon: AlertTriangle, tint: stats.flagged ? 'text-red-400' : 'text-white/40' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0C]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 rounded-full border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white">
              <ArrowRight className="h-4 w-4" />
              <span className="hidden sm:inline">الليدز</span>
            </Link>
            <div>
              <h1 className="text-lg font-medium sm:text-xl">ملاحظات العملاء</h1>
              <p className="text-xs text-white/40">أومنيرا فاليه</p>
            </div>
          </div>
          <button onClick={refresh} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/45">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.tint} opacity-70`} />
              </div>
              <div className={`text-2xl font-light sm:text-3xl ${k.tint}`}>{k.value}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {items.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">
              لا توجد ملاحظات بعد.
            </div>
          )}
          {items.map((f) => {
            const flag = f.aiFlag;
            const urgencyTint =
              flag?.urgency === 'high' ? 'border-red-500/40 bg-red-500/[0.06]' : flag?.urgency === 'medium' ? 'border-amber-500/30 bg-amber-500/[0.05]' : '';
            const needsAttention = !!flag?.flagged && !f.resolved;
            return (
              <div
                key={f.id}
                className={`rounded-2xl border p-5 ${needsAttention ? urgencyTint : 'border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015]'}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{f.name}</span>
                      {f.email && <span className="text-xs text-white/40" dir="ltr">{f.email}</span>}
                      {f.resolved && (
                        <span className="flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          تم الحل
                        </span>
                      )}
                      {needsAttention && (
                        <span className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">
                          <AlertTriangle className="h-3 w-3" />
                          خطورة {flag!.severityPct}٪
                        </span>
                      )}
                      {needsAttention && !!f.notifyCount && f.notifyCount > 0 && (
                        <span className="text-[11px] text-red-300/70">تم التنبيه {f.notifyCount} مرة</span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1" dir="ltr">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-3.5 w-3.5 ${n <= f.rating ? 'fill-gold-primary text-gold-primary' : 'text-white/15'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/35">{fmtDate(f.createdAt)}</span>
                    {flag?.flagged && (
                      <button
                        onClick={() => toggleResolved(f.id, !f.resolved)}
                        className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${f.resolved ? 'border-white/15 text-white/50 hover:text-white' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'}`}
                      >
                        {f.resolved ? 'إعادة فتح' : 'تعليم كمحلولة'}
                      </button>
                    )}
                    <button onClick={() => removeItem(f.id)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400" aria-label="حذف">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-white/75">{f.message}</p>
                {f.pagePath && <p className="mt-2 text-[11px] text-white/30">من صفحة: {f.pagePath}</p>}
                {flag?.flagged && (
                  <div className="mt-3 rounded-xl border border-red-500/20 bg-black/20 p-3 text-xs">
                    <p className="text-red-300">سبب: {flag.reasonAr}</p>
                    <p className="mt-1 text-white/60">الإجراء المقترح: {flag.suggestedActionAr}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
