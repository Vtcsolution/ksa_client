import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LocationsHero from '@/components/locations/LocationsHero';
import LocationsGrid from '@/components/locations/LocationsGrid';
import dynamic from 'next/dynamic';
import { generateFAQSchema } from '@/lib/schemas';
import { getOGImage } from '@/lib/og-images';
import CinematicBreak from '@/components/ui/CinematicBreak';

// استيراد مكون الخريطة التفاعلية بشكل ديناميكي لتفادي مشاكل الترميز على الخادم
const InteractiveMap = dynamic(
  () => import('@/components/locations/InteractiveMap'),
  { ssr: false }
);

export const metadata: Metadata = {
  title: 'المدن التي نخدمها | Omnira Valet - خدمات فاليه باركينج في 150+ مدينة سعودية',
  description: 'خدمات صف السيارات والفاليه باركينج من أومنيرا فاليه متوفرة في أكثر من 150 مدينة سعودية. خدماتنا تغطي الرياض، جدة، الدمام، مكة المكرمة، المدينة المنورة، الخبر، الطائف، تبوك، أبها، وجميع مدن المملكة. فريق محترف متواجد في كل منطقة.',
  keywords: [
    'مدن السعودية',
    'خدمات صف سيارات الرياض',
    'فاليه جدة',
    'صف سيارات الدمام',
    'valet parking Riyadh',
    'مواقف الخبر',
    'فاليه الطائف',
    'صف سيارات مكة',
    'فاليه المدينة',
    'خدمات المدن السعودية',
    'صف سيارات القطيف',
    'فاليه الجبيل',
    'مواقف أبها',
    'صف سيارات تبوك',
    'فاليه باركينج السعودية',
  ],
  authors: [{ name: 'Omnira Valet' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/locations',
  },
  openGraph: {
    title: 'المدن التي نخدمها | Omnira Valet - تغطية شاملة لـ 150+ مدينة سعودية',
    description: 'خدمات صف السيارات في جميع مدن السعودية: الرياض، جدة، الدمام، مكة، المدينة، الخبر، الطائف، وأكثر',
    url: 'https://omniravalet.com/locations',
    siteName: 'Omnira Valet',
    images: [getOGImage('locations')],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'المدن التي نخدمها | Omnira Valet',
    description: '150+ مدينة سعودية - خدمات صف السيارات والفاليه في جميع أنحاء المملكة',
    images: [getOGImage('locations').url],
    creator: '@elorepariss',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function LocationsPage() {
  // الأسئلة الشائعة حول المواقع
  const locationsFAQs = [
    {
      question: 'هل تقدمون خدماتكم في جميع مدن المملكة؟',
      answer: 'نعم، نقدم خدماتنا في أكثر من 150 مدينة ومحافظة في جميع مناطق المملكة العربية السعودية من خلال فروعنا وشبكة شركائنا المحليين.'
    },
    {
      question: 'كيف يمكنني طلب خدماتكم في مدينتي؟',
      answer: 'يمكنك التواصل معنا مباشرة عبر صفحة الاتصال أو الاتصال بالرقم الموحد، وسنقوم بتوجيهك للفرع الأقرب لك أو ترتيب الخدمة عن بعد.'
    },
    {
      question: 'هل تختلف أسعار الخدمات من مدينة لأخرى؟',
      answer: 'تعتمد أسعار خدماتنا على عدة عوامل منها المدينة، نوع الخدمة، حجم المشروع، والمدة. نقدم أسعاراً تنافسية في جميع المناطق مع مراعاة الاختلافات اللوجستية.'
    },
    {
      question: 'كم تستغرق عملية بدء الخدمة في المدن البعيدة؟',
      answer: 'نستطيع بدء الخدمة في معظم المدن الرئيسية خلال 24-48 ساعة. أما المدن النائية والمحافظات البعيدة فقد تستغرق من 3-5 أيام حسب المتطلبات اللوجستية.'
    },
  ];

  // بيانات مهيكلة للمواقع
  const locationsSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'Omnira Valet',
    'url': 'https://omniravalet.com/locations',
    'areaServed': [
      {
        '@type': 'AdministrativeArea',
        'name': 'المملكة العربية السعودية',
        'containsPlace': [
          { '@type': 'City', 'name': 'الرياض' },
          { '@type': 'City', 'name': 'جدة' },
          { '@type': 'City', 'name': 'الدمام' },
          { '@type': 'City', 'name': 'مكة المكرمة' },
          { '@type': 'City', 'name': 'المدينة المنورة' },
          { '@type': 'City', 'name': 'الخبر' },
          { '@type': 'City', 'name': 'الطائف' },
          { '@type': 'City', 'name': 'تبوك' },
          { '@type': 'City', 'name': 'أبها' },
          { '@type': 'City', 'name': 'حائل' },
          { '@type': 'City', 'name': 'نجران' },
          { '@type': 'City', 'name': 'الباحة' },
          { '@type': 'City', 'name': 'جازان' }
        ]
      }
    ]
  };

  // بيانات مهيكلة للأسئلة الشائعة
  const faqSchema = generateFAQSchema(locationsFAQs);
  
  return (
    <>
      {/* إضافة البيانات المهيكلة */}
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(locationsSchema) }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
      <main className="min-h-screen bg-beige-primary">
        <Header />
        <LocationsHero />
        <InteractiveMap />
        <CinematicBreak image="/images/atmos/atmos-3.jpg" kicker="حضورنا">
          أينما كنت في المملكة،
          <span className="text-gold-light"> نحن أقرب مما تظن</span>.
        </CinematicBreak>
        <LocationsGrid />
        <Footer />
      </main>
    </>
  );
}
