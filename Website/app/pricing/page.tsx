import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PricingHero from '@/components/pricing/PricingHero';
import PricingPlans from '@/components/pricing/PricingPlans';
import PricingFAQ from '@/components/pricing/PricingFAQ';
import { pricingData } from '@/lib/static-content';
import { getOGImage } from '@/lib/og-images';
import PricingComparison from '@/components/pricing/PricingComparison';
import PricingCTA from '@/components/pricing/PricingCTA';
import CinematicBreak from '@/components/ui/CinematicBreak';

export const metadata: Metadata = {
  title: 'الأسعار والباقات | Omnira Valet - باقات صف السيارات والفاليه باركينج بأسعار تنافسية',
  description: 'أسعار وباقات خدمات صف السيارات والفاليه باركينج من أومنيرا فاليه في السعودية. باقات مرنة للفعاليات، الفنادق، المطاعم، المراكز التجارية، والشركات. خدمة VIP، باقات شهرية، عقود سنوية، وحلول مخصصة. أسعار تنافسية، جودة عالية، فريق محترف. اطلب عرض سعر مجاني الآن!',
  keywords: [
    'أسعار صف السيارات',
    'باقات الفاليه',
    'تكلفة خدمة valet',
    'أسعار تنافسية',
    'valet parking prices',
    'باقات صف السيارات',
    'أسعار الفاليه باركينج',
    'عروض OMNIRA',
    'باقات شهرية',
    'عقود سنوية',
    'pricing packages',
    'أسعار فاليه',
    'تكلفة صف سيارات',
    'باقات VIP',
    'أسعار خدمات المواقف',
  ],
  authors: [{ name: 'Omnira Valet' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'الأسعار والباقات | أومنيرا فاليه - باقات مرنة بأسعار تنافسية',
    description: 'باقات صف السيارات والفاليه: شهرية، سنوية، VIP، وحلول مخصصة. أسعار تنافسية وجودة عالية. قارن بين الباقات واختر ما يناسبك!',
    url: 'https://omniravalet.com/pricing',
    siteName: 'Omnira Valet',
    images: [getOGImage('pricing')],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'الأسعار والباقات | أومنيرا فاليه',
    description: 'باقات مرنة للفاليه وصف السيارات - أسعار تنافسية وجودة عالية. احصل على عرض سعر الآن!',
    images: [getOGImage('pricing').url],
    creator: '@elorepariss',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PricingPage() {
  // إعداد بيانات مهيكلة للأسعار لتحسين السيو
  const pricingSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': 'خدمات أومنيرا فاليه لصف السيارات',
    'description': 'خدمات فاليه باركينج وإدارة مواقف السيارات في المملكة العربية السعودية',
    'provider': {
      '@type': 'Organization',
      'name': 'Omnira Valet',
      'url': 'https://omniravalet.com'
    },
    'offers': [
      ...pricingData.map((plan, index) => ({
        '@type': 'Offer',
        'name': plan.title,
        'description': `باقة ${plan.title} من أومنيرا فاليه`,
        'priceSpecification': {
          '@type': 'PriceSpecification',
          'price': plan.price.replace(/[^0-9]/g, ''),
          'priceCurrency': 'SAR',
        },
        'url': `https://omniravalet.com${plan.link}`,
      }))
    ]
  };

  return (
    <>
      {/* إضافة بيانات مهيكلة */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pricingSchema),
        }}
      />
      
      <main className="min-h-screen bg-black-primary">
        <Header />
        <PricingHero />
        <PricingPlans />
        <PricingComparison />
        <CinematicBreak image="/images/atmos/atmos-1.jpg" kicker="قيمة حقيقية">
          استثمارٌ في تجربة وصول
          <span className="text-gold-light"> تُحدِث الفرق</span>.
        </CinematicBreak>
        <PricingFAQ />
        <PricingCTA />
        <Footer />
      </main>
    </>
  );
}
