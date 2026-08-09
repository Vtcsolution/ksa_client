'use client';

import { motion } from 'framer-motion';
import Image from '@/components/ui/BlurImage';
import Particles from '@/components/ui/Particles';
import WebGLFog from '@/components/ui/WebGLFog';

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] } },
};

const lineReveal = {
  hidden: { y: '115%' },
  show: { y: 0, transition: { duration: 1.1, ease: [0.22, 0.61, 0.36, 1] } },
};

export default function PageHero({
  kicker,
  title,
  accent,
  subtitle,
  image,
}: {
  kicker: string;
  title: string;
  accent?: string;
  subtitle?: string;
  image: string;
}) {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0A0A0C] pt-20">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/65 to-[#0A0A0C]/40" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0A0A0C]/80" />
      </div>

      {/* cinematic depth — matches the home hero */}
      <WebGLFog className="absolute inset-0 z-[1] opacity-50 mix-blend-screen" />
      <Particles className="absolute inset-0 z-[2]" />

      <div className="container-custom relative z-10">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.16, delayChildren: 0.2 } } }}
          className="max-w-3xl"
        >
          <motion.span
            variants={fade}
            className="mb-8 flex items-center gap-4 text-[11px] font-medium tracking-[0.4em] text-gold-primary/90"
          >
            <span className="h-px w-12 bg-gold-primary/50" />
            {kicker}
          </motion.span>

          <motion.div variants={{ show: {} }} className="overflow-hidden pb-[0.12em]">
            <motion.h1
              variants={lineReveal}
              className="font-extralight leading-[1.1] text-white text-4xl sm:text-6xl lg:text-7xl [text-shadow:0_2px_28px_rgba(0,0,0,0.6)]"
            >
              {title}
              {accent && (
                <>
                  {' '}
                  <span className="font-light text-gold-light">{accent}</span>
                </>
              )}
            </motion.h1>
          </motion.div>

          {subtitle && (
            <motion.p
              variants={fade}
              className="mt-8 max-w-lg text-base font-light leading-relaxed text-white/65 md:text-lg"
            >
              {subtitle}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/35">تصفّح</span>
        <motion.span
          animate={{ scaleY: [0.4, 1, 0.4], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="h-10 w-px origin-top bg-gradient-to-b from-gold-primary/80 to-transparent"
        />
      </motion.div>
    </section>
  );
}
