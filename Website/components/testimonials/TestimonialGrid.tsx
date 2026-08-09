'use client';

import { useState, useMemo } from 'react';
import { Star, Quote } from 'lucide-react';
import type { Testimonial, SegmentId } from '@/lib/testimonials/types';
import { SEGMENTS } from '@/lib/testimonials/types';

const SEGMENT_LABELS: Record<SegmentId, string> = {
  hotels: 'فنادق',
  restaurants: 'مطاعم',
  malls: 'مولات',
  hospitals: 'مستشفيات',
  halls: 'قاعات',
  complexes: 'مجمّعات',
};

export default function TestimonialGrid({ testimonials }: { testimonials: Testimonial[] }) {
  const [filter, setFilter] = useState<SegmentId | 'all'>('all');
  const shown = useMemo(() => (filter === 'all' ? testimonials : testimonials.filter((t) => t.segment === filter)), [testimonials, filter]);

  if (testimonials.length === 0) {
    return <div className="rounded-2xl border border-white/10 bg-white/[0.02] py-16 text-center text-white/40">لا توجد شهادات منشورة بعد.</div>;
  }

  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === 'all' ? 'border-gold-primary/50 bg-gold-primary/10 text-gold-light' : 'border-white/10 text-white/50 hover:text-white'}`}
        >
          الكل
        </button>
        {SEGMENTS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${filter === s ? 'border-gold-primary/50 bg-gold-primary/10 text-gold-light' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            {SEGMENT_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((t) => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] p-6">
            <Quote className="mb-3 h-6 w-6 text-gold-primary/50" />
            <p className="mb-4 text-sm leading-relaxed text-white/80">{t.quote}</p>
            <div className="flex items-center gap-1" dir="ltr">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} className={`h-3.5 w-3.5 ${n <= t.rating ? 'fill-gold-primary text-gold-primary' : 'text-white/15'}`} />
              ))}
            </div>
            <div className="mt-3 border-t border-white/10 pt-3">
              <p className="text-sm font-medium text-white">{t.name}</p>
              {t.role && <p className="text-xs text-white/40">{t.role}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
