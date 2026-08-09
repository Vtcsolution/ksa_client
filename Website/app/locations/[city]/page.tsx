import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, MapPin } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/ui/PageHero';
import { cities, getCity } from '@/lib/cities';
import { getOGImage } from '@/lib/og-images';

export function generateStaticParams() {
  return cities.map((c) => ({ city: c.slug }));
}

export function generateMetadata({ params }: { params: { city: string } }): Metadata {
  const city = getCity(params.city);
  if (!city) return {};
  const title = `صفّ السيارات في ${city.name} | Omnira Valet`;
  return {
    title,
    description: city.metaDescription,
    alternates: { canonical: `/locations/${city.slug}` },
    openGraph: {
      title,
      description: city.metaDescription,
      url: `https://omniravalet.com/locations/${city.slug}`,
      siteName: 'Omnira Valet',
      images: [getOGImage('locations')],
      locale: 'ar_SA',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: city.metaDescription,
      images: [getOGImage('locations').url],
    },
  };
}

const cityServices = [
  { name: 'الفاليه باركينج', href: '/services/valet-parking' },
  { name: 'إدارة وتشغيل المواقف', href: '/services/parking-management' },
  { name: 'خدمات الفنادق', href: '/services/hotels' },
  { name: 'خدمات المطاعم', href: '/services/restaurants' },
  { name: 'الفعاليات والمناسبات', href: '/services/events' },
  { name: 'التقنيات المتقدمة', href: '/services/advanced-technology' },
];

export default function CityPage({ params }: { params: { city: string } }) {
  const city = getCity(params.city);
  if (!city) notFound();

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: 'https://omniravalet.com/' },
      { '@type': 'ListItem', position: 2, name: 'المدن', item: 'https://omniravalet.com/locations' },
      {
        '@type': 'ListItem',
        position: 3,
        name: city.name,
        item: `https://omniravalet.com/locations/${city.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <main className="min-h-screen bg-[#0A0A0C]">
        <Header />

        <PageHero
          kicker="المدن"
          title="صفّ السيارات في"
          accent={city.name}
          subtitle={city.tagline}
          image={city.image}
        />

        {/* breadcrumb */}
        <nav className="bg-[#0A0A0C]" aria-label="مسار التنقل">
          <div className="container-custom pt-10">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-white/40">
              <li><Link href="/" className="hover:text-gold-primary transition-colors">الرئيسية</Link></li>
              <li className="text-white/25">/</li>
              <li><Link href="/locations" className="hover:text-gold-primary transition-colors">المدن</Link></li>
              <li className="text-white/25">/</li>
              <li className="text-white/70">{city.name}</li>
            </ol>
          </div>
        </nav>

        {/* intro */}
        <section className="bg-[#0A0A0C] py-20 lg:py-28">
          <div className="container-custom">
            <span className="mb-6 flex items-center gap-3 text-[11px] font-medium tracking-[0.3em] text-gold-primary/80">
              <span className="h-px w-10 bg-gold-primary/60" />
              {city.region}
            </span>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
              {city.intro.map((p, i) => (
                <p key={i} className="text-lg font-light leading-relaxed text-white/65">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* services in city */}
        <section className="bg-[#0A0A0C] py-20 lg:py-28">
          <div className="container-custom">
            <h2 className="mb-12 text-3xl font-medium text-white sm:text-4xl">
              خدماتنا في {city.name}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cityServices.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-7 py-6 transition-colors duration-300 hover:border-gold-primary/40"
                >
                  <span className="text-base font-medium text-white/80 group-hover:text-white">{s.name}</span>
                  <ArrowLeft className="h-5 w-5 text-gold-primary transition-transform duration-300 group-hover:-translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* districts served */}
        <section className="bg-[#0A0A0C] py-20 lg:py-28">
          <div className="container-custom">
            <h2 className="mb-4 text-3xl font-medium text-white sm:text-4xl">
              نخدم أحياء {city.name}
            </h2>
            <p className="mb-12 max-w-2xl text-lg font-light leading-relaxed text-white/55">
              تغطّي خدماتنا أبرز أحياء ووجهات {city.name} — من الفنادق والمطاعم إلى المراكز التجارية والفعاليات.
            </p>
            <div className="flex flex-wrap gap-3">
              {city.districts.map((d) => (
                <span
                  key={d}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm text-white/70"
                >
                  <MapPin className="h-3.5 w-3.5 text-gold-primary" />
                  {d}
                </span>
              ))}
            </div>

            <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {city.landmarks.map((l) => (
                <div
                  key={l}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5"
                >
                  <Check className="h-4 w-4 flex-shrink-0 text-gold-primary" />
                  <span className="text-sm text-white/75">{l}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-[#0A0A0C] py-24 lg:py-36">
          <div className="container-custom text-center">
            <h2 className="mx-auto max-w-3xl text-3xl font-extralight leading-snug text-white sm:text-5xl">
              جاهزون لخدمتك في{' '}
              <span className="text-gold-light">{city.name}</span>
            </h2>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-gold-primary px-9 py-3.5 text-sm font-medium text-[#0A0A0C] transition-colors duration-300 hover:bg-gold-light"
              >
                احجز الآن
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-white/20 px-9 py-3.5 text-sm font-medium text-white/80 transition-colors duration-300 hover:border-gold-primary hover:text-white"
              >
                الباقات والأسعار
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
}
