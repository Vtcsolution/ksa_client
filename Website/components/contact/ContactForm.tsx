'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    referralCode: '',
    company: '', // honeypot — hidden from users
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // preselect service from ?package= / ?service= (e.g. pricing CTA deep links)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const svc = p.get('service') || p.get('package');
    if (svc) setFormData((f) => ({ ...f, service: svc }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'contact',
          pagePath: window.location.pathname,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', service: '', message: '', referralCode: '', company: '' });
      } else if (res.status === 429) {
        setStatus('error');
        setErrorMsg('لقد أرسلت عدّة طلبات — يرجى المحاولة بعد قليل.');
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus('error');
        setErrorMsg(data?.error === 'validation' ? 'يرجى مراجعة البيانات المدخلة.' : 'تعذّر الإرسال، حاول مجددًا.');
      }
    } catch {
      setStatus('error');
      setErrorMsg('تعذّر الاتصال بالخادم. حاول مجددًا.');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputCls =
    'w-full px-5 py-4 bg-[#131318] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-gold-primary/60 focus:ring-4 focus:ring-gold-primary/10 focus:outline-none transition-all';

  return (
    <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-8 backdrop-blur-md md:p-10">
        {status === 'success' ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="mb-3 text-2xl font-medium text-white">تم استلام طلبك</h2>
            <p className="max-w-sm text-white/55">شكرًا لتواصلك مع أومنيرا فاليه — سيتواصل معك فريقنا خلال 24 ساعة.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 rounded-full border border-white/15 px-7 py-3 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white"
            >
              إرسال طلب آخر
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="mb-3 text-2xl font-medium text-white lg:text-3xl">أرسل لنا رسالة</h2>
              <p className="text-base text-white/50">املأ النموذج وسنتواصل معك خلال 24 ساعة</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">الاسم الكامل *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="أدخل اسمك الكامل" />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">رقم الجوال *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleChange} className={inputCls} placeholder="05xxxxxxxx" dir="ltr" />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">البريد الإلكتروني</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="example@email.com (اختياري)" dir="ltr" />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">نوع الخدمة</label>
                <select name="service" value={formData.service} onChange={handleChange} className={inputCls}>
                  <option value="">اختر الخدمة</option>
                  <option value="parking-management">إدارة وتشغيل المواقف</option>
                  <option value="valet-parking">خدمات الفاليه باركينج</option>
                  <option value="advanced-technology">التقنيات المتقدمة</option>
                  <option value="professional-organizers">المنظمين المحترفين</option>
                  <option value="consultation">الاستشارات</option>
                  <option value="golf-cart">جولف كار</option>
                  <option value="support-services">خدمات مساندة</option>
                  <option value="car-wash">غسيل السيارات</option>
                </select>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">الرسالة</label>
                <textarea name="message" value={formData.message} onChange={handleChange} rows={5} className={`${inputCls} resize-none`} placeholder="اكتب رسالتك هنا..." />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">كود الإحالة (اختياري)</label>
                <input
                  type="text"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className={inputCls}
                  placeholder="إن أحالك أحد عملائنا، أدخل الكود هنا"
                  dir="ltr"
                />
              </div>

              {/* honeypot — visually hidden, off-screen; bots fill it, humans don't */}
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />

              {status === 'error' && <p className="text-sm text-red-400">{errorMsg}</p>}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="btn-gold group w-full gap-3 py-4 text-base disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1" />
                )}
                <span>{status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الرسالة'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ContactForm;
