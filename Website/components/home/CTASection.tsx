'use client';

import { motion } from 'framer-motion';
import ParallaxImage from '@/components/ui/ParallaxImage';
import Particles from '@/components/ui/Particles';
import { useQuoteModal } from '@/lib/quote-modal-store';

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] } },
};

const CTASection = () => {
  const openQuote = useQuoteModal((s) => s.openQuote);
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0A0A0C]">
      <div className="absolute inset-0">
        <ParallaxImage src="/images/atmos/atmos-3.jpg" alt="سيارة فاخرة سوداء" strength={70} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/65 to-[#0A0A0C]/45" />
      </div>

      <Particles className="absolute inset-0 z-[1]" />

      <div className="container-custom relative z-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          variants={{ show: { transition: { staggerChildren: 0.16, delayChildren: 0.1 } } }}
          className="max-w-3xl"
        >
          <motion.span
            variants={fade}
            className="mb-9 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-gold-primary/90"
          >
            <span className="h-px w-12 bg-gold-primary/50" />
            ابدأ التجربة
          </motion.span>

          <motion.h2
            variants={fade}
            className="font-extralight leading-[1.1] text-white text-4xl sm:text-6xl lg:text-7xl"
          >
            وصولٌ يليق
            <br />
            بـ<span className="font-light text-gold-light">ضيوفك</span>.
          </motion.h2>

          <motion.div variants={fade} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <button onClick={() => openQuote({ source: 'cta-home' })} className="group inline-flex items-center gap-3 text-base text-white">
              <span className="border-b border-gold-primary/50 pb-1 transition-colors duration-300 group-hover:border-gold-primary">
                احجز خدمتك
              </span>
              <span className="text-gold-primary transition-transform duration-300 group-hover:-translate-x-1.5">
                ←
              </span>
            </button>
            <a
              href="https://wa.me/966551962033"
              className="text-base text-white/55 transition-colors duration-300 hover:text-white"
            >
              تواصل عبر واتساب
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
