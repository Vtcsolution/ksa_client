'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRight, RefreshCw, Trash2, Send, Sparkles, Loader2, Mail, MousePointerClick, Eye, Users,
  MessageCircle, MessageSquareText, Clock,
} from 'lucide-react';
import type { EmailCampaign, SmsCampaign } from '@/lib/marketing/types';
import type { LeadStatus } from '@/lib/leads/types';

const STATUS_OPTIONS: { value: LeadStatus | ''; label: string }[] = [
  { value: '', label: 'كل الحالات' },
  { value: 'new', label: 'جديد' },
  { value: 'contacted', label: 'تم التواصل' },
  { value: 'qualified', label: 'مؤهّل' },
  { value: 'won', label: 'صفقة ناجحة' },
  { value: 'lost', label: 'مغلق' },
];

const SERVICE_OPTIONS = [
  { value: '', label: 'كل الخدمات' },
  { value: 'parking-management', label: 'إدارة وتشغيل المواقف' },
  { value: 'valet-parking', label: 'خدمات الفاليه باركينج' },
  { value: 'advanced-technology', label: 'التقنيات المتقدمة' },
  { value: 'professional-organizers', label: 'المنظمين المحترفين' },
  { value: 'consultation', label: 'الاستشارات' },
  { value: 'golf-cart', label: 'جولف كار' },
  { value: 'support-services', label: 'خدمات مساندة' },
  { value: 'car-wash', label: 'غسيل السيارات' },
];

const STATUS_LABEL: Record<string, string> = { draft: 'مسودة', sending: 'جارٍ الإرسال', sent: 'أُرسلت', failed: 'فشلت' };
const STATUS_CLS: Record<string, string> = {
  draft: 'border-white/20 text-white/60',
  sending: 'border-gold-primary/30 bg-gold-primary/10 text-gold-light',
  sent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  failed: 'border-red-500/30 bg-red-500/10 text-red-300',
};

const inputCls =
  'w-full px-4 py-2.5 bg-[#131318] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-gold-primary/60 focus:ring-2 focus:ring-gold-primary/10 focus:outline-none transition-all text-sm';

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ar-EG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

type Tab = 'email' | 'sms' | 'whatsapp';

export default function MarketingClient({ initialCampaigns, hasResendKey }: { initialCampaigns: EmailCampaign[]; hasResendKey: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('email');

  // ===== Email =====
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [brief, setBrief] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestedTime, setSuggestedTime] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [status, setStatus] = useState<LeadStatus | ''>('');
  const [service, setService] = useState('');
  const [creating, setCreating] = useState(false);

  // ===== SMS =====
  const [smsCampaigns, setSmsCampaigns] = useState<SmsCampaign[]>([]);
  const [smsLoaded, setSmsLoaded] = useState(false);
  const [smsBusyId, setSmsBusyId] = useState<string | null>(null);
  const [smsName, setSmsName] = useState('');
  const [smsMessage, setSmsMessage] = useState('');
  const [smsStatus, setSmsStatus] = useState<LeadStatus | ''>('');
  const [smsService, setSmsService] = useState('');
  const [smsCreating, setSmsCreating] = useState(false);

  // ===== WhatsApp =====
  const [waTotal, setWaTotal] = useState(0);
  const [waItems, setWaItems] = useState<{ id: string; leadName: string; message: string; at: string }[]>([]);
  const [waLoaded, setWaLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await fetch('/api/marketing/campaigns', { cache: 'no-store' });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) setCampaigns(data.campaigns);
    } finally {
      setRefreshing(false);
    }
  }, [router]);

  const refreshSms = useCallback(async () => {
    const res = await fetch('/api/marketing/sms/campaigns', { cache: 'no-store' });
    if (res.status === 401) return router.replace('/dashboard/login');
    const data = await res.json();
    if (data.ok) setSmsCampaigns(data.campaigns);
    setSmsLoaded(true);
  }, [router]);

  const refreshWhatsapp = useCallback(async () => {
    const res = await fetch('/api/marketing/whatsapp-summary', { cache: 'no-store' });
    if (res.status === 401) return router.replace('/dashboard/login');
    const data = await res.json();
    if (data.ok) {
      setWaTotal(data.total);
      setWaItems(data.items);
    }
    setWaLoaded(true);
  }, [router]);

  useEffect(() => {
    if (tab === 'sms' && !smsLoaded) refreshSms();
    if (tab === 'whatsapp' && !waLoaded) refreshWhatsapp();
  }, [tab, smsLoaded, waLoaded, refreshSms, refreshWhatsapp]);

  const aiDraft = useCallback(async () => {
    if (!brief.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch('/api/marketing/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setSubject(data.draft.subject);
        setBodyHtml(data.draft.bodyHtml);
        setSuggestedTime(data.draft.suggestedSendTime);
        if (!name) setName(brief.slice(0, 60));
      }
    } finally {
      setAiLoading(false);
    }
  }, [brief, name, router]);

  const createDraft = useCallback(async () => {
    if (!name.trim() || !subject.trim() || !bodyHtml.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, subject, bodyHtml, status: status || undefined, service: service || undefined }),
      });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setName('');
        setSubject('');
        setBodyHtml('');
        setBrief('');
        setSuggestedTime('');
        setStatus('');
        setService('');
        await refresh();
      }
    } finally {
      setCreating(false);
    }
  }, [name, subject, bodyHtml, status, service, router, refresh]);

  const sendCampaign = useCallback(
    async (id: string) => {
      if (!confirm('إرسال هذه الحملة الآن؟')) return;
      setBusyId(id);
      try {
        await fetch(`/api/marketing/campaigns/${id}/send`, { method: 'POST' });
        await refresh();
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  const removeCampaign = useCallback(async (id: string) => {
    if (!confirm('حذف هذه الحملة نهائيًا؟')) return;
    const res = await fetch(`/api/marketing/campaigns/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) setCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const createSmsDraft = useCallback(async () => {
    if (!smsName.trim() || !smsMessage.trim()) return;
    setSmsCreating(true);
    try {
      const res = await fetch('/api/marketing/sms/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: smsName, message: smsMessage, status: smsStatus || undefined, service: smsService || undefined }),
      });
      if (res.status === 401) return router.replace('/dashboard/login');
      const data = await res.json();
      if (data.ok) {
        setSmsName('');
        setSmsMessage('');
        setSmsStatus('');
        setSmsService('');
        await refreshSms();
      }
    } finally {
      setSmsCreating(false);
    }
  }, [smsName, smsMessage, smsStatus, smsService, router, refreshSms]);

  const sendSmsCampaign = useCallback(
    async (id: string) => {
      if (!confirm('إرسال هذه الحملة الآن؟')) return;
      setSmsBusyId(id);
      try {
        await fetch(`/api/marketing/sms/campaigns/${id}/send`, { method: 'POST' });
        await refreshSms();
      } finally {
        setSmsBusyId(null);
      }
    },
    [refreshSms],
  );

  const removeSmsCampaign = useCallback(async (id: string) => {
    if (!confirm('حذف هذه الحملة نهائيًا؟')) return;
    const res = await fetch(`/api/marketing/sms/campaigns/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) setSmsCampaigns((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const totalSent = campaigns.reduce((s, c) => s + c.sentCount + c.queuedCount, 0);
  const totalOpens = campaigns.reduce((s, c) => s + c.openCount, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clickCount, 0);

  const emailKpis = [
    { label: 'الحملات', value: campaigns.length, icon: Mail, tint: 'text-white' },
    { label: 'رسائل مُرسَلة', value: totalSent, icon: Users, tint: 'text-gold-light' },
    { label: 'فتحات', value: totalOpens, icon: Eye, tint: 'text-blue-300' },
    { label: 'نقرات', value: totalClicks, icon: MousePointerClick, tint: 'text-emerald-300' },
  ];

  const smsSent = smsCampaigns.reduce((s, c) => s + c.sentCount + c.queuedCount, 0);

  const tabs: { key: Tab; label: string; icon: typeof Mail }[] = [
    { key: 'email', label: 'البريد الإلكتروني', icon: Mail },
    { key: 'sms', label: 'الرسائل النصية', icon: MessageSquareText },
    { key: 'whatsapp', label: 'واتساب', icon: MessageCircle },
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
              <h1 className="text-lg font-medium sm:text-xl">مركز التسويق</h1>
              <p className="text-xs text-white/40">أومنيرا فاليه — بريد + رسائل نصية + واتساب</p>
            </div>
          </div>
          <button
            onClick={() => (tab === 'email' ? refresh() : tab === 'sms' ? refreshSms() : refreshWhatsapp())}
            className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-2 px-4 pb-3 sm:px-6">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm transition-colors ${
                tab === tb.key ? 'border-gold-primary/50 bg-gold-primary/10 text-gold-light' : 'border-white/10 text-white/50 hover:text-white'
              }`}
            >
              <tb.icon className="h-4 w-4" />
              {tb.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {tab === 'email' && (
          <>
            {!hasResendKey && (
              <div className="mb-4 rounded-xl border border-gold-primary/30 bg-gold-primary/10 px-4 py-3 text-xs text-gold-light">
                لا يوجد مزوّد بريد مُفعّل حاليًا (RESEND_API_KEY) — الحملات التي تُرسَل ستبقى &quot;بانتظار الإرسال الفعلي&quot; ولن تصل فعليًا حتى يُضاف المفتاح، لكن كل شيء آخر (الجمهور، التتبع، الإحصاءات) يعمل بالكامل.
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {emailKpis.map((k) => (
                <div key={k.label} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs text-white/45">{k.label}</span>
                    <k.icon className={`h-4 w-4 ${k.tint} opacity-70`} />
                  </div>
                  <div className={`text-2xl font-light sm:text-3xl ${k.tint}`}>{k.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
              <h2 className="mb-4 text-base font-medium">حملة بريد جديدة</h2>
              <div className="mb-4 flex gap-2">
                <input
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="اكتب فكرة موجزة، مثال: عرض خصم موسمي لعملاء الفنادق"
                  className={inputCls}
                />
                <button
                  onClick={aiDraft}
                  disabled={aiLoading || !brief.trim()}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-gold-primary/40 bg-gold-primary/10 px-4 py-2.5 text-sm text-gold-light hover:bg-gold-primary/20 disabled:opacity-50"
                >
                  {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  صياغة بالذكاء الاصطناعي
                </button>
              </div>
              {suggestedTime && <p className="mb-4 text-xs text-gold-light">الوقت المقترح للإرسال: {suggestedTime}</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="اسم الحملة (داخلي)" className={inputCls} />
                <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="عنوان الرسالة" className={inputCls} />
              </div>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                rows={6}
                placeholder="محتوى الرسالة (HTML)"
                className={`${inputCls} mt-3 resize-y font-mono`}
                dir="ltr"
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus | '')} className={inputCls}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <select value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
                  {SERVICE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={createDraft}
                disabled={creating || !name.trim() || !subject.trim() || !bodyHtml.trim()}
                className="btn-gold mt-4 gap-2 px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                حفظ كمسودة
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {campaigns.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">لا توجد حملات بعد.</div>
              )}
              {campaigns.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_CLS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === 'draft' && (
                        <button
                          onClick={() => sendCampaign(c.id)}
                          disabled={busyId === c.id}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" /> إرسال الآن
                        </button>
                      )}
                      <button onClick={() => removeCampaign(c.id)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400" aria-label="حذف">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-white/70">{c.subject}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45">
                    <span>المستلمون: {c.recipientCount}</span>
                    {c.status !== 'draft' && (
                      <>
                        <span>أُرسلت: {c.sentCount}</span>
                        <span>بانتظار الإرسال الفعلي: {c.queuedCount}</span>
                        {c.failedCount > 0 && <span className="text-red-300">فشلت: {c.failedCount}</span>}
                        <span>فتحات: {c.openCount}</span>
                        <span>نقرات: {c.clickCount}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'sms' && (
          <>
            <div className="mb-4 rounded-xl border border-gold-primary/30 bg-gold-primary/10 px-4 py-3 text-xs text-gold-light">
              مزوّد الرسائل النصية (Unifonic) غير مُفعّل بعد — نفس منطق البريد: الجمهور والإحصاءات تعمل بالكامل، والرسائل تبقى &quot;بانتظار الإرسال الفعلي&quot; حتى تُضاف بيانات الحساب.
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-white/45">الحملات</span>
                  <MessageSquareText className="h-4 w-4 text-white opacity-70" />
                </div>
                <div className="text-2xl font-light sm:text-3xl">{smsCampaigns.length}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-white/45">رسائل مُرسَلة</span>
                  <Users className="h-4 w-4 text-gold-light opacity-70" />
                </div>
                <div className="text-2xl font-light text-gold-light sm:text-3xl">{smsSent}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-white/45">فشلت</span>
                  <Clock className="h-4 w-4 text-red-300 opacity-70" />
                </div>
                <div className="text-2xl font-light text-red-300 sm:text-3xl">{smsCampaigns.reduce((s, c) => s + c.failedCount, 0)}</div>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
              <h2 className="mb-4 text-base font-medium">حملة رسائل نصية جديدة</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={smsName} onChange={(e) => setSmsName(e.target.value)} placeholder="اسم الحملة (داخلي)" className={inputCls} />
                <select value={smsStatus} onChange={(e) => setSmsStatus(e.target.value as LeadStatus | '')} className={inputCls}>
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={smsMessage}
                onChange={(e) => setSmsMessage(e.target.value.slice(0, 600))}
                rows={3}
                placeholder="نص الرسالة (حد أقصى 600 حرف)"
                className={`${inputCls} mt-3 resize-y`}
              />
              <p className="mt-1 text-[11px] text-white/35">{smsMessage.length}/600</p>
              <select value={smsService} onChange={(e) => setSmsService(e.target.value)} className={`${inputCls} mt-2`}>
                {SERVICE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <button
                onClick={createSmsDraft}
                disabled={smsCreating || !smsName.trim() || !smsMessage.trim()}
                className="btn-gold mt-4 gap-2 px-6 py-2.5 text-sm disabled:opacity-50"
              >
                {smsCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageSquareText className="h-4 w-4" />}
                حفظ كمسودة
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {smsCampaigns.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">لا توجد حملات بعد.</div>
              )}
              {smsCampaigns.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{c.name}</span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] ${STATUS_CLS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {c.status === 'draft' && (
                        <button
                          onClick={() => sendSmsCampaign(c.id)}
                          disabled={smsBusyId === c.id}
                          className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                        >
                          <Send className="h-3.5 w-3.5" /> إرسال الآن
                        </button>
                      )}
                      <button onClick={() => removeSmsCampaign(c.id)} className="rounded-lg p-2 text-white/40 hover:bg-red-500/10 hover:text-red-400" aria-label="حذف">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-white/70">{c.message}</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/45">
                    <span>المستلمون: {c.recipientCount}</span>
                    {c.status !== 'draft' && (
                      <>
                        <span>أُرسلت: {c.sentCount}</span>
                        <span>بانتظار الإرسال الفعلي: {c.queuedCount}</span>
                        {c.failedCount > 0 && <span className="text-red-300">فشلت: {c.failedCount}</span>}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === 'whatsapp' && (
          <>
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/50">
              كل متابعة واتساب تُجدوَل من قِبل مندوب مبيعات، أو تلقائيًا عند تصعيد متابعة متأخرة، تظهر هنا — من نظام الـCRM مباشرة. آخر 30 يومًا.
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5 sm:col-span-1">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs text-white/45">متابعات مجدولة (٣٠ يوم)</span>
                  <MessageCircle className="h-4 w-4 text-emerald-300 opacity-70" />
                </div>
                <div className="text-2xl font-light text-emerald-300 sm:text-3xl">{waTotal}</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {waLoaded && waItems.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">لا توجد متابعات واتساب مجدولة حاليًا.</div>
              )}
              {waItems.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-white">{item.leadName || 'عميل'}</span>
                    <span className="text-xs text-white/35">{fmtDate(item.at)}</span>
                  </div>
                  <p className="text-sm text-white/70">{item.message}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
