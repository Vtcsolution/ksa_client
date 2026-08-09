'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2, Loader2, Star } from 'lucide-react';

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    company: '', // honeypot — hidden from users
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setStatus('error');
      setErrorMsg('يرجى اختيار تقييم بالنجوم أولًا.');
      return;
    }
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          rating,
          pagePath: window.location.pathname,
        }),
      });
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', message: '', company: '' });
        setRating(0);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputCls =
    'w-full px-5 py-4 bg-[#131318] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:border-gold-primary/60 focus:ring-4 focus:ring-gold-primary/10 focus:outline-none transition-all';

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
      <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-8 backdrop-blur-md md:p-10">
        {status === 'success' ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/25 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="mb-3 text-2xl font-medium text-white">شكرًا لملاحظتك</h2>
            <p className="max-w-sm text-white/55">نقدّر وقتك — رأيك يساعدنا على تحسين خدماتنا باستمرار.</p>
            <button
              onClick={() => setStatus('idle')}
              className="mt-8 rounded-full border border-white/15 px-7 py-3 text-sm text-white/70 transition-colors hover:border-gold-primary/40 hover:text-white"
            >
              إرسال ملاحظة أخرى
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="mb-3 text-2xl font-medium text-white lg:text-3xl">شاركنا رأيك</h2>
              <p className="text-base text-white/50">تجربتك معنا تهمّنا — قيّم الخدمة واترك ملاحظتك</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">تقييمك *</label>
                <div className="flex gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      aria-label={`${n} نجوم`}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          n <= (hoverRating || rating) ? 'fill-gold-primary text-gold-primary' : 'text-white/20'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">الاسم الكامل *</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className={inputCls} placeholder="أدخل اسمك الكامل" />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">البريد الإلكتروني</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="example@email.com (اختياري)" dir="ltr" />
              </div>

              <div>
                <label className="mb-3 block text-sm font-medium text-white/70">ملاحظتك *</label>
                <textarea name="message" required value={formData.message} onChange={handleChange} rows={5} className={`${inputCls} resize-none`} placeholder="أخبرنا عن تجربتك..." />
              </div>

              {/* honeypot */}
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
                <span>{status === 'sending' ? 'جارٍ الإرسال…' : 'إرسال الملاحظة'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default FeedbackForm;
