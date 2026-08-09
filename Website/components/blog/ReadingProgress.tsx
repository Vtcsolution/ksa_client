'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * شريط تقدّم القراءة — خيط ذهبي رفيع أعلى الصفحة يمتلئ مع التمرير.
 * يعزّز إحساس «الموقع المتحرّك» في صفحات المقالات.
 */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-right bg-gradient-to-l from-gold-primary via-gold-light to-gold-primary shadow-[0_0_12px_rgba(201,162,74,0.6)]"
      aria-hidden
    />
  );
}
