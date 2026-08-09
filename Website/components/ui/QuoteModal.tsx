'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { useQuoteModal } from '@/lib/quote-modal-store';

const SERVICES = [
  { v: 'parking-management', l: 'إدارة وتشغيل المواقف' },
  { v: 'valet-parking', l: 'خدمات الفاليه باركينج' },
  { v: 'advanced-technology', l: 'التقنيات المتقدمة' },
  { v: 'professional-organizers', l: 'المنظمين المحترفين' },
  { v: 'consultation', l: 'الاستشارات' },
  { v: 'golf-cart', l: 'جولف كار' },
  { v: 'support-services', l: 'خدمات مساندة' },
  { v: 'car-wash', l: 'غسيل السيارات' },
];

export default function QuoteModal() {
  const { open, source, service, note, closeQuote } = useQuoteModal();
  const [form, setForm] = useState({ name: '', phone: '', service: '', message: '', company: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // fresh form each time the modal opens, seeded with the triggering CTA's service/note
  useEffect(() => {
    if (open) {
      setForm({ name: '', phone: '', service: service || '', message: note || '', company: '' });
      setStatus('idle');
    }
  }, [open, service, note]);

  // lock body scroll + close on Esc
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeQuote();
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, closeQuote]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          source: source || 'quote-modal',
          pagePath: typeof window !== 'undefined' ? window.location.pathname : undefined,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', phone: '', service: '', message: '', company: '' });
      } else if (res.status === 429) {
        setStatus('error');
        setErrorMsg('لقد أرسلت عدّة طلبات — يرجى المحاولة بعد قليل.');
      } else {
        setStatus('error');
        setErrorMsg('تعذّر الإرسال، تأكد من البيانات وحاول مجددًا.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('تعذّر الاتصال. حاول مجددًا.');
    }
  };

  const inputCls =
    'w-full rounded-xl border border-white/10 bg-[#131318] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-gold-primary/60 focus:outline-none focus:ring-4 focus:ring-gold-primary/10 transition-all';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeQuote}
          dir="rtl"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#141418] to-[#0C0C0F] p-8 shadow-2xl sm:p-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
            <button
              onClick={closeQuote}
              aria-label="إغلاق"
              className="absolute left-5 top-5 rounded-lg p-2 text-white/45 transition-colors hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {status === 'success' ? (
              <div className="flex flex-col items-center py-8 text-center">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="mb-3 text-2xl font-medium text-white">تم استلام طلبك</h3>
                <p className="mb-8 max-w-xs text-white/55">سيتواصل معك فريق أومنيرا فاليه خلال 24 ساعة لتجهيز عرض سعرك.</p>
                <button
                  onClick={closeQuote}
                  className="rounded-full bg-gold-primary px-9 py-3 text-sm font-medium text-[#0A0A0C] transition-colors hover:bg-gold-light"
                >
                  تم
                </button>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <span className="mb-3 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
                    <span className="h-px w-8 bg-gold-primary/50" />
                    عرض سعر مخصّص
                  </span>
                  <h3 className="text-2xl font-medium text-white sm:text-3xl">اطلب عرض سعرك</h3>
                  <p className="mt-2 text-sm text-white/50">أدخل بياناتك وسنعاود التواصل خلال 24 ساعة.</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputCls}
                    placeholder="الاسم الكامل *"
                  />
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`${inputCls} text-right`}
                    placeholder="05xxxxxxxx *"
                  />
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className={inputCls}
                  >
                    <option value="">اختر الخدمة</option>
                    {SERVICES.map((s) => (
                      <option key={s.v} value={s.v}>{s.l}</option>
                    ))}
                  </select>
                  <textarea
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className={`${inputCls} resize-none`}
                    placeholder="تفاصيل إضافية (اختياري)"
                  />
                  {/* honeypot */}
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="absolute -left-[9999px] h-0 w-0 opacity-0"
                  />

                  {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-primary py-4 text-sm font-medium text-[#0A0A0C] transition-colors hover:bg-gold-light disabled:opacity-70"
                  >
                    {status === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-4 w-4" />}
                    {status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الطلب'}
                  </button>
                  <p className="text-center text-xs text-white/35">أو اتصل مباشرة: <a href="tel:+966551962033" dir="ltr" className="text-white/60 hover:text-gold-primary">+966 55 196 2033</a></p>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
