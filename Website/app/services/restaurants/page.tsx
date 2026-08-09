import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailHero from '@/components/services/ServiceDetailHero';
import ServiceContent from '@/components/services/ServiceContent';

export const metadata: Metadata = {
  title: 'خدمات الفاليه باركينج للمطاعم والكافيهات | Omnira Valet - عزز تجربة عملائك',
  description: 'خدمات فاليه باركينج احترافية للمطاعم الراقية والكافيهات الفاخرة في السعودية. عزز تجربة تناول الطعام، اجذب عملاء جدد، تميز عن المنافسين. خدمة سريعة في أوقات الذروة، سائقون مهذبون بزي موحد أنيق، أسعار تنافسية جداً، باقات مرنة (بدوام كامل أو أوقات محددة)، خدمات إضافية (غسيل سريع، ملء وقود). نخدم مطاعم الرياض، جدة، الدمام، مكة. باقات من 3,000 ريال شهرياً. استشارة وزيارة موقع مجانية!',
  keywords: [
    'فاليه باركينج للمطاعم',
    'restaurant valet parking Saudi Arabia',
    'خدمات صف سيارات المطاعم الراقية',
    'valet service restaurants',
    'فاليه مطاعم الرياض',
    'صف سيارات كافيهات',
    'خدمة فاليه سريعة للمطاعم',
    'أسعار فاليه مطاعم',
    'باقات فاليه مرنة',
    'restaurant parking management',
    'فاليه أوقات الذروة',
    'تحسين تجربة المطعم',
    'جذب عملاء للمطاعم',
    'خدمات قيمة مضافة مطاعم',
    'عقود فاليه مطاعم',
    'حل مشكلة مواقف المطاعم',
  ],
  authors: [{ name: 'Omnira Valet', url: 'https://omniravalet.com' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services/restaurants',
  },
  openGraph: {
    title: 'خدمات الفاليه باركينج للمطاعم | Omnira Valet - تجربة تناول طعام لا تُنسى',
    description: 'عزز تجربة عملائك مع فاليه احترافي - خدمة سريعة، أسعار تنافسية، باقات مرنة',
    url: 'https://omniravalet.com/services/restaurants',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-restaurants.jpg',
      width: 1200,
      height: 630,
      alt: 'خدمات الفاليه للمطاعم والكافيهات',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فاليه احترافي للمطاعم | Omnira Valet',
    description: 'خدمة سريعة، أسعار منافسة، باقات مرنة - عزز تجربة عملائك',
    images: ['https://omniravalet.com/og-restaurants.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
};

export default function RestaurantsPage() {
  const serviceData = {
    title: 'خدمات صف السيارات للمطاعم',
    subtitle: 'عزز تجربة عملائك مع خدمة فاليه احترافية',
    heroImage: '/images/services/restaurants-service.jpg',
    
    overview: {
      title: 'خدمة فاليه تحول تجربة تناول الطعام',
      description: `في عالم المطاعم الراقية، كل تفصيل يهم. خدمة الفاليه باركينج عنصر أساسي يميز مطعمك ويعكس مستوى الخدمة الراقية. نقدم حلولاً مرنة للمطاعم والكافيهات.`,
    },

    benefits: [
      {
        title: 'جذب عملاء جدد',
        description: 'خدمة الفاليه تجذب شريحة أوسع من العملاء',
      },
      {
        title: 'تحسين التجربة',
        description: 'راحة العميل من لحظة الوصول',
      },
      {
        title: 'ميزة تنافسية',
        description: 'تميزك عن المطاعم المنافسة',
      },
      {
        title: 'زيادة الإيرادات',
        description: 'زيادة معدل دوران الطاولات',
      },
      {
        title: 'حل نقص المواقف',
        description: 'تحويل التحدي إلى ميزة',
      },
      {
        title: 'مرونة في التشغيل',
        description: 'خدمة حسب احتياجاتك',
      },
    ],

    features: [
      {
        title: 'خدمة سريعة',
        description: 'فريق مدرب على الكفاءة في أوقات الذروة',
        image: '/images/valet-service.jpg',
      },
      {
        title: 'زي موحد أنيق',
        description: 'يعكس هوية مطعمك',
        image: '/images/professional-team.jpg',
      },
      {
        title: 'أسعار تنافسية',
        description: 'باقات مرنة تناسب ميزانيتك',
        image: '/images/services/advanced-technology.jpg',
      },
      {
        title: 'حجز مسبق',
        description: 'عبر التطبيق أو الموقع',
        image: '/images/smart-parking.jpg',
      },
      {
        title: 'خدمات إضافية',
        description: 'غسيل وتهيئة السيارة',
        image: '/images/services/parking-management.jpg',
      },
      {
        title: 'دعم تسويقي',
        description: 'مساعدة في الترويج للخدمة',
        image: '/images/valet-hotel.jpg',
      },
    ],

    process: [
      {
        step: 1,
        title: 'استشارة مجانية',
        description: 'زيارة وتقييم الموقع',
      },
      {
        step: 2,
        title: 'تصميم الحل',
        description: 'اقتراح يناسب احتياجاتك',
      },
      {
        step: 3,
        title: 'اختيار الباقة',
        description: 'بدوام كامل أو أوقات محددة',
      },
      {
        step: 4,
        title: 'التدريب',
        description: 'تدريب الفريق على معاييرك',
      },
      {
        step: 5,
        title: 'التشغيل التجريبي',
        description: 'بدء لفترة تجريبية',
      },
      {
        step: 6,
        title: 'التشغيل الكامل',
        description: 'خدمة متواصلة مع التحسين',
      },
    ],

    clients: [
      'المطاعم الفاخرة',
      'الكافيهات الراقية',
      'مطاعم الأسطح',
      'المطاعم الدولية',
      'مطاعم الفنادق',
      'مطاعم البوفيه المفتوح',
      'المطاعم الشعبية الراقية',
      'الصالات والمقاهي',
    ],

    faqs: [
      {
        question: 'كم تكلفة الخدمة للمطاعم؟',
        answer: 'التكلفة تعتمد على حجم المطعم، ساعات التشغيل، وعدد السائقين. نقدم باقات مرنة تبدأ من أسعار تنافسية جداً.',
      },
      {
        question: 'هل يمكن تشغيل الخدمة في أوقات محددة فقط؟',
        answer: 'بالتأكيد. يمكنك تفعيلها فقط في أوقات الذروة، عطلات نهاية الأسبوع، أو المناسبات الخاصة.',
      },
      {
        question: 'كم سائق نحتاج؟',
        answer: 'لمطعم متوسط، عادةً 2-3 سائقين في أوقات الذروة تكون كافية. نقوم بدراسة احتياجاتك بدقة.',
      },
      {
        question: 'هل الخدمة مؤمنة؟',
        answer: 'نعم، جميع السيارات مؤمنة تأميناً شاملاً طوال فترة وجودها تحت رعايتنا.',
      },
      {
        question: 'كيف نروج للخدمة لعملائنا؟',
        answer: 'نوفر لك لافتات، منشورات، ومواد تسويقية جاهزة للاستخدام على وسائل التواصل الاجتماعي.',
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
