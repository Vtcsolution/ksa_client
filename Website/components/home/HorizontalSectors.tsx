'use client';

import Link from 'next/link';
import Image from '@/components/ui/BlurImage';
import { ArrowLeft } from 'lucide-react';

const sectors = [
  { title: 'الفنادق', desc: 'استقبال راقٍ يليق بضيوف الفنادق الفاخرة.', img: '/images/services/hotels-service.jpg', href: '/services/hotels' },
  { title: 'المطاعم', desc: 'تجربة وصول سلسة لروّاد المطاعم الراقية.', img: '/images/services/restaurants-service.jpg', href: '/services/restaurants' },
  { title: 'الفعاليات', desc: 'إدارة وصول مئات السيارات في الفعاليات الكبرى.', img: '/images/services/events-service.jpg', href: '/services/events' },
  { title: 'المراكز التجارية', desc: 'انسيابية وراحة لزوّار المولات والمراكز.', img: '/images/testimonials/mall.jpg', href: '/services/malls' },
  { title: 'الشركات', desc: 'حلول مواقف متكاملة للمقرّات والمنشآت الكبرى.', img: '/images/hero/hero-4.jpg', href: '/services/corporate' },
];

// Robust horizontal gallery: a native snap-scroll row at natural height.
// No sticky / no vh-scrub (that pattern kept collapsing into an empty band).
export default function HorizontalSectors() {
  return (
    <section data-no-reveal className="overflow-hidden bg-[#0A0A0C] py-24 lg:py-32">
      <div className="container-custom">
        <span className="mb-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/90">
          <span className="h-px w-10 bg-gold-primary/60" />
          القطاعات
        </span>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-extralight leading-[1.1] text-white text-4xl sm:text-5xl lg:text-6xl">
            أينما كان وصولك،{' '}
            <span className="text-gold-light">نحن هناك.</span>
          </h2>
          <p className="text-sm tracking-[0.2em] text-white/40">اسحب أفقياً ←</p>
        </div>
      </div>

      <div className="relative mt-12">
        <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[6vw] pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sectors.map((s, i) => (
          <Link
            key={s.title}
            href={s.href}
            className="group relative h-[440px] w-[78vw] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 sm:h-[520px] sm:w-[48vw] lg:w-[34vw]"
          >
            <Image
              src={s.img}
              alt={s.title}
              fill
              sizes="(max-width: 640px) 78vw, (max-width: 1024px) 48vw, 34vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/55 to-[#0A0A0C]/10" />
            <div className="absolute inset-x-0 bottom-0 p-8 lg:p-10">
              <span className="font-mono text-sm text-gold-primary/70">0{i + 1}</span>
              <h3 className="mt-2 font-black text-white text-4xl lg:text-5xl [text-shadow:0_2px_18px_rgba(0,0,0,0.65)]">{s.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">{s.desc}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm text-gold-primary transition-all duration-300 group-hover:gap-3">
                اعرف المزيد
                <ArrowLeft className="h-4 w-4" />
              </span>
            </div>
          </Link>
        ))}
          {/* trailing spacer so the last card can settle away from the edge */}
          <div className="w-[6vw] shrink-0" aria-hidden />
        </div>
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[7vw] bg-gradient-to-l from-[#0A0A0C] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-[7vw] bg-gradient-to-r from-[#0A0A0C] to-transparent" />
      </div>
    </section>
  );
}
