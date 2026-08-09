'use client';

import { useEffect, useRef, useState } from 'react';

// Desktop custom cursor: a lagging gold ring + a precise dot, growing over interactive elements.
export default function CustomCursor() {
  const [on, setOn] = useState(false);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !reduce) setOn(true);
  }, []);

  useEffect(() => {
    if (!on) return;
    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;
    let hovering = false;

    document.documentElement.classList.add('cc-on');

    const move = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest?.(
        'a, button, [role="button"], input, textarea, select, label, [data-cursor="hover"]'
      );
      if (interactive !== hovering) {
        hovering = interactive;
        ring.classList.toggle('cc-hover', interactive);
      }
    };
    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      raf = requestAnimationFrame(loop);
    };
    const hide = () => {
      ring.style.opacity = '0';
      dot.style.opacity = '0';
    };
    const show = () => {
      ring.style.opacity = '1';
      dot.style.opacity = '1';
    };

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', hide);
    document.addEventListener('mouseenter', show);
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', hide);
      document.removeEventListener('mouseenter', show);
      document.documentElement.classList.remove('cc-on');
    };
  }, [on]);

  if (!on) return null;
  return (
    <>
      <div ref={ringRef} className="cc-ring" aria-hidden />
      <div ref={dotRef} className="cc-dot" aria-hidden />
    </>
  );
}
