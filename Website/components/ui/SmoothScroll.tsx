'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

// Buttery inertial smooth scrolling + professional block snap-on-settle.
export default function SmoothScroll() {
  const pathname = usePathname();

  // Reset to top on route change (Lenis keeps the previous scroll position otherwise).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });
    window.__lenis = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    // ---- block snap: settle onto the nearest full-screen section ----
    let snapTimer: ReturnType<typeof setTimeout> | undefined;
    let snapping = false;

    const blocks = () =>
      (Array.from(document.querySelectorAll('main section')) as HTMLElement[]).filter(
        (s) =>
          !s.parentElement?.closest('section') &&
          s.offsetHeight > 200 &&
          s.offsetHeight < window.innerHeight * 1.6
      );

    const onScroll = () => {
      if (window.innerWidth < 1024 || snapping) return;
      clearTimeout(snapTimer);
      snapTimer = setTimeout(() => {
        const y = window.scrollY;
        const vh = window.innerHeight;
        let target: number | null = null;
        let bestDist = Infinity;
        for (const s of blocks()) {
          const top = s.getBoundingClientRect().top + y;
          const d = Math.abs(top - y);
          if (d < bestDist) {
            bestDist = d;
            target = top;
          }
        }
        if (target !== null && bestDist > 6 && bestDist < vh * 0.85) {
          snapping = true;
          lenis.scrollTo(target, {
            duration: 0.9,
            easing: (t: number) => 1 - Math.pow(1 - t, 3),
            onComplete: () => {
              snapping = false;
            },
          });
        }
      }, 150);
    };
    lenis.on('scroll', onScroll);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(snapTimer);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  return null;
}
