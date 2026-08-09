'use client';

import { useRef } from 'react';
import Image from '@/components/ui/BlurImage';
import { motion, useScroll, useTransform } from 'framer-motion';

// Background image that drifts slower than the scroll → real depth/parallax.
// Fills its parent; the parent must be position:relative with a fixed height.
export default function ParallaxImage({
  src,
  alt,
  className = '',
  strength = 70,
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  strength?: number;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [-strength, strength]);

  return (
    <div ref={ref} className={`relative h-full w-full overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="absolute inset-x-0 -top-[14%] h-[128%]">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          className="object-cover"
          priority={priority}
        />
      </motion.div>
    </div>
  );
}
