import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailHero from '@/components/services/ServiceDetailHero';
import ServiceContent from '@/components/services/ServiceContent';

export const metadata: Metadata = {
  title: 'حلول إدارة مواقف المراكز التجارية الذكية | Omnira Valet - نظام متطور يزيد الإشغال 40%',
  description: 'نظام إدارة مواقف ذكي للمراكز التجارية والمولات الكبرى في السعودية. نزيد السعة الاستيعابية بنسبة 30-40% بدون توسعات، نقلل وقت البحث عن موقف 60%، شاشات LED توجيهية، تطبيق جوال للحجز المسبق، دفع إلكتروني متعدد، مراقبة 24/7، تقارير تحليلية فورية، أمن متقدم. نخدم مولات الرياض، جدة، الدمام، مكة. نحسّن تجربة التسوق ونزيد رضا الزوار. ROI مثبت خلال 12 شهر. استشارة مجانية وعرض توضيحي!',
  keywords: [
    'إدارة مواقف المراكز التجارية',
    'mall parking management Saudi Arabia',
    'نظام مواقف ذكي للمولات',
    'smart parking system',
    'إدارة مواقف مولات الرياض',
    'parking management shopping centers',
    'نظام توجيه مواقف LED',
    'تطبيق حجز مواقف',
    'حل ازدحام المواقف',
    'زيادة سعة المواقف',
    'تقارير تحليلية مواقف',
    'نظام دفع إلكتروني مواقف',
    'أمن مواقف المولات',
    'تحسين تجربة التسوق',
    'إدارة مواقف احترافية',
    'تكنولوجيا مواقف متقدمة',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services/malls',
  },
  openGraph: {
    title: 'حلول إدارة مواقف المراكز التجارية الذكية | Omnira Valet - زيادة 40% في السعة',
    description: 'نظام ذكي متطور - شاشات LED، تطبيق جوال، دفع إلكتروني، تقارير فورية - نحسّن تجربة التسوق',
    url: 'https://omniravalet.com/services/malls',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-malls.jpg',
      width: 1200,
      height: 630,
      alt: 'حلول إدارة المواقف الذكية للمراكز التجارية',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'نظام مواقف ذكي للمولات | Omnira Valet',
    description: 'زيادة السعة 40%، تقليل الازدحام، تحسين التجربة - حلول متطورة للمراكز التجارية',
    images: ['https://omniravalet.com/og-malls.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function MallsPage() {
  const serviceData = {
    title: 'إدارة مواقف المراكز التجارية',
    subtitle: 'حلول ذكية ومتطورة لإدارة المواقف وزيادة رضا المتسوقين',
    heroImage: '/images/testimonials/mall.jpg',
    
    overview: {
      title: 'نظام إدارة مواقف ذكي يحول التحدي إلى ميزة تنافسية',
      description: `إدارة مواقف المراكز التجارية الكبرى تحدٍ يومي يؤثر مباشرة على تجربة المتسوقين ورضاهم. في أومنيرا فاليه، نقدم حلولاً تقنية متقدمة تحول هذا التحدي إلى ميزة تنافسية قوية. نظامنا الذكي يجمع بين التكنولوجيا المتطورة والإدارة البشرية الاحترافية لضمان تجربة سلسة ومريحة لكل زائر.`,
    },

    benefits: [
      {
        title: 'زيادة رضا المتسوقين',
        description: 'تجربة موقف سلسة تشجع على العودة والتوصية',
      },
      {
        title: 'استغلال أمثل للمساحات',
        description: 'زيادة السعة بنسبة 30-40% بدون توسعات',
      },
      {
        title: 'تقليل الازدحام والانتظار',
        description: 'نظام توجيه ذكي يقلل وقت البحث عن موقف',
      },
      {
        title: 'تقارير وإحصائيات دقيقة',
        description: 'بيانات فورية عن الإشغال والتدفق',
      },
      {
        title: 'تحسين الأمن والسلامة',
        description: 'مراقبة 24/7 ونظام استجابة سريع',
      },
      {
        title: 'زيادة الإيرادات',
        description: 'تحسين الكفاءة يزيد عدد الزوار',
      },
    ],

    features: [
      {
        title: 'نظام توجيه ذكي',
        description: 'شاشات LED تعرض المواقف المتاحة في كل طابق ومنطقة',
        image: '/images/valet-service.jpg',
      },
      {
        title: 'تطبيق جوال متكامل',
        description: 'حجز مسبق، توجيه للموقف، دفع إلكتروني',
        image: '/images/professional-team.jpg',
      },
      {
        title: 'نظام دفع متعدد',
        description: 'نقدي، بطاقات، محافظ رقمية، اشتراكات',
        image: '/images/services/advanced-technology.jpg',
      },
      {
        title: 'مراقبة وأمن متقدم',
        description: 'كاميرات، دوريات، استجابة فورية',
        image: '/images/smart-parking.jpg',
      },
      {
        title: 'فريق إدارة محترف',
        description: 'مشرفون وموظفون مدربون على مدار الساعة',
        image: '/images/services/parking-management.jpg',
      },
      {
        title: 'تقارير تحليلية شاملة',
        description: 'إحصائيات مفصلة لاتخاذ قرارات مبنية على البيانات',
        image: '/images/valet-hotel.jpg',
      },
    ],

    process: [
      {
        step: 1,
        title: 'دراسة وتحليل',
        description: 'تحليل شامل للموقف الحالي والتحديات',
      },
      {
        step: 2,
        title: 'تصميم الحل',
        description: 'اقتراح نظام مخصص حسب الاحتياجات',
      },
      {
        step: 3,
        title: 'التركيب والإعداد',
        description: 'تركيب الأنظمة والبنية التحتية',
      },
      {
        step: 4,
        title: 'التدريب',
        description: 'تدريب الفريق على الأنظمة والعمليات',
      },
      {
        step: 5,
        title: 'التشغيل التجريبي',
        description: 'فترة تجريبية لضبط الأداء',
      },
      {
        step: 6,
        title: 'التشغيل والدعم',
        description: 'إدارة كاملة مع دعم مستمر',
      },
    ],

    clients: [
      'المراكز التجارية الكبرى',
      'المولات الإقليمية',
      'مراكز التسوق المحلية',
      'الأسواق المركزية',
      'مجمعات البيع بالتجزئة',
      'المراكز الترفيهية',
      'مراكز المعارض',
      'المجمعات التجارية',
    ],

    faqs: [
      {
        question: 'كم تكلفة نظام الإدارة الذكي؟',
        answer: 'التكلفة تعتمد على حجم الموقف، عدد الطوابق، والأنظمة المطلوبة. نقدم حلولاً متدرجة تناسب مختلف الميزانيات.',
      },
      {
        question: 'كم يستغرق التركيب؟',
        answer: 'عادةً 4-8 أسابيع حسب حجم المشروع، مع إمكانية العمل على مراحل لتقليل التأثير على التشغيل.',
      },
      {
        question: 'هل يمكن التكامل مع الأنظمة الحالية؟',
        answer: 'نعم، أنظمتنا مصممة للتكامل مع معظم الأنظمة الموجودة.',
      },
      {
        question: 'هل توفرون التشغيل والصيانة؟',
        answer: 'نعم، نقدم خدمة إدارة كاملة شاملة التشغيل والصيانة الدورية.',
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
