import { Metadata } from 'next';
import dynamic from 'next/dynamic';
import HeroSection from "@/components/home/HeroSection";
import Header from "@/components/layout/Header";
import PrefetchLinks from "@/components/PrefetchLinks";
import { jsonLdWebsite, jsonLdOrganization } from '@/lib/seo-config';
import { getOGImage } from '@/lib/og-images';

// Critical sections - SSR enabled
const BeyondServices = dynamic(() => import("@/components/home/BeyondServices"), {
  ssr: true,
});

const HorizontalSectors = dynamic(() => import("@/components/home/HorizontalSectors"), {
  ssr: true,
});

const EditorialManifesto = dynamic(() => import("@/components/home/EditorialManifesto"), {
  ssr: true,
});

const AtmosphericStatement = dynamic(() => import("@/components/home/AtmosphericStatement"), {
  ssr: true,
});

const KineticStats = dynamic(() => import("@/components/home/KineticStats"), {
  ssr: true,
});

const GalleryMarquee = dynamic(() => import("@/components/home/GalleryMarquee"), {
  ssr: true,
});

const ScrollRevealStatement = dynamic(() => import("@/components/home/ScrollRevealStatement"), {
  ssr: true,
});

const Testimonials = dynamic(() => import("@/components/home/Testimonials"), {
  ssr: false,
  loading: () => <div className="h-96" />
});

const CTASection = dynamic(() => import("@/components/home/CTASection"), { 
  ssr: false,
  loading: () => <div className="h-64" />
});

const Footer = dynamic(() => import("@/components/layout/Footer"), { 
  ssr: true
});

export const metadata: Metadata = {
  title: 'Omnira Valet | خدمات صف السيارات الاحترافية والإدارة الذكية للمواقف في السعودية',
  description: 'شركة سعودية رائدة في خدمات الفاليه باركينج (Valet Parking) والإدارة الذكية لمواقف السيارات. نساهم في تحقيق رؤية المملكة 2030 من خلال حلول متطورة لقطاع الضيافة والسياحة. نخدم الفنادق، المطاعم، المراكز التجارية، والفعاليات في جميع مدن المملكة. احجز الآن!',
  keywords: [
    'صف سيارات',
    'فاليه باركينج',
    'valet parking',
    'إدارة مواقف السيارات',
    'خدمات صف السيارات السعودية',
    'صف سيارات احترافي',
    'فاليه باركينج الرياض',
    'صف سيارات جدة',
    'إدارة المواقف',
    'خدمات الفاليه',
    'صف سيارات للفنادق',
    'صف سيارات للمطاعم',
    'صف سيارات للفعاليات',
    'أومنيرا',
    'OMNIRA',
    'حلول مواقف السيارات',
    'تقنيات صف السيارات',
    'نظام إدارة المواقف',
    'رؤية المملكة 2030',
    'قطاع الضيافة والسياحة',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  creator: 'Omnira Valet',
  publisher: 'Omnira Valet',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/',
    languages: {
      'ar-SA': '/',
    },
  },
  openGraph: {
    title: 'Omnira Valet | خدمات صف السيارات الاحترافية في السعودية',
    description: 'شركة سعودية رائدة في الفاليه باركينج وإدارة المواقف. حلول ذكية للفنادق، المطاعم، والمراكز التجارية في جميع مدن المملكة.',
    url: 'https://omniravalet.com',
    siteName: 'Omnira Valet',
    images: [getOGImage('home')],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Omnira Valet | خدمات صف السيارات الاحترافية',
    description: 'شركة سعودية رائدة في الفاليه باركينج وإدارة المواقف الذكية',
    images: [getOGImage('home').url],
    creator: '@elorepariss',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Home() {
  const combinedSchema = {
    '@context': 'https://schema.org',
    '@graph': [jsonLdWebsite, jsonLdOrganization],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      <PrefetchLinks />
      <main className="min-h-screen bg-[#0E0E11]">
        <Header />
        <HeroSection />
        <EditorialManifesto />
        <HorizontalSectors />
        <BeyondServices />
        <GalleryMarquee />
        <KineticStats />
        <ScrollRevealStatement />
        <AtmosphericStatement />
        <Testimonials />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
