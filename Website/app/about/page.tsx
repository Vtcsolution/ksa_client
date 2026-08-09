import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AboutHero from '@/components/about/AboutHero';
import AboutContent from '@/components/about/AboutContent';
import { generateArticleSchema } from '@/lib/seo-config';
import { getOGImage } from '@/lib/og-images';

export const metadata: Metadata = {
  title: 'من نحن - قصة أومنيرا فاليه | Omnira Valet - شركة سعودية رائدة في خدمات صف السيارات الاحترافية',
  description: 'تعرف على قصة أومنيرا فاليه، الشركة السعودية الرائدة في خدمات الفاليه باركينج وإدارة مواقف السيارات. نساهم في تحقيق رؤية 2030 من خلال تقديم خدمات متطورة لقطاع الضيافة والسياحة. قيمنا: الاحترافية، الأمانة، التميز، والابتكار.',
  keywords: [
    'من نحن أومنيرا',
    'OMNIRA company',
    'شركة صف سيارات سعودية',
    'قصة نجاح أومنيرا',
    'رؤية ورسالة OMNIRA',
    'رؤية المملكة 2030',
    'فريق أومنيرا',
    'قيم الشركة',
    'السجل التجاري 7051975600',
    'شركة فاليه باركينج',
    'إدارة مواقف احترافية',
    'خدمات صف سيارات متطورة',
    'شركة سعودية',
    'about us valet parking',
    'parking management company Saudi Arabia',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  creator: 'Omnira Valet',
  publisher: 'Omnira Valet',
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/about',
    languages: {
      'ar-SA': '/about',
    },
  },
  openGraph: {
    title: 'من نحن - أومنيرا فاليه | قصة نجاح سعودية في صف السيارات',
    description: 'شركة سعودية رائدة في الفاليه باركينج وإدارة المواقف. نساهم في تحقيق رؤية 2030. تعرف على قصتنا، رؤيتنا، قيمنا، وفريقنا المحترف.',
    url: 'https://omniravalet.com/about',
    siteName: 'Omnira Valet',
    images: [getOGImage('about')],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'من نحن - أومنيرا فاليه | شركة سعودية رائدة في صف السيارات',
    description: 'قصة نجاح سعودية في خدمات الفاليه باركينج وإدارة المواقف',
    images: [getOGImage('about').url],
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

export default function AboutPage() {
  const articleSchema = generateArticleSchema({
    title: 'من نحن - قصة أومنيرا فاليه',
    description: 'تعرف على أومنيرا فاليه، الشركة السعودية الرائدة في خدمات صف السيارات الاحترافية',
    url: '/about',
    image: 'https://omniravalet.com/og-about.jpg',
    dateModified: new Date().toISOString(),
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <main className="min-h-screen bg-[#0E0E11]">
        <Header />
        <AboutHero />
        <AboutContent />
        <Footer />
      </main>
    </>
  );
}
