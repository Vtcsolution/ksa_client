'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, RefreshCw, Trash2, Star, Check, X, Sparkles, MessageSquareQuote, Clock, CheckCircle2 } from 'lucide-react';
import type { Testimonial, TestimonialStats, SegmentId } from '@/lib/testimonials/types';

const SEGMENT_LABELS: Record<SegmentId, string> = {
  hotels: 'فنادق',
  restaurants: 'مطاعم',
  malls: 'مولات',
  hospitals: 'مستشفيات',
  halls: 'قاعات',
  complexes: 'مجمّعات',
};

const STAGE_LABELS = { cold: 'عميل بارد', warm: 'عميل دافئ', hot: 'عميل جاهز للإغلاق' };

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function TestimonialsClient({
  initialTestimonials,
  initialStats,
}: {
  initialTestimonials: Testimonial[];
  initialStats: TestimonialStats;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Testimonial[]>(initialTestimonials);
  const [stats, setStats] = useState<TestimonialStats>(initialStats);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  function recompute(list: Testimonial[]) {
    let pending = 0;
    let approved = 0;
    for (const t of list) {
      if (t.status === 'pending') pending++;
      if (t.status === 'approved') approved++;
    }
    setStats({ total: list.length, pending, approved });
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/testimonials', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setItems(data.testimonials);
        recompute(data.testimonials);
      }
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  const decide = useCallback(
    async (id: string, status: 'approved' | 'rejected') => {
      setBusyId(id);
      try {
        const res = await fetch(`/api/testimonials/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        });
        if (res.status === 401) return router.replace('/dashboard/login');
        const data = await res.json();
        if (data.ok) await refresh();
      } finally {
        setBusyId(null);
      }
    },
    [router, refresh],
  );

  const removeItem = useCallback(
    async (id: string) => {
      if (!confirm('حذف هذه الشهادة نهائيًا؟')) return;
      const res = await fetch(`/api/testimonials/${id}`, { method: 'DELETE' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setItems((prev) => {
          const next = prev.filter((t) => t.id !== id);
          recompute(next);
          return next;
        });
      }
    },
    [router],
  );

  const shown = useMemo(() => (tab === 'all' ? items : items.filter((t) => t.status === tab)), [items, tab]);

  const kpis = [
    { label: 'الإجمالي', value: stats.total, icon: MessageSquareQuote, tint: 'text-white' },
    { label: 'بانتظار المراجعة', value: stats.pending, icon: Clock, tint: stats.pending ? 'text-gold-light' : 'text-white/40' },
    { label: 'منشورة', value: stats.approved, icon: CheckCircle2, tint: 'text-emerald-300' },
  ];

  const tabs: { key: typeof tab; label: string }[] = [
    { key: 'pending', label: 'بانتظار المراجعة' },
    { key: 'approved', label: 'منشورة' },
    { key: 'rejected', label: 'مرفوضة' },
    { key: 'all', label: 'الكل' },
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
              <h1 className="text-lg font-medium sm:text-xl">شهادات العملاء</h1>
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
        <div className="grid grid-cols-3 gap-3">
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

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${tab === tb.key ? 'border-gold-primary/50 bg-gold-primary/10 text-gold-light' : 'border-white/10 text-white/50 hover:text-white'}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {shown.length === 0 && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">لا توجد شهادات في هذا التصنيف.</div>
          )}
          {shown.map((t) => (
            <div key={t.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-white">{t.name}</span>
                    {t.role && <span className="text-xs text-white/40">{t.role}</span>}
                    <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/50">{SEGMENT_LABELS[t.segment]}</span>
                    {t.status === 'pending' && <span className="rounded-full border border-gold-primary/30 bg-gold-primary/10 px-2 py-0.5 text-[11px] text-gold-light">بانتظار المراجعة</span>}
                    {t.status === 'approved' && <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] text-emerald-300">منشورة</span>}
                    {t.status === 'rejected' && <span className="rounded-full border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-[11px] text-red-300">مرفوضة</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1" dir="ltr">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-3.5 w-3.5 ${n <= t.rating ? 'fill-gold-primary text-gold-primary' : 'text-white/15'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/35">{fmtDate(t.createdAt)}</span>
                  {t.status === 'pending' && (
                    <>
                      <button
                        onClick={() => decide(t.id, 'approved')}
                        disabled={busyId === t.id}
                        className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> نشر
                      </button>
                      <button
                        onClick={() => decide(t.id, 'rejected')}
                        disabled={busyId === t.id}
                        className="flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> رفض
                      </button>
                    </>
                  )}
                  <button onClick={() => removeItem(t.id)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400" aria-label="حذف">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-white/75">{t.quote}</p>

              {t.ai && (
                <div className="mt-3 rounded-xl border border-gold-primary/20 bg-black/20 p-3 text-xs">
                  <div className="mb-1.5 flex items-center gap-1.5 text-gold-light">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>توزيع مقترح بالذكاء الاصطناعي</span>
                  </div>
                  <p className="text-white/70">
                    الأنسب لمرحلة: <span className="text-white">{STAGE_LABELS[t.ai.stage]}</span> · القطاعات:{' '}
                    <span className="text-white">{t.ai.bestSegments.map((s) => SEGMENT_LABELS[s]).join('، ')}</span>
                  </p>
                  <p className="mt-1 text-white/60">{t.ai.whyAr}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
