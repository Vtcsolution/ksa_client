import { Metadata } from 'next';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ServicesHero from '@/components/services/ServicesHero';
import ServicesGrid from '@/components/services/ServicesGrid';
import { jsonLdWebsite } from '@/lib/seo-config';
import { getOGImage } from '@/lib/og-images';
import { RichContent, PageType } from '@/lib/seo-content';
import { RelatedLinks, ContentCategory, SidebarLinks } from '@/lib/internal-links';
import { generateFAQSchema } from '@/lib/schemas';
import CinematicBreak from '@/components/ui/CinematicBreak';

export const metadata: Metadata = {
  title: 'خدماتنا الاحترافية | أومنيرا فاليه - 8 حلول متكاملة لإدارة وصف السيارات في السعودية',
  description: 'اكتشف خدماتنا الشاملة في الفاليه باركينج، إدارة المواقف، التقنيات الذكية مع أنظمة ANPR وإنترنت الأشياء، فريق منظمين محترفين، استشارات هندسية، خدمة جولف كار، خدمات مساندة، وغسيل سيارات. حلول متكاملة للفنادق، المطاعم، المولات، والفعاليات في الرياض، جدة، والدمام.',
  keywords: [
    'خدمات صف السيارات',
    'خدمات الفاليه باركينج',
    'إدارة مواقف السيارات',
    'valet parking services',
    'خدمات مواقف احترافية',
    'تقنيات صف السيارات الذكية',
    'منظمي مواقف السيارات',
    'استشارات مواقف السيارات',
    'خدمة جولف كار',
    'غسيل سيارات احترافي',
    'خدمات مساندة للمواقف',
    'حلول مواقف متكاملة',
    'إدارة مواقف تجارية',
    'نظام صف السيارات',
    'parking management services Saudi Arabia',
  ],
  authors: [{ name: 'Omnira Valet' }],
  metadataBase: new URL('https://omniravalet.com'),
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'خدماتنا الاحترافية | أومنيرا فاليه - 8 حلول متكاملة لصف السيارات',
    description: 'حلول شاملة: الفاليه باركينج، إدارة المواقف، التقنيات الذكية، منظمين محترفين، استشارات، جولف كار، خدمات مساندة، وغسيل سيارات',
    url: 'https://omniravalet.com/services',
    siteName: 'Omnira Valet',
    locale: 'ar_SA',
    type: 'website',
    images: [getOGImage('services')],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'خدمات أومنيرا فاليه - 8 حلول متميزة لصف السيارات',
    description: 'خدمات احترافية متكاملة لإدارة وصف السيارات في السعودية',
    images: [getOGImage('services').url],
    creator: '@elorepariss',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ServicesPage() {
  // البيانات المنظمة للخدمات
  const servicesSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'item': {
          '@type': 'Service',
          'name': 'خدمات الفاليه باركينج',
          'url': 'https://omniravalet.com/services/valet-parking',
          'description': 'خدمة فاليه باركينج فاخرة للفنادق والمطاعم والفعاليات',
          'provider': {
            '@type': 'Organization',
            'name': 'Omnira Valet',
            'url': 'https://omniravalet.com',
          }
        }
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'item': {
          '@type': 'Service',
          'name': 'إدارة وتشغيل المواقف',
          'url': 'https://omniravalet.com/services/parking-management',
          'description': 'خدمات متكاملة لإدارة وتشغيل مواقف السيارات',
          'provider': {
            '@type': 'Organization',
            'name': 'Omnira Valet',
            'url': 'https://omniravalet.com',
          }
        }
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'item': {
          '@type': 'Service',
          'name': 'التقنيات المتقدمة',
          'url': 'https://omniravalet.com/services/advanced-technology',
          'description': 'حلول تقنية متقدمة لإدارة المواقف',
          'provider': {
            '@type': 'Organization',
            'name': 'Omnira Valet',
            'url': 'https://omniravalet.com',
          }
        }
      },
    ]
  };
  
  // الأسئلة الشائعة حول الخدمات
  const servicesFAQs = [
    {
      question: 'ما هي خدمات أومنيرا فاليه الرئيسية؟',
      answer: 'تقدم أومنيرا فاليه مجموعة متكاملة من الخدمات تشمل: خدمات الفاليه باركينج الاحترافية، إدارة وتشغيل المواقف، التقنيات المتقدمة لإدارة المواقف، خدمات الفعاليات والمناسبات، وخدمات مخصصة للفنادق والمطاعم والمراكز التجارية.'
    },
    {
      question: 'هل خدمات أومنيرا فاليه متوفرة في جميع مناطق المملكة؟',
      answer: 'نعم، توفر أومنيرا فاليه خدماتها في جميع المناطق الرئيسية في المملكة العربية السعودية، بما في ذلك الرياض، جدة، الدمام، مكة المكرمة، المدينة المنورة، وغيرها من المدن.'
    },
    {
      question: 'كيف يمكنني طلب خدمة خاصة لمنشأتي؟',
      answer: 'يمكنك التواصل معنا عبر صفحة الاتصال أو الاتصال المباشر. سيقوم فريق خدمة العملاء بتوجيهك لاختيار الخدمة المناسبة وتقديم عرض سعر مخصص وفقاً لاحتياجات منشأتك.'
    },
    {
      question: 'ما الذي يميز خدمات أومنيرا فاليه عن المنافسين؟',
      answer: 'تتميز أومنيرا فاليه بفريق عمل احترافي مدرب على أعلى مستوى، أحدث التقنيات في مجال إدارة المواقف، تأمين شامل على جميع المركبات، وحلول مخصصة لكل عميل تراعي طبيعة المنشأة واحتياجاتها الخاصة.'
    },
  ];
  
  // إنشاء مخطط الأسئلة الشائعة
  const faqSchema = generateFAQSchema(servicesFAQs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <main className="min-h-screen bg-[#0E0E11]">
        <Header />
        <ServicesHero />
        <ServicesGrid />

        <CinematicBreak image="/images/atmos/atmos-1.jpg" kicker="خدماتنا">
          من الاستقبال إلى المغادرة،
          <span className="text-gold-light"> نحن في كل تفصيلة</span>.
        </CinematicBreak>

        {/* قسم المحتوى الغني للسيو */}
        <section className="py-16 bg-beige-light">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* المحتوى الرئيسي */}
              <div className="w-full lg:w-2/3">
                <RichContent 
                  type={PageType.SERVICES}
                  className="bg-[#141418] p-8 rounded-xl shadow-sm"
                />
              </div>
              
              {/* الشريط الجانبي */}
              <div className="w-full lg:w-1/3">
                <div className="space-y-6">
                  <SidebarLinks 
                    category={ContentCategory.SERVICES} 
                    currentPath="/services" 
                  />
                  
                  {/* الروابط ذات الصلة */}
                  <div className="bg-[#141418] p-6 rounded-lg shadow-sm">
                    <RelatedLinks 
                      currentCategory={ContentCategory.SERVICES}
                      currentPath="/services"
                      count={4}
                      title="صفحات قد تهمك"
                    />
                  </div>
                  
                  {/* دعوة للتواصل */}
                  <div className="bg-gold-primary/10 p-6 rounded-lg border border-gold-primary/20">
                    <h3 className="text-xl font-bold mb-4 text-brown-dark">احصل على استشارة مجانية</h3>
                    <p className="mb-4 text-brown-text">
                      تحدث مع أحد خبرائنا لاختيار الخدمة المناسبة لمنشأتك
                    </p>
                    <a 
                      href="/contact?source=services" 
                      className="inline-block px-6 py-2 bg-gold-primary text-[#0A0A0C] font-medium rounded-full hover:bg-gold-light transition-colors duration-300"
                    >
                      تواصل معنا
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* قسم الأسئلة الشائعة */}
        <section className="py-16 bg-[#0E0E11]">
          <div className="container mx-auto px-4">
            <h2 className="text-4xl sm:text-5xl font-black mb-10 text-center gold-shine-effect leading-[1.1]">الأسئلة الشائعة حول خدماتنا</h2>
            
            <div className="max-w-3xl mx-auto bg-beige-light rounded-xl p-6">
              <div className="space-y-6">
                {servicesFAQs.map((faq, index) => (
                  <div key={index} className="bg-[#141418] rounded-lg p-5 shadow-sm">
                    <h3 className="text-lg font-bold mb-2 text-brown-dark">{faq.question}</h3>
                    <p className="text-[#C8B58A]">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <Footer />
      </main>
    </>
  );
}
