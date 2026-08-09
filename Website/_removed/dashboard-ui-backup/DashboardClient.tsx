'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search, RefreshCw, Download, LogOut, Phone, MessageCircle, Mail, Star,
  Trash2, X, Users, Sparkles, CalendarDays, Trophy, Flame, StickyNote, TrendingUp, ArrowDownUp,
  MessageSquare, Gift, MessageSquareQuote,
} from 'lucide-react';
import type { Lead, LeadStatus, LeadStats } from '@/lib/leads/types';
import { LEAD_STATUSES, STATUS_LABEL_AR } from '@/lib/leads/types';
// NOTE: types only — never import from lib/leads/store here (pulls fs into the client bundle)

const SERVICE_LABEL: Record<string, string> = {
  'parking-management': 'إدارة وتشغيل المواقف',
  'valet-parking': 'خدمات الفاليه باركينج',
  'advanced-technology': 'التقنيات المتقدمة',
  'professional-organizers': 'المنظمين المحترفين',
  consultation: 'الاستشارات',
  'golf-cart': 'جولف كار',
  'support-services': 'خدمات مساندة',
  'car-wash': 'غسيل السيارات',
};

const SOURCE_LABEL: Record<string, string> = {
  contact: 'نموذج التواصل',
  hero: 'الواجهة الرئيسية',
  pricing: 'صفحة الأسعار',
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-gold-primary/15 text-gold-light border-gold-primary/30',
  contacted: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  qualified: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  won: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  lost: 'bg-white/5 text-white/40 border-white/10',
  archived: 'bg-white/5 text-white/35 border-white/10',
};

type SortKey = 'newest' | 'oldest' | 'name' | 'priority';
const SORT_LABEL: Record<SortKey, string> = {
  newest: 'الأحدث أولًا',
  oldest: 'الأقدم أولًا',
  name: 'الاسم (أ-ي)',
  priority: 'الأولوية',
};

function waLink(phone: string, name: string): string {
  let d = phone.replace(/[^\d]/g, '');
  if (d.startsWith('00')) d = d.slice(2);
  if (d.startsWith('0')) d = '966' + d.slice(1);
  else if (!d.startsWith('966')) d = '966' + d;
  const msg = encodeURIComponent(`مرحبًا ${name}، معك فريق أومنيرا فاليه بخصوص طلبك.`);
  return `https://wa.me/${d}?text=${msg}`;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}
function serviceLabel(s?: string) {
  return s ? SERVICE_LABEL[s] || s : '—';
}
function sourceLabel(s?: string) {
  return s ? SOURCE_LABEL[s] || s : '—';
}

export default function DashboardClient({
  initialLeads,
  initialStats,
}: {
  initialLeads: Lead[];
  initialStats: LeadStats;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [stats, setStats] = useState<LeadStats>(initialStats);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [dateRange, setDateRange] = useState<'all' | 'today' | '7d' | '30d'>('all');
  const [selected, setSelected] = useState<Lead | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');

  function recompute(list: Lead[]) {
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekAgo = now.getTime() - 7 * 864e5;
    const byStatus = Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as Record<LeadStatus, number>;
    let today = 0, week = 0;
    for (const l of list) {
      byStatus[l.status]++;
      const t = new Date(l.createdAt).getTime();
      if (t >= startToday) today++;
      if (t >= weekAgo) week++;
    }
    setStats({ total: list.length, today, week, byStatus });
  }

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/leads', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) { setLeads(data.leads); recompute(data.leads); }
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    const t = setInterval(refresh, 60_000);
    return () => clearInterval(t);
  }, [refresh]);

  const patchLead = useCallback(
    async (id: string, patch: Record<string, unknown>) => {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setLeads((prev) => { const next = prev.map((l) => (l.id === id ? data.lead : l)); recompute(next); return next; });
        setSelected((s) => (s && s.id === id ? data.lead : s));
      }
    },
    [router],
  );

  const removeLead = useCallback(
    async (id: string) => {
      if (!confirm('حذف هذا الليد نهائيًا؟')) return;
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setLeads((prev) => { const next = prev.filter((l) => l.id !== id); recompute(next); return next; });
        setSelected(null);
      }
    },
    [router],
  );

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/dashboard/login');
    router.refresh();
  };

  // ===== analytics (over ALL leads) =====
  const analytics = useMemo(() => {
    const now = new Date();
    // last 14 days
    const days: { key: string; label: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      days.push({ key: d.toDateString(), label: `${d.getDate()}`, count: 0 });
    }
    const dayIndex = new Map(days.map((d, i) => [d.key, i]));
    const svc = new Map<string, number>();
    const src = new Map<string, number>();
    for (const l of leads) {
      const k = new Date(l.createdAt).toDateString();
      const di = dayIndex.get(k);
      if (di !== undefined) days[di].count++;
      const s = l.service || 'unspecified';
      svc.set(s, (svc.get(s) || 0) + 1);
      const so = l.source || 'unspecified';
      src.set(so, (src.get(so) || 0) + 1);
    }
    const maxDay = Math.max(1, ...days.map((d) => d.count));
    const byService = [...svc.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
    const bySource = [...src.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4);
    const decided = stats.byStatus.won + stats.byStatus.lost;
    const conversion = decided > 0 ? Math.round((stats.byStatus.won / decided) * 100) : 0;
    return { days, maxDay, byService, bySource, conversion };
  }, [leads, stats]);

  // phone → count (لكشف الأرقام المكررة)
  const phoneCounts = useMemo(() => {
    const m = new Map<string, number>();
    leads.forEach((l) => m.set(l.phone, (m.get(l.phone) || 0) + 1));
    return m;
  }, [leads]);

  // ===== filtered + sorted =====
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const now = new Date();
    let rangeStart = 0;
    if (dateRange === 'today') rangeStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    else if (dateRange === '7d') rangeStart = now.getTime() - 7 * 864e5;
    else if (dateRange === '30d') rangeStart = now.getTime() - 30 * 864e5;
    const list = leads.filter((l) => {
      if (statusFilter !== 'all' && l.status !== statusFilter) return false;
      if (serviceFilter !== 'all' && (l.service || 'unspecified') !== serviceFilter) return false;
      if (rangeStart && new Date(l.createdAt).getTime() < rangeStart) return false;
      if (!q) return true;
      return (
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        (l.email || '').toLowerCase().includes(q) ||
        (l.message || '').toLowerCase().includes(q) ||
        serviceLabel(l.service).toLowerCase().includes(q)
      );
    });
    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return a.createdAt < b.createdAt ? -1 : 1;
        case 'name': return a.name.localeCompare(b.name, 'ar');
        case 'priority':
          if (a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
          return a.createdAt < b.createdAt ? 1 : -1;
        default: return a.createdAt < b.createdAt ? 1 : -1;
      }
    });
    return list;
  }, [leads, query, statusFilter, serviceFilter, sortBy, dateRange]);

  const serviceOptions = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => set.add(l.service || 'unspecified'));
    return [...set];
  }, [leads]);

  function exportCSV() {
    const headers = ['التاريخ', 'الاسم', 'الجوال', 'البريد', 'الخدمة', 'الحالة', 'الأولوية', 'المصدر', 'الرسالة'];
    const cell = (v: unknown) => `"${(v == null ? '' : String(v)).replace(/"/g, '""')}"`;
    const rows = filtered.map((l) =>
      [
        new Date(l.createdAt).toLocaleString('ar-EG'), l.name, l.phone, l.email || '',
        serviceLabel(l.service), STATUS_LABEL_AR[l.status], l.priority === 'high' ? 'عالية' : 'عادية',
        sourceLabel(l.source), (l.message || '').replace(/\r?\n/g, ' '),
      ].map(cell).join(','),
    );
    const csv = '﻿' + [headers.map(cell).join(','), ...rows].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnira-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const kpis = [
    { label: 'إجمالي الليدز', value: stats.total, icon: Users, tint: 'text-white' },
    { label: 'اليوم', value: stats.today, icon: CalendarDays, tint: 'text-gold-light' },
    { label: 'هذا الأسبوع', value: stats.week, icon: Sparkles, tint: 'text-blue-300' },
    { label: 'جديدة', value: stats.byStatus.new, icon: Flame, tint: 'text-gold-light' },
    { label: 'صفقات ناجحة', value: stats.byStatus.won, icon: Trophy, tint: 'text-emerald-300' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white" dir="rtl">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0A0A0C]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <h1 className="text-lg font-medium sm:text-xl">لوحة الليدز</h1>
            <p className="text-xs text-white/40">أومنيرا فاليه</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/feedback" className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">الملاحظات</span>
            </Link>
            <Link href="/dashboard/testimonials" className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
              <MessageSquareQuote className="h-4 w-4" />
              <span className="hidden sm:inline">الشهادات</span>
            </Link>
            <Link href="/dashboard/marketing" className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">التسويق</span>
            </Link>
            <button onClick={refresh} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">تحديث</span>
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">تصدير CSV</span>
            </button>
            <button onClick={logout} className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-red-500/40 hover:text-red-300">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kpis.map((k) => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/45">{k.label}</span>
                <k.icon className={`h-4 w-4 ${k.tint} opacity-70`} />
              </div>
              <div className={`text-3xl font-light ${k.tint}`}>{k.value}</div>
            </div>
          ))}
        </div>

        {/* analytics */}
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-3">
          {/* 14-day trend */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs text-white/50"><TrendingUp className="h-4 w-4 text-gold-primary/70" /> الليدز خلال 14 يومًا</span>
              <span className="text-xs text-white/35">المجموع {analytics.days.reduce((s, d) => s + d.count, 0)}</span>
            </div>
            <div className="flex h-28 items-end gap-1.5">
              {analytics.days.map((d, i) => (
                <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-gold-primary/40 to-gold-primary transition-all group-hover:from-gold-primary group-hover:to-gold-light"
                    style={{ height: `${Math.max(4, (d.count / analytics.maxDay) * 100)}%` }}
                    title={`${d.count} ليد`}
                  />
                  <span className="mt-1.5 text-[9px] text-white/30">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* by service + conversion */}
          <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-white/50">حسب الخدمة</span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">تحويل {analytics.conversion}%</span>
            </div>
            <div className="space-y-2.5">
              {analytics.byService.length === 0 && <p className="text-xs text-white/30">لا بيانات بعد.</p>}
              {analytics.byService.map(([svc, count]) => {
                const pct = Math.round((count / Math.max(1, stats.total)) * 100);
                return (
                  <div key={svc}>
                    <div className="mb-1 flex items-center justify-between text-[11px]">
                      <span className="text-white/60">{svc === 'unspecified' ? 'غير محدّد' : serviceLabel(svc)}</span>
                      <span className="text-white/40">{count}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-gold-primary/70" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* controls */}
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="بحث بالاسم، الجوال، البريد، الرسالة…"
                className="w-full rounded-full border border-white/10 bg-white/[0.03] py-3 pr-11 pl-4 text-sm text-white placeholder:text-white/30 focus:border-gold-primary/50 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                {([['all', 'الكل'], ['today', 'اليوم'], ['7d', '٧ أيام'], ['30d', '٣٠ يوم']] as const).map(([v, l]) => (
                  <button
                    key={v}
                    onClick={() => setDateRange(v)}
                    className={`rounded-full px-3 py-1.5 text-xs transition-colors ${dateRange === v ? 'bg-gold-primary/15 text-gold-light' : 'text-white/45 hover:text-white'}`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white/70 focus:border-gold-primary/50 focus:outline-none"
              >
                <option value="all">كل الخدمات</option>
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>{s === 'unspecified' ? 'غير محدّد' : serviceLabel(s)}</option>
                ))}
              </select>
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <ArrowDownUp className="h-3.5 w-3.5 text-white/40" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortKey)}
                  className="bg-transparent text-xs text-white/70 focus:outline-none"
                >
                  {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                    <option key={k} value={k} className="bg-[#0E0E12]">{SORT_LABEL[k]}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterChip active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>الكل ({leads.length})</FilterChip>
            {LEAD_STATUSES.map((s) => (
              <FilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
                {STATUS_LABEL_AR[s]} ({stats.byStatus[s]})
              </FilterChip>
            ))}
          </div>
        </div>

        {/* table */}
        <div className="mt-5 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-right text-sm">
              <thead className="bg-white/[0.03] text-xs text-white/45">
                <tr>
                  <th className="px-4 py-3 font-medium"></th>
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">الجوال</th>
                  <th className="px-4 py-3 font-medium">الخدمة</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">التاريخ</th>
                  <th className="px-4 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-16 text-center text-white/40">لا توجد ليدز مطابقة.</td></tr>
                )}
                {filtered.map((l) => (
                  <tr key={l.id} onClick={() => { setSelected(l); setNoteDraft(''); }} className="cursor-pointer border-t border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-4">
                      <button onClick={(e) => { e.stopPropagation(); patchLead(l.id, { starred: !l.starred }); }} aria-label="تمييز">
                        <Star className={`h-4 w-4 ${l.starred ? 'fill-gold-primary text-gold-primary' : 'text-white/25'}`} />
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2 font-medium text-white">
                        {l.priority === 'high' && <Flame className="h-3.5 w-3.5 text-red-400" />}
                        {l.name}
                        {(phoneCounts.get(l.phone) || 0) > 1 && (
                          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-300" title="رقم مكرّر">مكرّر</span>
                        )}
                        {l.referralCode && (
                          <span className="rounded-full border border-gold-primary/30 bg-gold-primary/10 px-2 py-0.5 text-[10px] text-gold-light" title={`كود إحالة: ${l.referralCode}`}>إحالة</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4" dir="ltr"><span className="text-white/70">{l.phone}</span></td>
                    <td className="px-4 py-4 text-white/60">{serviceLabel(l.service)}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block rounded-full border px-3 py-1 text-[11px] ${STATUS_STYLE[l.status]}`}>{STATUS_LABEL_AR[l.status]}</span>
                    </td>
                    <td className="px-4 py-4 text-white/45">{fmtDate(l.createdAt)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <a href={`tel:${l.phone}`} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-gold-primary" aria-label="اتصال"><Phone className="h-4 w-4" /></a>
                        <a href={waLink(l.phone, l.name)} target="_blank" rel="noopener noreferrer" className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-emerald-400" aria-label="واتساب"><MessageCircle className="h-4 w-4" /></a>
                        {l.email && <a href={`mailto:${l.email}`} className="rounded-lg p-2 text-white/50 hover:bg-white/5 hover:text-blue-300" aria-label="بريد"><Mail className="h-4 w-4" /></a>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-xs text-white/35">عرض {filtered.length} من {leads.length} ليد</p>
      </main>

      {/* detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setSelected(null)}>
          <div className="flex-1 bg-black/60 backdrop-blur-sm" />
          <aside className="h-full w-full max-w-md overflow-y-auto border-r border-white/10 bg-[#0E0E12] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium">{selected.name}</h2>
                  <button onClick={() => patchLead(selected.id, { starred: !selected.starred })} aria-label="تمييز">
                    <Star className={`h-4 w-4 ${selected.starred ? 'fill-gold-primary text-gold-primary' : 'text-white/30'}`} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-white/40">وصل {fmtDate(selected.createdAt)}</p>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 text-white/50 hover:bg-white/5" aria-label="إغلاق"><X className="h-5 w-5" /></button>
            </div>

            <div className="mb-6 grid grid-cols-3 gap-2">
              <a href={`tel:${selected.phone}`} className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs text-white/70 hover:border-gold-primary/40"><Phone className="h-4 w-4 text-gold-primary" /> اتصال</a>
              <a href={waLink(selected.phone, selected.name)} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs text-white/70 hover:border-emerald-500/40"><MessageCircle className="h-4 w-4 text-emerald-400" /> واتساب</a>
              <a href={selected.email ? `mailto:${selected.email}` : undefined} className={`flex flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-xs ${selected.email ? 'text-white/70 hover:border-blue-500/40' : 'pointer-events-none opacity-40'}`}><Mail className="h-4 w-4 text-blue-300" /> بريد</a>
            </div>

            {(phoneCounts.get(selected.phone) || 0) > 1 && (
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300">
                <span>⚠</span> هذا الرقم قدّم {phoneCounts.get(selected.phone)} طلبات — عميل متكرّر.
              </div>
            )}
            <dl className="mb-6 space-y-3 text-sm">
              <Field label="الجوال"><span dir="ltr">{selected.phone}</span></Field>
              {selected.email && <Field label="البريد">{selected.email}</Field>}
              <Field label="الخدمة">{serviceLabel(selected.service)}</Field>
              <Field label="المصدر">{sourceLabel(selected.source)}{selected.pagePath ? ` · ${selected.pagePath}` : ''}</Field>
              {selected.referralCode && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-gold-primary/25 bg-gold-primary/5 px-3 py-2">
                  <dt className="flex items-center gap-1.5 text-xs text-gold-light"><Gift className="h-3.5 w-3.5" /> كود إحالة</dt>
                  <dd className="font-medium text-gold-light" dir="ltr">{selected.referralCode}</dd>
                </div>
              )}
              {selected.message && (
                <div>
                  <dt className="mb-1 text-xs text-white/40">الرسالة</dt>
                  <dd className="rounded-xl border border-white/10 bg-white/[0.02] p-3 leading-relaxed text-white/75">{selected.message}</dd>
                </div>
              )}
            </dl>

            <div className="mb-5">
              <label className="mb-2 block text-xs text-white/40">الحالة</label>
              <div className="flex flex-wrap gap-1.5">
                {LEAD_STATUSES.map((s) => (
                  <button key={s} onClick={() => patchLead(selected.id, { status: s })} className={`rounded-full border px-3 py-1.5 text-[11px] transition-colors ${selected.status === s ? STATUS_STYLE[s] : 'border-white/10 text-white/45 hover:text-white'}`}>
                    {STATUS_LABEL_AR[s]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
              <span className="flex items-center gap-2 text-sm text-white/70"><Flame className="h-4 w-4 text-red-400" /> أولوية عالية</span>
              <button onClick={() => patchLead(selected.id, { priority: selected.priority === 'high' ? 'normal' : 'high' })} className={`relative h-6 w-11 rounded-full transition-colors ${selected.priority === 'high' ? 'bg-gold-primary' : 'bg-white/15'}`} aria-label="تبديل الأولوية">
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${selected.priority === 'high' ? 'right-0.5' : 'right-[22px]'}`} />
              </button>
            </div>

            <div className="mb-6">
              <label className="mb-2 flex items-center gap-2 text-xs text-white/40"><StickyNote className="h-3.5 w-3.5" /> الملاحظات</label>
              <div className="space-y-2">
                {(selected.notes || []).map((n, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-white/75">
                    <p>{n.text}</p>
                    <p className="mt-1 text-[10px] text-white/35">{fmtDate(n.at)}</p>
                  </div>
                ))}
                {(!selected.notes || selected.notes.length === 0) && <p className="text-xs text-white/30">لا ملاحظات بعد.</p>}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && noteDraft.trim()) { patchLead(selected.id, { addNote: noteDraft.trim() }); setNoteDraft(''); } }}
                  placeholder="أضف ملاحظة…"
                  className="flex-1 rounded-xl border border-white/10 bg-[#131318] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-gold-primary/50 focus:outline-none"
                />
                <button onClick={() => { if (noteDraft.trim()) { patchLead(selected.id, { addNote: noteDraft.trim() }); setNoteDraft(''); } }} className="rounded-xl bg-gold-primary px-4 text-sm font-medium text-[#0A0A0C] hover:bg-gold-light">إضافة</button>
              </div>
            </div>

            <button onClick={() => removeLead(selected.id)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10">
              <Trash2 className="h-4 w-4" /> حذف الليد
            </button>
          </aside>
        </div>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full border px-3.5 py-2 text-xs transition-colors ${active ? 'border-gold-primary/50 bg-gold-primary/10 text-gold-light' : 'border-white/10 text-white/50 hover:text-white'}`}>
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-xs text-white/40">{label}</dt>
      <dd className="text-white/80">{children}</dd>
    </div>
  );
}
