import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailHero from '@/components/services/ServiceDetailHero';
import ServiceContent from '@/components/services/ServiceContent';

export const metadata: Metadata = {
  title: 'حلول إدارة المواقف للشركات والمقرات الرئيسية | Omnira Valet - وفر وقت موظفيك واهتم بعملائك',
  description: 'حلول متكاملة لإدارة مواقف الشركات والأبراج المكتبية في السعودية. وفر 30 دقيقة يومياً لكل موظف، انطباع احترافي للعملاء والزوار، عقود سنوية مرنة بأسعار تفضيلية، خدمة VIP للإدارة العليا، نظام اشتراكات للموظفين، إدارة زوار الشركة، تقارير شهرية تفصيلية، تكامل مع أنظمة الأمن، تطبيق جوال للطلب المسبق. نخدم شركات الرياض، جدة، الدمام. باقات من 8,000 ريال شهرياً. خصومات للعقود طويلة الأجل. ROI مثبت في 6 أشهر!',
  keywords: [
    'إدارة مواقف الشركات',
    'corporate parking management Saudi Arabia',
    'حلول مواقف المقرات الرئيسية',
    'valet service corporate',
    'فاليه أبراج مكتبية',
    'اشتراكات مواقف موظفين',
    'خدمة VIP للإدارة',
    'عقود مواقف شركات',
    'إدارة زوار الشركات',
    'تقارير مواقف شهرية',
    'تكامل أمن مواقف',
    'حلول مواقف مؤسسية',
    'توفير وقت الموظفين',
    'انطباع احترافي للشركات',
    'باقات مواقف مرنة',
    'خصومات عقود طويلة',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services/corporate',
  },
  openGraph: {
    title: 'حلول إدارة المواقف للشركات | Omnira Valet - استثمار في إنتاجية فريقك',
    description: 'وفر 30 دقيقة يومياً - عقود مرنة، خدمة VIP، اشتراكات موظفين، تقارير تفصيلية',
    url: 'https://omniravalet.com/services/corporate',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-corporate.jpg',
      width: 1200,
      height: 630,
      alt: 'حلول إدارة المواقف للشركات والمقرات',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'حلول مواقف احترافية للشركات | Omnira Valet',
    description: 'عقود مرنة، VIP للإدارة، اشتراكات موظفين - وفر وقت فريقك',
    images: ['https://omniravalet.com/og-corporate.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function CorporatePage() {
  const serviceData = {
    title: 'حلول صف السيارات للشركات',
    subtitle: 'باقات مخصصة للمقرات الرئيسية والمكاتب الكبرى مع عقود مرنة',
    heroImage: '/images/hero/hero-4.jpg',
    
    overview: {
      title: 'حلول احترافية مصممة لبيئة الأعمال',
      description: `في عالم الأعمال، الوقت أغلى ما يملك المديرون والموظفون. توفير خدمة موقف احترافية ليس مجرد رفاهية، بل استثمار في إنتاجية الفريق ورضا العملاء. نقدم حلولاً متكاملة للشركات بعقود مرنة تناسب احتياجاتك.`,
    },

    benefits: [
      {
        title: 'توفير وقت الموظفين',
        description: 'التركيز على العمل بدلاً من البحث عن موقف',
      },
      {
        title: 'انطباع احترافي للعملاء',
        description: 'استقبال راقٍ يعكس مستوى الشركة',
      },
      {
        title: 'عقود مرنة وشفافة',
        description: 'باقات شهرية وسنوية بأسعار تنافسية',
      },
      {
        title: 'تقارير مفصلة',
        description: 'إحصائيات دقيقة عن الاستخدام والأداء',
      },
      {
        title: 'خدمات VIP للإدارة',
        description: 'مواقف مخصصة واستقبال خاص',
      },
      {
        title: 'تكامل مع أنظمة الشركة',
        description: 'ربط مع الأمن وإدارة المرافق',
      },
    ],

    features: [
      {
        title: 'عقود سنوية مخصصة',
        description: 'باقات شاملة بأسعار تفضيلية وشروط مرنة',
        image: '/images/valet-service.jpg',
      },
      {
        title: 'خدمة VIP للإدارة العليا',
        description: 'مواقف مخصصة، استقبال خاص، سرية تامة',
        image: '/images/professional-team.jpg',
      },
      {
        title: 'نظام اشتراكات للموظفين',
        description: 'بطاقات شهرية بخصومات خاصة للموظفين',
        image: '/images/services/advanced-technology.jpg',
      },
      {
        title: 'إدارة زوار الشركة',
        description: 'تسجيل وتتبع سيارات الضيوف والعملاء',
        image: '/images/smart-parking.jpg',
      },
      {
        title: 'تقارير شهرية تفصيلية',
        description: 'إحصائيات وبيانات لاتخاذ قرارات مستنيرة',
        image: '/images/services/parking-management.jpg',
      },
      {
        title: 'دعم وصيانة مستمرة',
        description: 'فريق دعم متخصص وصيانة دورية',
        image: '/images/valet-hotel.jpg',
      },
    ],

    process: [
      {
        step: 1,
        title: 'تحليل الاحتياجات',
        description: 'دراسة عدد الموظفين والزوار والمساحة',
      },
      {
        step: 2,
        title: 'تصميم الحل المؤسسي',
        description: 'اقتراح نظام يناسب ثقافة الشركة',
      },
      {
        step: 3,
        title: 'مفاوضات العقد',
        description: 'شروط مرنة وأسعار تنافسية',
      },
      {
        step: 4,
        title: 'الإعداد والتكامل',
        description: 'تركيب الأنظمة والربط مع البنية التحتية',
      },
      {
        step: 5,
        title: 'تدريب فريق الأمن',
        description: 'تنسيق مع أمن الشركة والإدارات',
      },
      {
        step: 6,
        title: 'التشغيل والمتابعة',
        description: 'خدمة مستمرة مع مراجعات دورية',
      },
    ],

    clients: [
      'المقرات الرئيسية للشركات',
      'الأبراج المكتبية',
      'المجمعات التجارية',
      'مراكز الأعمال',
      'الشركات متعددة الجنسيات',
      'البنوك والمؤسسات المالية',
      'شركات التقنية والاتصالات',
      'المكاتب الحكومية',
    ],

    faqs: [
      {
        question: 'ما هي مدة العقود المتاحة؟',
        answer: 'نقدم عقوداً شهرية، سنوية، أو متعددة السنوات مع خصومات للعقود الطويلة.',
      },
      {
        question: 'هل يمكن تخصيص الخدمة لموظفين محددين؟',
        answer: 'نعم، يمكننا تقديم بطاقات اشتراك مخصصة لموظفين أو إدارات معينة.',
      },
      {
        question: 'كيف تتعاملون مع زوار الشركة؟',
        answer: 'نوفر نظاماً خاصاً لتسجيل وإدارة سيارات الزوار والضيوف.',
      },
      {
        question: 'هل توفرون خدمات إضافية؟',
        answer: 'نعم، مثل غسيل السيارات، صيانة بسيطة، وشحن السيارات الكهربائية.',
      },
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
