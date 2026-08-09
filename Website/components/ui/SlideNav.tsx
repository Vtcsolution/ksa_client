'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

type Slide = { id: string; label: string; el: HTMLElement };

/**
 * Side dot-navigation that turns every page into a guided "presentation":
 * it auto-discovers the page's top-level <section>s, shows a dot per slide,
 * highlights the active one while scrolling, and smooth-scrolls on click.
 * Pure client-side, zero per-page wiring.
 */
export default function SlideNav() {
  const pathname = usePathname();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [active, setActive] = useState(0);
  const debRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Remembers a generated key per section purely in memory — never writes an
  // `id` attribute onto the live DOM node. Writing `el.id` directly used to
  // race React's hydration of Suspense-deferred sections (dynamic imports
  // further down the page can still be hydrating when this scan fires),
  // which made React see an "extra attribute from the server" on whichever
  // section hadn't finished hydrating yet and throw a hydration-mismatch
  // error. Sections that already carry a real id (e.g. id="beyond") still
  // use it as-is; this only stops *inventing* new ids on the DOM.
  const slideKeysRef = useRef(new WeakMap<HTMLElement, string>());

  const scan = useCallback(() => {
    const main = document.querySelector('main');
    if (!main) return;
    const all = Array.from(main.querySelectorAll('section')) as HTMLElement[];
    const tops = all.filter(
      (s) => !s.parentElement?.closest('section') && s.offsetHeight > 240
    );
    const list: Slide[] = tops.map((el, i) => {
      let key = slideKeysRef.current.get(el);
      if (!key) {
        key = el.id || `slide-${i + 1}`;
        slideKeysRef.current.set(el, key);
      }
      const h = el.querySelector('h1, h2');
      const label =
        (h?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 22) ||
        `قسم ${i + 1}`;
      return { id: key, label, el };
    });
    setSlides((prev) =>
      prev.length === list.length && prev.every((p, i) => p.el === list[i].el)
        ? prev
        : list
    );
  }, []);

  // (re)scan on navigation + whenever main's content changes (lazy sections)
  useEffect(() => {
    setSlides([]);
    setActive(0);
    const main = document.querySelector('main');
    const run = () => {
      if (debRef.current) clearTimeout(debRef.current);
      debRef.current = setTimeout(scan, 250);
    };
    run();
    const mo = main ? new MutationObserver(run) : null;
    if (main) mo!.observe(main, { childList: true, subtree: true });
    const t = setTimeout(scan, 1600);
    return () => {
      mo?.disconnect();
      clearTimeout(t);
      if (debRef.current) clearTimeout(debRef.current);
    };
  }, [pathname, scan]);

  // track the active slide
  useEffect(() => {
    if (slides.length < 2) return;
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = slides.findIndex((s) => s.el === e.target);
            if (idx >= 0) setActive(idx);
          }
        }),
      { rootMargin: '-45% 0px -45% 0px' }
    );
    slides.forEach((s) => obs.observe(s.el));
    return () => obs.disconnect();
  }, [slides]);

  if (slides.length < 2) return null;

  return (
    <nav
      aria-label="التنقل بين أقسام الصفحة"
      className="hidden lg:flex fixed right-4 top-1/2 -translate-y-1/2 z-[9990] flex-col items-center gap-3 rounded-full bg-[#0A0A0C]/40 backdrop-blur-md border border-gold-primary/15 px-2.5 py-4 shadow-xl"
    >
      {slides.map((s, i) => (
        <button
          key={s.id}
          onClick={() => {
            const lenis = window.__lenis;
            // offset for the fixed ~80px header so the section top isn't hidden
            if (lenis) lenis.scrollTo(s.el, { duration: 1.1, offset: -88 });
            else s.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          className="group relative flex items-center justify-end py-1"
          aria-label={s.label}
          aria-current={i === active}
        >
          <span className="absolute right-full mr-3 whitespace-nowrap rounded-md bg-[#0E0E11]/90 backdrop-blur-md px-3 py-1 text-xs font-medium text-[#F5ECDB] border border-gold-primary/30 shadow-lg opacity-0 translate-x-1 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            {s.label}
          </span>
          <span
            className={`block rounded-full border transition-all duration-300 ${
              i === active
                ? 'w-3.5 h-3.5 bg-gold-primary border-gold-primary shadow-[0_0_6px_rgba(201,162,74,0.4)]'
                : 'w-2.5 h-2.5 bg-transparent border-gold-primary/50 group-hover:bg-gold-primary/60'
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
