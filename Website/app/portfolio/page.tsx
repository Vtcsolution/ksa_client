import { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Calendar } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Image from '@/components/ui/BlurImage';
import RevealMask from '@/components/ui/RevealMask';
import { staticProjects, statisticsData } from '@/lib/static-content';

export const metadata: Metadata = {
  title: 'أعمالنا | Omnira Valet - مشاريع فاليه باركينج وإدارة مواقف',
  description:
    'استعرض مختارات من أعمال أومنيرا فاليه في خدمات صف السيارات وإدارة المواقف للفنادق والمطاعم والمولات والفعاليات في الرياض وجدة والدمام. مشاريع حقيقية بأرقام حقيقية.',
  alternates: { canonical: '/portfolio' },
  openGraph: {
    title: 'أعمالنا | Omnira Valet',
    description: 'مختارات من مشاريع أومنيرا فاليه في صف السيارات وإدارة المواقف عبر المملكة.',
    url: 'https://omniravalet.com/portfolio',
    siteName: 'Omnira Valet',
    locale: 'ar_SA',
    type: 'website',
  },
  robots: { index: true, follow: true },
};

const highlights = [
  { value: `+${statisticsData.activeLocations}`, label: 'موقع نشط' },
  { value: `${(statisticsData.carsParkedDaily / 1000).toFixed(0)}K+`, label: 'سيارة يوميًا' },
  { value: `+${statisticsData.trainedDrivers}`, label: 'سائق مدرّب' },
  { value: `${statisticsData.customersSatisfaction}%`, label: 'رضا العملاء' },
];

export default function PortfolioPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://omniravalet.com/' },
      { '@type': 'ListItem', position: 2, name: 'أعمالنا', item: 'https://omniravalet.com/portfolio' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <main className="min-h-screen bg-[#0A0A0C]">
        <Header />

        <section className="container-custom pb-16 pt-36">
          <div className="mx-auto max-w-3xl text-center">
            <span className="mb-5 inline-flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
              <span className="h-px w-10 bg-gold-primary/50" />
              أعمالنا
            </span>
            <h1 className="text-4xl font-extralight gold-shine-effect sm:text-6xl lg:text-7xl">مشاريع تركت أثرًا</h1>
            <p className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-white/55">
              مختارات من تجارب أدرناها بإتقان — من الفنادق الفاخرة إلى أكبر الفعاليات — بأرقام حقيقية تعكس مستوى الخدمة.
            </p>
          </div>

          {/* aggregate highlights */}
          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] sm:grid-cols-4">
            {highlights.map((h) => (
              <div key={h.label} className="bg-[#0A0A0C] px-6 py-8 text-center">
                <div className="text-3xl font-light text-gold-light sm:text-4xl">{h.value}</div>
                <div className="mt-2 text-xs text-white/45">{h.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* projects grid */}
        <section className="container-custom pb-28">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {staticProjects.map((p) => (
              <article
                key={p.id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] transition-all duration-500 hover:-translate-y-1.5 hover:border-gold-primary/40 hover:shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]"
              >
                <RevealMask className="relative h-64 w-full overflow-hidden">
                  <Image src={p.image} alt={p.title} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0C] via-[#0A0A0C]/30 to-transparent" />
                  <span className="absolute right-4 top-4 rounded-full border border-gold-primary/30 bg-[#0A0A0C]/70 px-4 py-1.5 text-[11px] font-medium text-gold-light backdrop-blur-sm">
                    {p.category}
                  </span>
                </RevealMask>

                <div className="p-8">
                  <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-gold-primary/60" />{p.location}</span>
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-gold-primary/60" />{p.year}</span>
                  </div>
                  <h2 className="mb-3 text-xl font-medium leading-snug text-white transition-colors group-hover:text-gold-light sm:text-2xl">
                    {p.title}
                  </h2>
                  <p className="mb-7 text-sm leading-relaxed text-white/55">{p.summary}</p>

                  <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                    {p.stats.map((s) => (
                      <div key={s.label} className="text-center">
                        <div className="text-lg font-medium text-gold-light">{s.value}</div>
                        <div className="mt-1 text-[10px] leading-tight text-white/40">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container-custom pb-28">
          <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.06] to-white/[0.015] px-8 py-16 text-center">
            <h2 className="mb-4 text-3xl font-light text-white sm:text-4xl">مشروعك القادم يبدأ من هنا</h2>
            <p className="mx-auto mb-9 max-w-lg text-white/55">
              أخبرنا عن منشأتك أو فعاليتك، ودعنا نصمّم لك تجربة صفّ سيارات تليق باسمك.
            </p>
            <Link href="/contact" className="inline-flex rounded-full bg-gold-primary px-10 py-4 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light">
              اطلب عرض سعر
            </Link>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
