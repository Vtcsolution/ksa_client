'use client';

import { motion } from 'framer-motion';

const steps = [
  {
    n: '01',
    t: 'نفهم احتياجك',
    d: 'نبدأ بفهم دقيق لطبيعة منشأتك، حجم الحركة، وتوقّعات ضيوفك.',
  },
  {
    n: '02',
    t: 'نصمّم الحل',
    d: 'خطة تشغيل مخصّصة — عدد الفريق، الأنظمة، والمسارات المثلى لموقعك.',
  },
  {
    n: '03',
    t: 'ننفّذ بإتقان',
    d: 'فريق مدرّب وأنظمة ذكية تضمن وصولًا سلسًا ومغادرة أسرع، في كل مرة.',
  },
];

export default function EditorialManifesto() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0C] py-24 lg:py-36">
      <div className="container-custom grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-10">
        {/* statement */}
        <div className="lg:col-span-6">
          <motion.span
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            className="mb-6 flex items-center gap-3 text-[11px] font-bold tracking-[0.25em] text-gold-primary md:text-sm"
          >
            <span className="h-px w-10 bg-gold-primary/70" />
            منهجيتنا
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 34 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
            className="text-4xl font-black leading-[0.95] text-white sm:text-6xl lg:text-7xl"
          >
            صفّ السيارات،
            <br />
            <span className="bg-gradient-to-b from-gold-light via-gold-primary to-gold-dark bg-clip-text text-transparent">
              بإتقان.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="mt-8 max-w-md text-lg leading-relaxed text-white/65"
          >
            لا نكتفي بصفّ السيارات — نُعيد هندسة لحظة الوصول والمغادرة لتكون
            امتدادًا لفخامة مكانك.
          </motion.p>
        </div>

        {/* numbered steps */}
        <div className="lg:col-span-6 lg:pt-3">
          <div className="border-t border-white/10">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex gap-6 border-b border-white/10 py-7 lg:gap-8"
              >
                <span className="shrink-0 font-mono text-lg text-gold-primary/70">
                  {s.n}
                </span>
                <div>
                  <h3 className="mb-2 text-2xl font-black text-white lg:text-3xl">
                    {s.t}
                  </h3>
                  <p className="leading-relaxed text-white/60">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
