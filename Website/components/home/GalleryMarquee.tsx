'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useVelocity,
  useSpring,
  useTransform,
  useMotionValue,
  useAnimationFrame,
} from 'framer-motion';
import Image from '@/components/ui/BlurImage';

const images = [
  '/images/atmos/atmos-1.jpg',
  '/images/hero/hero-1.jpg',
  '/images/services/valet-parking.jpg',
  '/images/hero/hero-3.jpg',
  '/images/atmos/atmos-2.jpg',
  '/images/services/parking-management.jpg',
  '/images/hero/hero-6.jpg',
  '/images/valet-service.jpg',
  '/images/atmos/atmos-3.jpg',
  '/images/services/advanced-technology.jpg',
];

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

export default function GalleryMarquee() {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);
  const directionFactor = useRef(1);
  const baseVelocity = -3; // % of row per second (idle drift)

  useAnimationFrame((_t, delta) => {
    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);
    // scroll direction steers the marquee; scroll speed accelerates it
    if (velocityFactor.get() < 0) directionFactor.current = -1;
    else if (velocityFactor.get() > 0) directionFactor.current = 1;
    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  const row = [...images, ...images];

  return (
    <section className="overflow-hidden bg-[#0A0A0C] py-24 lg:py-32">
      <div className="container-custom mb-14">
        <div className="mb-5 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
          <span className="h-px w-10 bg-gold-primary/50" />
          لمحات
        </div>
        <h2 className="text-4xl font-black gold-shine-effect leading-[0.95] sm:text-6xl lg:text-7xl">
          لحظات من خدمتنا
        </h2>
      </div>

      <div dir="ltr" className="relative">
        <motion.div style={{ x }} className="flex w-max gap-5">
          {row.map((src, i) => (
            <div
              key={i}
              className="relative h-56 w-80 shrink-0 overflow-hidden rounded-2xl border border-white/10 sm:h-64 sm:w-96"
            >
              <Image src={src} alt="من أعمال أومنيرا فاليه" fill sizes="384px" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C]/50 to-transparent" />
            </div>
          ))}
        </motion.div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[10vw] bg-gradient-to-l from-[#0A0A0C] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[10vw] bg-gradient-to-r from-[#0A0A0C] to-transparent" />
      </div>
    </section>
  );
}
