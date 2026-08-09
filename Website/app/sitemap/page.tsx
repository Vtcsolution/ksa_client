import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'خريطة الموقع | أومنيرا فاليه - تصفح كافة صفحات وخدمات أومنيرا فاليه',
  description:
    'تصفح خريطة موقع أومنيرا فاليه وابحث بسهولة عن الخدمات والصفحات التي تحتاجها. خدمات فاليه باركينج، إدارة المواقف، وحلول صف السيارات المتكاملة في الرياض، جدة، والدمام.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/sitemap' },
};

const sitemapData = {
  mainPages: [
    { name: 'الرئيسية', url: '/' },
    { name: 'من نحن', url: '/about' },
    { name: 'الخدمات', url: '/services' },
    { name: 'أعمالنا', url: '/portfolio' },
    { name: 'المقالات', url: '/blog' },
    { name: 'الباقات والأسعار', url: '/pricing' },
    { name: 'المدن', url: '/locations' },
    { name: 'اتصل بنا', url: '/contact' },
  ],
  services: [
    { name: 'خدمة الفاليه باركينج', url: '/services/valet-parking' },
    { name: 'إدارة وتشغيل المواقف', url: '/services/parking-management' },
    { name: 'التقنيات المتقدمة', url: '/services/advanced-technology' },
    { name: 'المنظمين المحترفين', url: '/services/professional-organizers' },
    { name: 'الاستشارات الهندسية', url: '/services/consultation' },
    { name: 'خدمة الجولف كار', url: '/services/golf-cart' },
    { name: 'الخدمات المساندة', url: '/services/support-services' },
    { name: 'خدمة غسيل السيارات', url: '/services/car-wash' },
  ],
  clientSectors: [
    { name: 'خدمات الفنادق', url: '/services/hotels' },
    { name: 'خدمات المطاعم', url: '/services/restaurants' },
    { name: 'خدمات المولات', url: '/services/malls' },
    { name: 'خدمات الفعاليات', url: '/services/events' },
    { name: 'خدمات المستشفيات', url: '/services/hospitals' },
    { name: 'خدمات الشركات', url: '/services/corporate' },
    { name: 'خدمات VIP', url: '/services/vip' },
  ],
  locations: [
    { name: 'الرياض', url: '/locations/riyadh' },
    { name: 'جدة', url: '/locations/jeddah' },
    { name: 'الدمام', url: '/locations/dammam' },
    { name: 'مكة المكرمة', url: '/locations/makkah' },
    { name: 'المدينة المنورة', url: '/locations/madinah' },
  ],
};

function LinkGroup({ title, items }: { title: string; items: { name: string; url: string }[] }) {
  return (
    <div className="mb-16">
      <h2 className="mb-7 flex items-center gap-3 text-[12px] font-medium tracking-[0.25em] text-gold-primary/80">
        <span className="h-px w-10 bg-gold-primary/50" />
        {title}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((page) => (
          <li key={page.url}>
            <Link
              href={page.url}
              className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 transition-colors duration-300 hover:border-gold-primary/40"
            >
              <span className="text-sm text-white/70 transition-colors group-hover:text-white">{page.name}</span>
              <ArrowLeft className="h-4 w-4 text-gold-primary opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SitemapPage() {
  return (
    <main className="min-h-screen bg-[#0A0A0C]">
      <Header />

      <section className="container-custom pb-24 pt-36">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h1 className="text-4xl font-extralight gold-shine-effect sm:text-6xl">خريطة الموقع</h1>
            <p className="mt-6 text-lg font-light text-white/55">
              تصفّح جميع صفحات وخدمات أومنيرا فاليه بسهولة
            </p>
          </div>

          <LinkGroup title="الصفحات الرئيسية" items={sitemapData.mainPages} />
          <LinkGroup title="خدماتنا" items={sitemapData.services} />
          <LinkGroup title="قطاعات العملاء" items={sitemapData.clientSectors} />
          <LinkGroup title="المدن" items={sitemapData.locations} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
