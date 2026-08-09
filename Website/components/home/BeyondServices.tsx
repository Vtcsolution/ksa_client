'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ParallaxImage from '@/components/ui/ParallaxImage';

const items = [
  {
    title: 'الإدارة الذكية للمواقف',
    desc: 'أنظمة متكاملة لتشغيل وإدارة المواقف بكفاءة، مع تقارير لحظية ودقّة عالية.',
    img: '/images/services/parking-management.jpg',
    href: '/services/parking-management',
  },
  {
    title: 'التقنيات المتقدمة',
    desc: 'تطبيق ذكي وحسّاسات ولوحة تحكّم لحظية تصنع تجربة وصول سلسة بلا انتظار.',
    img: '/images/services/advanced-technology.jpg',
    href: '/services/advanced-technology',
  },
  {
    title: 'فريق محترف مدرّب',
    desc: 'منظّمون وسائقون مدرّبون على أعلى معايير الضيافة والاحترافية في كل تفصيلة.',
    img: '/images/professional-team.jpg',
    href: '/services/professional-organizers',
  },
];

export default function BeyondServices() {
  return (
    <section id="beyond" className="relative bg-[#0E0E11] py-24 lg:py-32 overflow-hidden">
      <div className="container-custom">
        <motion.span
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          className="flex items-center gap-3 text-gold-primary tracking-[0.25em] text-[11px] md:text-sm font-bold mb-5"
        >
          <span className="h-px w-10 bg-gold-primary/70" />
          أكثر من مجرّد صفّ سيارات
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[0.95] text-white mb-14 lg:mb-20"
        >
          منظومة وصول
          <br />
          <span className="text-white/35">متكاملة.</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {items.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 44 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <Link
                href={it.href}
                className="group relative block h-[420px] overflow-hidden rounded-2xl border border-white/10 lg:h-[520px]"
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]">
                  <ParallaxImage src={it.img} alt={it.title} strength={45} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/60 to-[#0A0A0C]/10" />
                <div className="absolute inset-x-0 bottom-0 p-7 lg:p-8">
                  <h3 className="mb-3 text-2xl font-black text-white lg:text-3xl [text-shadow:0_2px_18px_rgba(0,0,0,0.65)]">{it.title}</h3>
                  <p className="mb-5 max-w-xs text-sm leading-relaxed text-white/70 lg:text-base">
                    {it.desc}
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-gold-primary transition-all duration-300 group-hover:gap-3">
                    اعرف المزيد
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
