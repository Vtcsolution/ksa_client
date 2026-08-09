'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { to: 5000, suffix: '+', label: 'سيارة مخدومة شهريًا' },
  { to: 99.9, suffix: '%', label: 'رضا العملاء', dp: 1 },
  { to: 24, suffix: '/7', label: 'خدمة مستمرة' },
  { to: 200, suffix: '+', label: 'شريك نجاح' },
];

function Counter({ to, dp = 0 }: { to: number; dp?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1700;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return <span ref={ref}>{dp ? v.toFixed(dp) : Math.round(v).toLocaleString('en-US')}</span>;
}

export default function KineticStats() {
  return (
    <section className="relative overflow-hidden bg-[#0A0A0C] py-28 lg:py-40">
      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 gap-y-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              className="text-center lg:text-right"
            >
              <div className="font-extralight leading-none text-white text-6xl sm:text-7xl lg:text-8xl">
                <Counter to={s.to} dp={s.dp} />
                <span className="text-gold-light">{s.suffix}</span>
              </div>
              <div className="mt-5 text-sm tracking-[0.15em] text-white/50">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
