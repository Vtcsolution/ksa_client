import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isAuthed } from '@/lib/leads/auth';
import { listTestimonials, computeTestimonialStats } from '@/lib/testimonials/store';
import TestimonialsClient from './TestimonialsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'شهادات العملاء | أومنيرا فاليه',
  robots: { index: false, follow: false, nocache: true },
};

export default async function TestimonialsDashboardPage() {
  if (!isAuthed()) redirect('/dashboard/login');
  const testimonials = await listTestimonials();
  const stats = computeTestimonialStats(testimonials);
  return <TestimonialsClient initialTestimonials={testimonials} initialStats={stats} />;
}
