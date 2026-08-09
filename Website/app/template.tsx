'use client';

import { motion } from 'framer-motion';

// Cinematic page transition: a gold-edged curtain lifts to reveal the new page.
// The content wrapper is opacity-only (NO transform) so the fixed header/buttons stay fixed.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
        style={{ transformOrigin: 'top' }}
        className="pointer-events-none fixed inset-0 z-[99990] bg-[#0A0A0C]"
      >
        <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold-primary to-transparent" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 0.61, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
