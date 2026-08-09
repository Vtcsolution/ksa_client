'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

// Pinned scroll-scrub statement: the section sticks while each word lights up as you scroll through it.
const parts: { text: string; gold?: boolean }[] = [
  { text: 'نحن' },
  { text: 'لا' },
  { text: 'نصفّ' },
  { text: 'السيارات' },
  { text: 'فحسب،' },
  { text: 'بل' },
  { text: 'نصنع' },
  { text: 'الانطباع', gold: true },
  { text: 'الأول', gold: true },
  { text: 'الذي' },
  { text: 'يبقى' },
  { text: 'في' },
  { text: 'ذاكرة' },
  { text: 'ضيوفك.' },
];

function Word({
  progress,
  range,
  gold,
  children,
}: {
  progress: MotionValue<number>;
  range: [number, number];
  gold?: boolean;
  children: string;
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className={gold ? 'text-gold-light' : 'text-white'}>
      {children}
    </motion.span>
  );
}

export default function ScrollRevealStatement() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  return (
    <section ref={ref} data-no-reveal className="relative bg-[#0A0A0C]" style={{ height: '250vh' }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <div className="container-custom max-w-5xl">
          <div className="mb-9 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
            <span className="h-px w-10 bg-gold-primary/50" />
            فلسفتنا
          </div>
          <p className="flex flex-wrap gap-x-4 gap-y-2 font-extralight leading-[1.35] text-3xl sm:text-5xl lg:text-[4rem]">
            {parts.map((p, i) => {
              const start = i / parts.length;
              const end = start + 1 / parts.length;
              return (
                <Word key={i} progress={scrollYProgress} range={[start, end]} gold={p.gold}>
                  {p.text}
                </Word>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
