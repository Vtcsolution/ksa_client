'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Cinematic brand intro — plays once per session, then curtains up to reveal the site.
export default function IntroLoader() {
  const [show, setShow] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem('omnira-intro')) {
      setShow(false);
      return;
    }
    document.documentElement.style.overflow = 'hidden';

    const start = performance.now();
    const dur = 2200;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      setCount(Math.round(p * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const t = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem('omnira-intro', '1');
      document.documentElement.style.overflow = '';
    }, 2600);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100000] flex flex-col items-center justify-center bg-[#0A0A0C]"
        >
          <motion.span
            initial={{ opacity: 0, letterSpacing: '0.15em' }}
            animate={{ opacity: 1, letterSpacing: '0.55em' }}
            transition={{ duration: 1.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="pr-[0.55em] text-3xl font-extralight text-white md:text-5xl"
          >
            OMNIRA
          </motion.span>

          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="mt-4 pr-[0.6em] text-[11px] tracking-[0.6em] text-gold-primary"
          >
            VALET
          </motion.span>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.4, duration: 1.7, ease: [0.22, 0.61, 0.36, 1] }}
            className="mt-9 h-px w-44 origin-center bg-gradient-to-r from-transparent via-gold-primary to-transparent"
          />

          <span className="absolute bottom-10 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-white/30">
            {count.toString().padStart(3, '0')}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
