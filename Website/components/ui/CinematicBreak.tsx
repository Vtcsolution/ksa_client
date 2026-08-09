'use client';

import { motion } from 'framer-motion';
import ParallaxImage from '@/components/ui/ParallaxImage';
import WebGLFog from '@/components/ui/WebGLFog';
import Particles from '@/components/ui/Particles';

// A full-bleed cinematic interlude — a big atmospheric frame + one quiet line.
// Used to break the rhythm of card-grid sections on inner pages (like the home AtmosphericStatement).
export default function CinematicBreak({
  image,
  kicker,
  children,
}: {
  image: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-[72vh] items-center justify-center overflow-hidden bg-[#0A0A0C]">
      <div className="absolute inset-0">
        <ParallaxImage src={image} alt="" strength={85} />
        <div className="absolute inset-0 bg-[#0A0A0C]/80" />
        {/* focused scrim behind the statement so it stays readable over bright frames */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_center,rgba(10,10,12,0.72),transparent_100%)]" />
      </div>

      <WebGLFog className="absolute inset-0 z-[1] opacity-25 mix-blend-screen" />
      <Particles className="absolute inset-0 z-[1]" />

      <div className="container-custom relative z-10 text-center">
        {kicker && (
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-120px' }}
            transition={{ duration: 1 }}
            className="mb-9 block text-[11px] font-medium tracking-[0.4em] text-gold-primary/80"
          >
            {kicker}
          </motion.span>
        )}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-120px' }}
          transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          className="mx-auto max-w-4xl font-extralight leading-[1.45] text-white text-2xl sm:text-4xl lg:text-5xl [text-shadow:0_2px_26px_rgba(0,0,0,0.75)]"
        >
          {children}
        </motion.p>
      </div>
    </section>
  );
}
