import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailHero from '@/components/services/ServiceDetailHero';
import ServiceContent from '@/components/services/ServiceContent';

export const metadata: Metadata = {
  title: 'خدمة الفاليه VIP الفاخرة لكبار الشخصيات | Omnira Valet - السرية والتميز المطلق',
  description: 'خدمة فاليه VIP فاخرة حصرية لكبار الشخصيات، رجال الأعمال، المشاهير، والدبلوماسيين في السعودية. سرية مطلقة واتفاقيات NDA موقعة، سائقون متخصصون مع فحص خلفية شامل، أولوية قصوى بدون أي انتظار، مواقف مخصصة آمنة مراقبة 24/7، خدمة شخصية مصممة حسب تفضيلاتك، خبرة في جميع السيارات الفاخرة والكلاسيكية، خدمات إضافية راقية (تهيئة، تنظيف، صيانة)، متاح 24/7 متى احتجت. نخدم الرياض، جدة، الدمام. تسعير حسب الطلب. استشارة خاصة وسرية.',
  keywords: [
    'خدمة VIP فاخرة',
    'valet VIP Saudi Arabia',
    'فاليه كبار الشخصيات',
    'luxury valet service',
    'خدمة فاليه للمشاهير',
    'valet service celebrities',
    'فاليه رجال أعمال',
    'سرية تامة فاليه',
    'خدمة شخصية فاخرة',
    'سائقو VIP متخصصون',
    'مواقف آمنة فاخرة',
    'فاليه سيارات فاخرة',
    'خدمة بدون انتظار',
    'فاليه دبلوماسيين',
    'خدمات راقية للشخصيات',
    'حماية خصوصية VIP',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services/vip',
  },
  openGraph: {
    title: 'خدمة VIP الفاخرة لكبار الشخصيات | Omnira Valet - التميز والسرية',
    description: 'خدمة حصرية فاخرة - سرية مطلقة، سائقون متخصصون، أولوية قصوى - للشخصيات المميزة',
    url: 'https://omniravalet.com/services/vip',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-vip.jpg',
      width: 1200,
      height: 630,
      alt: 'خدمة الفاليه VIP الفاخرة لكبار الشخصيات',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'خدمة VIP فاخرة حصرية | Omnira Valet',
    description: 'سرية مطلقة، سائقون متخصصون، خدمة شخصية - للشخصيات المميزة فقط',
    images: ['https://omniravalet.com/og-vip.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function VIPPage() {
  const serviceData = {
    title: 'خدمة VIP الفاخرة',
    subtitle: 'تجربة استثنائية للعملاء المميزين',
    heroImage: '/images/hero/hero-2.jpg',
    
    overview: {
      title: 'الرفاهية القصوى في خدمة صف السيارات',
      description: `خدمة VIP مصممة للشخصيات المميزة. أعلى مستويات الخصوصية والاحترافية.`,
    },

    benefits: [
      { title: 'سرية مطلقة', description: 'حماية كاملة للخصوصية' },
      { title: 'أولوية قصوى', description: 'خدمة فورية بلا انتظار' },
      { title: 'سائقون متخصصون', description: 'مدربون على أعلى المعايير' },
      { title: 'خدمة شخصية', description: 'تخصيص كامل حسب التفضيلات' },
      { title: 'متاح 24/7', description: 'خدمة على مدار الساعة' },
      { title: 'تأمين مميز', description: 'تغطية شاملة للسيارات الفاخرة' },
    ],

    features: [
      { title: 'سائقون متخصصون VIP', description: 'تدريب خاص وخبرة عالية', image: '/images/valet-service.jpg' },
      { title: 'سرية وخصوصية تامة', description: 'بروتوكولات أمنية صارمة', image: '/images/professional-team.jpg' },
      { title: 'مواقف مخصصة آمنة', description: 'مناطق خاصة مراقبة 24/7', image: '/images/services/advanced-technology.jpg' },
      { title: 'خدمة بدون انتظار', description: 'استجابة فورية دائماً', image: '/images/smart-parking.jpg' },
      { title: 'عناية بالسيارات الفاخرة', description: 'خبرة في جميع الماركات', image: '/images/services/parking-management.jpg' },
      { title: 'خدمات إضافية راقية', description: 'تهيئة، تنظيف، صيانة', image: '/images/valet-hotel.jpg' },
    ],

    process: [
      { step: 1, title: 'استشارة خاصة', description: 'لقاء شخصي لفهم التوقعات' },
      { step: 2, title: 'تخصيص الخدمة', description: 'تصميم بروتوكول خاص' },
      { step: 3, title: 'اختيار السائقين', description: 'فريق مختار بعناية' },
      { step: 4, title: 'إعداد البروتوكولات', description: 'إجراءات أمنية وخصوصية' },
      { step: 5, title: 'التجربة الأولية', description: 'اختبار الخدمة والتعديل' },
      { step: 6, title: 'الخدمة المستمرة', description: 'متاحة متى احتجتها' },
    ],

    clients: [
      'كبار الشخصيات',
      'رجال الأعمال البارزين',
      'المشاهير والفنانون',
      'الدبلوماسيون',
      'العائلات الملكية',
      'المديرون التنفيذيون',
      'الشخصيات العامة',
      'الضيوف المميزين',
    ],

    faqs: [
      { question: 'كيف تضمنون السرية؟', answer: 'بروتوكولات صارمة واتفاقيات سرية موقعة.' },
      { question: 'هل السائقون موثوقون؟', answer: 'فحص شامل للخلفية وتدريب متخصص.' },
      { question: 'ما تكلفة الخدمة؟', answer: 'تختلف حسب المتطلبات. نقدم عروضاً مخصصة.' },
      { question: 'هل متاحة للمناسبات الخاصة؟', answer: 'نعم، نخدم جميع أنواع المناسبات والفعاليات.' },
    ],
  };

  return (
    <main className="min-h-screen bg-black-primary">
      <Header />
      <ServiceDetailHero data={serviceData} />
      <ServiceContent data={serviceData} />
      <Footer />
    </main>
  );
}
