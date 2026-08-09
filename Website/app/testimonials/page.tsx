import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import TestimonialForm from '@/components/testimonials/TestimonialForm';
import TestimonialGrid from '@/components/testimonials/TestimonialGrid';
import { listApprovedTestimonials } from '@/lib/testimonials/store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'آراء عملائنا | Omnira Valet',
  description: 'قصص حقيقية من عملاء أومنيرا فاليه — وشارك تجربتك أنت أيضًا.',
  metadataBase: new URL('https://omniravalet.com'),
  alternates: { canonical: '/testimonials' },
  robots: { index: true, follow: true },
};

export default async function TestimonialsPage() {
  const testimonials = await listApprovedTestimonials();

  return (
    <main className="min-h-screen bg-black-primary">
      <Header />
      <div className="section-padding pt-32">
        <div className="container-custom">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-medium text-white lg:text-5xl">آراء عملائنا</h1>
            <p className="text-lg text-white/55">قصص حقيقية من عملاء حقيقيين اختاروا أومنيرا فاليه.</p>
          </div>

          <TestimonialGrid testimonials={testimonials} />

          <div className="mx-auto mt-16 max-w-xl">
            <TestimonialForm />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
