import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ContactHero from '@/components/contact/ContactHero';
import ContactForm from '@/components/contact/ContactForm';
import ContactInfo from '@/components/contact/ContactInfo';

export const metadata: Metadata = {
  title: 'اتصل بنا | Omnira Valet - تواصل معنا لخدمات صف السيارات والفاليه باركينج',
  description: 'تواصل مع أومنيرا فاليه لخدمات صف السيارات والفاليه باركينج في السعودية. خدمة عملاء 24/7، دعم فني، استشارات مجانية، عروض أسعار فورية. اتصل الآن، راسلنا عبر WhatsApp، أو املأ النموذج. مكتبنا في مركز الملك عبدالله المالي (KAFD) بالرياض. نخدم جميع مدن المملكة. نسعد بخدمتك!',
  keywords: [
    'اتصل بنا',
    'contact us',
    'تواصل معنا',
    'خدمة عملاء',
    'دعم فني',
    'customer service',
    'عنوان أومنيرا',
    'رقم هاتف OMNIRA',
    'واتساب أومنيرا',
    'استشارة مجانية',
    'عرض سعر',
    'مكتب الرياض',
    'خدمة عملاء 24/7',
    'تواصل معنا الآن',
    'رقم الهاتف',
  ],
  authors: [{ name: 'Omnira Valet' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'اتصل بنا | Omnira Valet - خدمة عملاء 24/7 ودعم فني متواصل',
    description: 'تواصل معنا: هاتف، واتساب، بريد إلكتروني. خدمة عملاء 24/7 واستشارات مجانية',
    url: 'https://omniravalet.com/contact',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-contact.jpg',
      width: 1200,
      height: 630,
      alt: 'تواصل مع أومنيرا فاليه',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'اتصل بنا | Omnira Valet',
    description: 'خدمة عملاء 24/7 - تواصل معنا الآن للحصول على استشارة مجانية',
    images: ['https://omniravalet.com/og-contact.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-black-primary">
      <Header />
      <ContactHero />
      <div className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
