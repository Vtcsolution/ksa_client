import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServiceDetailHero from '@/components/services/ServiceDetailHero';
import ServiceContent from '@/components/services/ServiceContent';
import { generateServiceSchema, generateFAQSchema } from '@/lib/seo-config';

export const metadata: Metadata = {
  title: 'خدمات الفاليه باركينج الفاخرة | Omnira Valet - Valet Parking احترافي في السعودية',
  description: 'خدمات فاليه باركينج (Valet Parking) فاخرة من أومنيرا فاليه للفنادق الـ 5 نجوم، المطاعم الراقية، الفعاليات الكبرى. فريق محترف مدرب، تأمين شامل، زي موحد أنيق، خدمة VIP استثنائية. نخدم الرياض، جدة، الدمام وجميع مدن المملكة. احجز الآن واحصل على انطباع أول لا يُنسى لعملائك!',
  keywords: [
    'فاليه باركينج',
    'valet parking',
    'خدمات فاليه',
    'صف سيارات فاخر',
    'فاليه باركينج الرياض',
    'valet parking Riyadh',
    'فاليه جدة',
    'صف سيارات للفنادق',
    'فاليه للمطاعم',
    'خدمة صف السيارات',
    'فاليه باركينج احترافي',
    'valet service Saudi Arabia',
    'luxury valet parking',
    'professional car parking service',
    'hotel valet service',
    'restaurant valet parking',
    'سائق فاليه محترف',
    'استقبال السيارات الفاخرة',
    'خدمة VIP valet',
  ],
  authors: [{ name: 'Omnira Valet' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services/valet-parking',
  },
  openGraph: {
    title: 'خدمات الفاليه باركينج الفاخرة | Omnira Valet - انطباع أول مميز',
    description: 'فاليه باركينج احترافي للفنادق والمطاعم والفعاليات. فريق مدرب، تأمين شامل، خدمة 24/7',
    url: 'https://omniravalet.com/services/valet-parking',
    siteName: 'Omnira Valet',
    images: [{
      url: 'https://omniravalet.com/og-valet-parking.jpg',
      width: 1200,
      height: 630,
      alt: 'خدمات الفاليه باركينج الفاخرة من أومنيرا فاليه',
    }],
    locale: 'ar_SA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فاليه باركينج فاخر | Omnira Valet',
    description: 'خدمات valet parking احترافية للفنادق والمطاعم والفعاليات في السعودية',
    images: ['https://omniravalet.com/og-valet-parking.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ValetParkingPage() {
  // Enhanced SEO Schema
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "خدمات الفاليه باركينج الفاخرة",
    "alternateName": "Valet Parking Service",
    "description": "خدمات فاليه باركينج احترافية للفنادق والمطاعم والفعاليات في المملكة العربية السعودية",
    "serviceType": "Valet Parking",
    "provider": {
      "@type": "Organization",
      "name": "Omnira Valet",
      "url": "https://omniravalet.com",
      "logo": "https://omniravalet.com/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+966551962033",
        "contactType": "customer service",
        "areaServed": "SA",
        "availableLanguage": ["Arabic", "English"]
      }
    },
    "areaServed": {
      "@type": "Country",
      "name": "Saudi Arabia"
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "باقات الفاليه باركينج",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "خدمة فاليه للفعاليات"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "خدمة فاليه للفنادق"
          }
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "خدمة فاليه للمطاعم"
          }
        }
      ]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
    }
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": "https://omniravalet.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "الخدمات",
        "item": "https://omniravalet.com/services"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "فاليه باركينج",
        "item": "https://omniravalet.com/services/valet-parking"
      }
    ]
  };

  const serviceData = {
    title: 'تقديم خدمات الفاليه باركينج',
    subtitle: 'استقبال المركبات وإيقافها بعناية لضمان راحة العملاء',
    heroImage: '/images/services/valet-parking.jpg',
    
    overview: {
      title: 'خدمة فاليه باركينج احترافية تليق بعملائك',
      description: `خدمة الفاليه باركينج (Valet Parking) ليست مجرد إيقاف للسيارات، بل هي تجربة فاخرة تبدأ من اللحظة الأولى التي يصل فيها ضيفك أو عميلك إلى موقعك. في أومنيرا فاليه، نفهم تماماً أن الانطباع الأول يدوم، ولهذا نحرص على تقديم خدمة فاليه باركينج استثنائية تعكس مستوى الرقي والاحترافية التي تتميز بها منشأتك.

فريقنا من السائقين المحترفين مدرب على أعلى مستوى في فن استقبال الضيوف وخدمة العملاء. كل سائق يرتدي زياً موحداً أنيقاً ويتمتع بمهارات قيادة متقدمة ومعرفة تامة ببروتوكولات السلامة والأمان. نحن لا نقوم فقط بإيقاف السيارات؛ بل نخلق تجربة سلسة وراقية تجعل ضيوفك يشعرون بالتقدير والاهتمام من اللحظة الأولى.

خدماتنا تشمل الاستقبال الحار، فتح الأبواب، المساعدة في إنزال الأمتعة إذا لزم الأمر، تسليم تذكرة إلكترونية أنيقة، إيقاف السيارة بعناية فائقة في موقع آمن، والأهم من ذلك كله - إعادة السيارة في أسرع وقت ممكن عندما يطلبها العميل دون أي انتظار.

نستخدم أنظمة تتبع متقدمة لضمان معرفة موقع كل سيارة في جميع الأوقات، مما يضمن سرعة استرجاعها. كما أن جميع سياراتنا مؤمنة تأميناً شاملاً طوال فترة تواجدها تحت رعايتنا، مما يمنحك ويمنح عملاءك راحة البال التامة.`,
    },

    benefits: [
      {
        title: 'انطباع أول مميز',
        description: 'خدمة الفاليه تعطي انطباعاً فورياً بالرقي والاهتمام بتفاصيل تجربة العميل، مما يعزز صورة منشأتك ويزيد من ولاء العملاء',
      },
      {
        title: 'راحة قصوى للعملاء',
        description: 'يوفر على عملائك عناء البحث عن موقف، المشي مسافات طويلة، أو القلق بشأن سلامة سياراتهم',
      },
      {
        title: 'استغلال أمثل للمساحات',
        description: 'سائقونا المحترفون يمكنهم إيقاف السيارات بكثافة أعلى، مما يزيد من سعة الموقف بنسبة تصل إلى 40%',
      },
      {
        title: 'ميزة تنافسية',
        description: 'تقديم خدمة فاليه يميزك عن منافسيك ويجذب شريحة أوسع من العملاء الذين يقدرون الخدمة المتميزة',
      },
      {
        title: 'أمان وتأمين شامل',
        description: 'جميع المركبات مؤمنة تأميناً شاملاً، مع سائقين مدربين على أعلى معايير القيادة الآمنة',
      },
      {
        title: 'خدمة سريعة',
        description: 'أنظمة تتبع متقدمة تضمن استرجاع السيارات في أقل من 3 دقائق في معظم الحالات',
      },
    ],

    features: [
      {
        title: 'سائقون محترفون ومدربون',
        description: 'فريقنا يخضع لبرنامج تدريبي مكثف يشمل مهارات القيادة المتقدمة، بروتوكولات السلامة، خدمة العملاء الراقية، والتعامل مع السيارات الفاخرة والرياضية. كل سائق يتمتع برخصة قيادة سارية، سجل قيادة نظيف، وخبرة لا تقل عن 3 سنوات.',
        image: '/images/valet-service.jpg',
      },
      {
        title: 'زي موحد احترافي',
        description: 'سائقونا يرتدون زياً موحداً أنيقاً ومهنياً يعكس مستوى الخدمة الراقية. يمكننا تخصيص الزي ليتماشى مع هوية منشأتك البصرية إذا رغبت في ذلك.',
        image: '/images/professional-team.jpg',
      },
      {
        title: 'نظام تذاكر إلكتروني',
        description: 'نستخدم نظام تذاكر إلكتروني متقدم مع أكواد QR فريدة لكل سيارة. يمكن للعميل استرجاع سيارته بسهولة عبر مسح الكود أو عبر التطبيق، مما يلغي الحاجة للتذاكر الورقية.',
        image: '/images/services/advanced-technology.jpg',
      },
      {
        title: 'تطبيق جوال للعملاء',
        description: 'نوفر تطبيق جوال يسمح للعملاء بطلب سياراتهم مسبقاً قبل النزول، تتبع موقع السيارة، والدفع إلكترونياً. التطبيق متاح لأنظمة iOS و Android.',
        image: '/images/smart-parking.jpg',
      },
      {
        title: 'خدمات إضافية اختيارية',
        description: 'نقدم خدمات قيمة مضافة مثل: غسيل سريع للسيارة، ملء الوقود، فحص ضغط الإطارات، وحتى شحن السيارات الكهربائية إذا كانت البنية التحتية متوفرة.',
        image: '/images/services/parking-management.jpg',
      },
      {
        title: 'تأمين شامل وحماية كاملة',
        description: 'نوفر تأميناً شاملاً من شركات تأمين معتمدة يغطي جميع المخاطر المحتملة. كما نستخدم كاميرات توثيق لحالة السيارة عند الاستلام والتسليم.',
        image: '/images/valet-hotel.jpg',
      },
    ],

    process: [
      {
        step: 1,
        title: 'الاستقبال والترحيب',
        description: 'يستقبل السائق العميل بابتسامة ودية وتحية احترافية. يفتح باب السيارة ويساعد في إنزال أي أمتعة أو أغراض.',
      },
      {
        step: 2,
        title: 'التفتيش والتوثيق',
        description: 'يقوم السائق بتفتيش سريع للسيارة وتوثيق حالتها من خلال تطبيق خاص، مع التقاط صور إذا لزم الأمر. هذا يحمي الطرفين.',
      },
      {
        step: 3,
        title: 'إصدار التذكرة',
        description: 'يتم إصدار تذكرة إلكترونية مع رمز QR فريد، يمكن استلامها عبر البريد الإلكتروني أو الرسائل النصية أو التطبيق.',
      },
      {
        step: 4,
        title: 'الإيقاف الآمن',
        description: 'يقوم السائق بإيقاف السيارة في موقع آمن ومحدد في نظام التتبع، مع التأكد من إغلاق جميع الأبواب والنوافذ.',
      },
      {
        step: 5,
        title: 'الطلب المسبق',
        description: 'يمكن للعميل طلب سيارته مسبقاً عبر التطبيق أو الاتصال أو الرسائل، حتى تكون جاهزة عند وصوله.',
      },
      {
        step: 6,
        title: 'الإحضار السريع والتسليم',
        description: 'يحضر السائق السيارة بسرعة، يتأكد من نظافتها، ويسلمها للعميل مع فتح الباب والتأكد من رضاه التام.',
      },
    ],

    clients: [
      'الفنادق الفاخرة والمنتجعات',
      'المطاعم الراقية',
      'مراكز التسوق الكبرى',
      'قاعات الأفراح والمناسبات',
      'المراكز الطبية الخاصة',
      'الأندية الرياضية والاجتماعية',
      'المكاتب والأبراج التجارية',
      'المعارض والمؤتمرات',
    ],

    faqs: [
      {
        question: 'كم عدد السائقين المطلوب لخدمة فاليه فعالة؟',
        answer: 'يعتمد ذلك على حجم المنشأة وتدفق الحركة. عادةً، نوصي بسائق واحد لكل 20-30 سيارة في الساعة. للفعاليات الكبيرة أو أوقات الذروة، قد نحتاج إلى فريق أكبر. نقوم بدراسة احتياجاتك بدقة ونقترح العدد الأمثل.',
      },
      {
        question: 'هل السيارات مؤمنة أثناء خدمة الفاليه؟',
        answer: 'نعم، جميع السيارات مؤمنة تأميناً شاملاً من الطرف الثالث يغطي الأضرار، السرقة، وأي مخاطر محتملة. التأمين ساري طوال فترة وجود السيارة تحت رعايتنا.',
      },
      {
        question: 'كم من الوقت يستغرق إحضار السيارة؟',
        answer: 'هدفنا هو إحضار السيارة في أقل من 3 دقائق من لحظة الطلب. في أوقات الذروة، قد يستغرق الأمر 5-7 دقائق كحد أقصى. نظامنا الذكي يتتبع موقع كل سيارة لضمان أسرع استرجاع ممكن.',
      },
      {
        question: 'هل تتعاملون مع السيارات الفاخرة والرياضية؟',
        answer: 'بالتأكيد. سائقونا مدربون خصيصاً على التعامل مع جميع أنواع السيارات بما في ذلك السيارات الفاخرة، الرياضية، والكلاسيكية. لدينا بروتوكولات خاصة للسيارات عالية القيمة.',
      },
      {
        question: 'ما هي تكلفة خدمة الفاليه؟',
        answer: 'التكلفة تعتمد على عدة عوامل: عدد السائقين المطلوب، ساعات التشغيل، حجم الموقف، والخدمات الإضافية. نقدم باقات مرنة شهرية وسنوية، أو تسعير بناءً على الفعاليات. تواصل معنا للحصول على عرض سعر مخصص.',
      },
      {
        question: 'هل يمكن تخصيص الخدمة حسب احتياجاتنا؟',
        answer: 'نعم تماماً. نحن نقدم حلولاً مخصصة بالكامل. يمكننا ارتداء زي بهوية منشأتك، استخدام بطاقات مخصصة، تقديم خدمات إضافية خاصة، وأي تخصيصات أخرى تحتاجها.',
      },
    ],
  };

  return (
    <>
      {/* SEO Schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      <main className="min-h-screen bg-[#0E0E11]">
        <Header />
        <ServiceDetailHero data={serviceData} />
        <ServiceContent data={serviceData} />
        <Footer />
      </main>
    </>
  );
}
