'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, SendHorizonal } from 'lucide-react';

export default function PricingCTA() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    
    // محاكاة الإرسال (سيتم استبداله بالكود الحقيقي للإرسال)
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-28 lg:py-40 bg-[#0A0A0C]">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-5 flex items-center justify-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            حسب طلبك
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] gold-shine-effect mb-6">
            باقة مخصصة لاحتياجاتك
          </h2>
          <p className="text-xl text-white/60 mb-10">
            لا تجد الباقة المناسبة لاحتياجاتك؟ دعنا نصمم لك باقة مخصصة تناسب متطلبات منشأتك بالضبط.
          </p>

          <div className="flex flex-wrap gap-6 justify-center items-center mb-12">
            <Link
              href="/contact?source=pricing"
              className="px-8 py-4 rounded-full bg-gold-primary text-[#0A0A0C] font-medium text-base hover:bg-gold-light transition-colors duration-300 flex items-center gap-2"
            >
              <span>احصل على عرض سعر مخصص</span>
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <a
              href="tel:+966551962033"
              className="px-8 py-4 rounded-full border border-gold-primary/40 text-gold-primary font-medium text-base hover:bg-gold-primary hover:text-[#0A0A0C] transition-all duration-300"
            >
              اتصل بنا مباشرة
            </a>
          </div>

          <div className="mt-12 p-10 bg-white/[0.03] backdrop-blur-sm rounded-xl border border-white/10">
            <h3 className="text-2xl font-medium text-white mb-4">ابقَ على اطلاع بأحدث العروض</h3>
            <p className="text-white/60 mb-6">
              سجل بريدك الإلكتروني للحصول على آخر العروض والخصومات الخاصة
            </p>
            
            {submitted ? (
              <div className="p-4 bg-[#C9A24A]/20 border border-[#C9A24A] rounded-lg text-[#F5ECDB]">
                شكراً لتسجيلك! سنتواصل معك قريباً بأحدث العروض.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg bg-[#141418]/60 text-[#F5ECDB] border border-[#C9A24A]/30 focus:outline-none focus:border-gold-primary placeholder-[#C8B58A]"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 rounded-full bg-gold-primary text-[#0A0A0C] font-medium hover:bg-gold-light transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-block w-5 h-5 border-2 border-[#0A0A0C] border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>اشتراك</span>
                      <SendHorizonal className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="mt-12">
            <h4 className="text-xl font-medium text-white mb-2">تحتاج إلى مساعدة في اختيار الباقة المناسبة؟</h4>
            <p className="text-[#C8B58A] mb-6">
              فريق خدمة العملاء لدينا متاح على مدار الساعة للإجابة على جميع استفساراتك
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center text-gold-primary hover:text-gold-light"
            >
              <span className="underline">تواصل مع فريق المبيعات</span>
              <ArrowLeft className="w-4 h-4 ms-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
