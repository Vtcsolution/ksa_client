'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import Image from '@/components/ui/BlurImage';

const testimonials = [
  {
    name: 'محمد العلي',
    position: 'مدير عام فندق الرياض الكبير',
    image: '/images/people/person-3.jpg',
    text: 'خدمة استثنائية. فريق أومنيرا فاليه أصبح جزءاً أساسياً من تجربة الضيافة في فندقنا — ضيوفنا يشيدون دائماً بمستوى الهدوء والرقي.',
  },
  {
    name: 'سارة القحطاني',
    position: 'مالكة مطعم النخبة',
    image: '/images/people/person-2.jpg',
    text: 'منذ أن بدأنا العمل معهم، تحوّلت لحظة وصول عملائنا إلى انطباع أول لا يُنسى. احترافية وأناقة في كل تفصيلة.',
  },
  {
    name: 'خالد السالم',
    position: 'منسّق فعاليات كبرى',
    image: '/images/people/person-6.jpg',
    text: 'أدار فريقهم وصول مئات السيارات في حفلٍ بـ ٣٠٠ ضيف بسلاسة تامة. تخطيط دقيق وفريق راقٍ — أنصح بهم بثقة.',
  },
  {
    name: 'نورة العتيبي',
    position: 'مديرة علاقات عامة',
    image: '/images/people/person-4.jpg',
    text: 'استقبلنا وفداً دولياً عبر خدمة VIP. السرّية والاحترافية والاهتمام بالتفاصيل كانت على أعلى مستوى.',
  },
  {
    name: 'عبدالله الدوسري',
    position: 'صاحب مجمع تجاري',
    image: '/images/people/person-5.jpg',
    text: 'النظام الذكي الذي قدّموه غيّر تجربة التسوّق في مجمعنا — انخفض الازدحام والزوار يجدون مواقفهم بسهولة.',
  },
];

const Testimonials = () => {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % testimonials.length), 6500);
    return () => clearInterval(t);
  }, []);

  const t = testimonials[i];

  return (
    <section className="relative overflow-hidden bg-[#0A0A0C] py-28 lg:py-40">
      {/* faint atmospheric glow */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto h-[420px] max-w-3xl bg-[radial-gradient(ellipse_at_center,rgba(201,162,74,0.07),transparent_70%)]" />
      <div className="container-custom relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <span className="mb-8 flex items-center justify-center gap-4 text-[11px] font-medium tracking-[0.4em] text-gold-primary/90">
            <span className="h-px w-12 bg-gold-primary/50" />
            قالوا عنّا
          </span>

          <Quote className="mx-auto mb-8 h-9 w-9 text-gold-primary/35" aria-hidden />

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={i}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -22 }}
              transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
              className="min-h-[7.5rem] font-extralight leading-[1.5] text-white text-2xl sm:text-3xl lg:text-[2.5rem]"
            >
              {t.text}
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-1.5">
            {Array.from({ length: 5 }).map((_, s) => (
              <Star key={s} className="h-4 w-4 fill-gold-primary text-gold-primary" aria-hidden />
            ))}
          </div>

          <div className="mx-auto mt-8 h-px w-16 bg-white/10" />

          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="relative h-12 w-12 overflow-hidden rounded-full">
              <Image src={t.image} alt={t.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="text-right">
              <div className="font-medium text-white">{t.name}</div>
              <div className="text-sm text-white/50">{t.position}</div>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                aria-label={`الانتقال للتقييم ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === i ? 'w-8 bg-gold-primary' : 'w-1.5 bg-white/20 hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
