'use client';

import { motion } from 'framer-motion';
import Image from '@/components/ui/BlurImage';
import Link from 'next/link';
import Particles from '@/components/ui/Particles';
import WebGLFog from '@/components/ui/WebGLFog';

interface ServiceDetailHeroProps {
  data: {
    title: string;
    subtitle: string;
    heroImage: string;
  };
}

const fade = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 0.61, 0.36, 1] } },
};

const ServiceDetailHero = ({ data }: ServiceDetailHeroProps) => {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0A0A0C] pt-20">
      <div className="absolute inset-0">
        <Image
          src={data.heroImage}
          alt={data.title}
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
          variants={{ show: { transition: { staggerChildren: 0.15, delayChildren: 0.15 } } }}
          className="max-w-3xl"
        >
          <motion.div variants={fade} className="mb-8 flex items-center gap-2 text-xs text-white/45">
            <Link href="/" className="transition-colors duration-300 hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="transition-colors duration-300 hover:text-white">الخدمات</Link>
            <span>/</span>
            <span className="text-gold-primary/80">{data.title}</span>
          </motion.div>

          <motion.h1
            variants={fade}
            className="font-extralight leading-[1.1] text-white text-4xl sm:text-6xl lg:text-7xl [text-shadow:0_2px_28px_rgba(0,0,0,0.6)]"
          >
            {data.title}
          </motion.h1>

          <motion.p
            variants={fade}
            className="mt-8 max-w-xl text-base font-light leading-relaxed text-white/55 md:text-lg"
          >
            {data.subtitle}
          </motion.p>

          <motion.div variants={fade} className="mt-12 flex flex-wrap items-center gap-x-10 gap-y-5">
            <Link href="/contact" className="group inline-flex items-center gap-3 text-base text-white">
              <span className="border-b border-gold-primary/50 pb-1 transition-colors duration-300 group-hover:border-gold-primary">
                احجز الخدمة
              </span>
              <span className="text-gold-primary transition-transform duration-300 group-hover:-translate-x-1.5">
                ←
              </span>
            </Link>
            <a
              href="https://wa.me/966551962033"
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-white/55 transition-colors duration-300 hover:text-white"
            >
              واتساب فوري
            </a>
          </motion.div>
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
};

export default ServiceDetailHero;
