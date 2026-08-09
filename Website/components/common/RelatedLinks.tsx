'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';

export type RelatedLink = {
  title: string;
  href: string;
  description?: string;
  category?: string;
  importance?: 'primary' | 'secondary';
};

interface RelatedLinksProps {
  currentPath: string;
  title?: string;
  showDescription?: boolean;
  maxLinks?: number;
  className?: string;
}

/**
 * مكون لعرض الروابط ذات الصلة بالصفحة الحالية
 * يساعد في تحسين تجربة المستخدم وتسهيل التنقل بين الصفحات المتعلقة
 * وكذلك تحسين السيو من خلال الروابط الداخلية المترابطة
 */
export default function RelatedLinks({
  currentPath,
  title = 'صفحات ذات صلة',
  showDescription = true,
  maxLinks = 5,
  className = '',
}: RelatedLinksProps) {
  const [relatedLinks, setRelatedLinks] = useState<RelatedLink[]>([]);
  
  // قائمة جميع الروابط الداخلية مع وصفها وتصنيفها — ثابتة (لا تعتمد على props/state)،
  // لذلك تُبنى مرة واحدة فقط عبر useMemo بدل إعادة إنشائها في كل render
  const allLinks: Record<string, RelatedLink[]> = useMemo(() => {
  const allLinks: Record<string, RelatedLink[]> = {
    '/': [
      {
        title: 'خدماتنا',
        href: '/services',
        description: 'استكشف مجموعة خدماتنا المتكاملة في مجال صف السيارات وإدارة المواقف',
        category: 'main',
        importance: 'primary',
      },
      {
        title: 'الباقات والأسعار',
        href: '/pricing',
        description: 'باقات متنوعة بأسعار تنافسية لتناسب احتياجات منشأتك',
        category: 'main',
        importance: 'primary',
      },
      {
        title: 'المواقع التي نخدمها',
        href: '/locations',
        description: 'نقدم خدماتنا في أكثر من 150 مدينة في المملكة العربية السعودية',
        category: 'main',
        importance: 'primary',
      },
    ],
    '/about': [
      {
        title: 'تواصل معنا',
        href: '/contact',
        description: 'نسعد بالإجابة على استفساراتك وتقديم عروض أسعار مخصصة',
        category: 'main',
        importance: 'primary',
      },
      {
        title: 'قصص نجاحنا',
        href: '/success-stories',
        description: 'قصص نجاح حقيقية مع عملائنا في مختلف القطاعات',
        category: 'testimonials',
        importance: 'secondary',
      },
      {
        title: 'فريق العمل',
        href: '/team',
        description: 'تعرف على فريقنا المحترف من الخبراء والمتخصصين',
        category: 'about',
        importance: 'primary',
      },
    ],
    '/services': [
      {
        title: 'خدمة الفاليه باركينج',
        href: '/services/valet-parking',
        description: 'سائقين محترفين لصف السيارات في الفنادق والمطاعم والفعاليات',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'إدارة المواقف',
        href: '/services/parking-management',
        description: 'حلول متكاملة لإدارة وتشغيل مواقف السيارات',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمة الفعاليات',
        href: '/services/events',
        description: 'تنظيم مواقف السيارات في المناسبات والمؤتمرات والمعارض',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمة الفنادق',
        href: '/services/hotels',
        description: 'خدمات فاليه متميزة للفنادق على مدار الساعة',
        category: 'services',
        importance: 'secondary',
      },
      {
        title: 'خدمة المطاعم',
        href: '/services/restaurants',
        description: 'خدمة صف سيارات احترافية لضيوف المطاعم والمقاهي',
        category: 'services',
        importance: 'secondary',
      },
    ],
    '/services/valet-parking': [
      {
        title: 'خدمة الفنادق',
        href: '/services/hotels',
        description: 'خدمات فاليه متخصصة للفنادق والمنتجعات',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمة المطاعم',
        href: '/services/restaurants',
        description: 'حلول الفاليه للمطاعم والمقاهي الراقية',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمة الفعاليات',
        href: '/services/events',
        description: 'خدمات صف السيارات في المناسبات والفعاليات الكبرى',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'الباقات والأسعار',
        href: '/pricing',
        description: 'تعرف على الباقات المتاحة وأسعارها التنافسية',
        category: 'main',
        importance: 'secondary',
      },
    ],
    '/services/parking-management': [
      {
        title: 'التقنيات المتقدمة',
        href: '/services/advanced-technology',
        description: 'أحدث التقنيات في مجال إدارة المواقف وأنظمة الحجز',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمات الشركات',
        href: '/services/corporate',
        description: 'حلول إدارة المواقف للشركات والمجمعات التجارية',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'المنظمين المحترفين',
        href: '/services/professional-organizers',
        description: 'كوادر مدربة لتنظيم حركة السيارات وإدارة المواقف',
        category: 'services',
        importance: 'secondary',
      },
      {
        title: 'عملاؤنا',
        href: '/clients',
        description: 'قائمة عملائنا من المؤسسات والشركات الرائدة',
        category: 'about',
        importance: 'secondary',
      },
    ],
    '/services/events': [
      {
        title: 'خدمة الفاليه باركينج',
        href: '/services/valet-parking',
        description: 'خدمات الفاليه المتكاملة للفعاليات الخاصة والعامة',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'المنظمين المحترفين',
        href: '/services/professional-organizers',
        description: 'فريق تنظيم متخصص في إدارة المواقف في الفعاليات الكبرى',
        category: 'services',
        importance: 'primary',
      },
      {
        title: 'خدمة الجولف كار',
        href: '/services/golf-cart',
        description: 'خدمة نقل كبار الشخصيات والضيوف داخل الفعاليات',
        category: 'services',
        importance: 'secondary',
      },
      {
        title: 'معرض أعمالنا',
        href: '/portfolio',
        description: 'مشاريعنا السابقة في تنظيم الفعاليات الكبرى والمناسبات',
        category: 'portfolio',
        importance: 'secondary',
      },
    ],
    '/pricing': [
      {
        title: 'خدماتنا',
        href: '/services',
        description: 'تعرف على جميع الخدمات المتاحة لدينا',
        category: 'main',
        importance: 'primary',
      },
      {
        title: 'عروض خاصة',
        href: '/special-offers',
        description: 'أحدث العروض والخصومات لعملائنا الجدد والحاليين',
        category: 'promotions',
        importance: 'primary',
      },
      {
        title: 'طلب عرض سعر',
        href: '/contact?type=quote',
        description: 'احصل على عرض سعر مخصص لمنشأتك',
        category: 'main',
        importance: 'primary',
      },
      {
        title: 'الأسئلة الشائعة',
        href: '/faq',
        description: 'إجابات على الأسئلة الشائعة حول خدماتنا وأسعارنا',
        category: 'support',
        importance: 'secondary',
      },
    ],
    '/locations': [
      {
        title: 'خدماتنا في الرياض',
        href: '/locations/riyadh',
        description: 'تفاصيل خدماتنا في العاصمة الرياض ومناطقها',
        category: 'locations',
        importance: 'primary',
      },
      {
        title: 'خدماتنا في جدة',
        href: '/locations/jeddah',
        description: 'نطاق خدماتنا في مدينة جدة والمناطق المحيطة',
        category: 'locations',
        importance: 'primary',
      },
      {
        title: 'خدماتنا في الدمام',
        href: '/locations/dammam',
        description: 'خدمات أومنيرا فاليه في الدمام والمنطقة الشرقية',
        category: 'locations',
        importance: 'primary',
      },
      {
        title: 'تواصل معنا',
        href: '/contact',
        description: 'استفسر عن خدماتنا في مدينتك',
        category: 'main',
        importance: 'secondary',
      },
    ],
    '/contact': [
      {
        title: 'الأسئلة الشائعة',
        href: '/faq',
        description: 'إجابات على الأسئلة المتكررة قبل التواصل معنا',
        category: 'support',
        importance: 'primary',
      },
      {
        title: 'مواقع فروعنا',
        href: '/locations',
        description: 'تعرف على فروعنا في مختلف مدن المملكة',
        category: 'locations',
        importance: 'primary',
      },
      {
        title: 'خدماتنا',
        href: '/services',
        description: 'استعرض خدماتنا قبل التواصل معنا',
        category: 'main',
        importance: 'secondary',
      },
      {
        title: 'من نحن',
        href: '/about',
        description: 'تعرف على شركة أومنيرا فاليه وتاريخها',
        category: 'about',
        importance: 'secondary',
      },
    ],
  };

  // روابط إضافية لصفحات الخدمات الفرعية
  const serviceSubpages = [
    '/services/hotels',
    '/services/restaurants',
    '/services/corporate',
    '/services/malls',
    '/services/hospitals',
  ];

  // إنشاء روابط تلقائية لصفحات الخدمات الفرعية
  serviceSubpages.forEach(path => {
    if (!allLinks[path]) {
      allLinks[path] = [
        {
          title: 'جميع الخدمات',
          href: '/services',
          description: 'العودة لصفحة الخدمات الرئيسية',
          category: 'services',
          importance: 'primary',
        },
        {
          title: 'خدمة الفاليه باركينج',
          href: '/services/valet-parking',
          description: 'خدمات الفاليه الاحترافية',
          category: 'services',
          importance: 'primary',
        },
        {
          title: 'إدارة المواقف',
          href: '/services/parking-management',
          description: 'خدمات إدارة المواقف المتكاملة',
          category: 'services',
          importance: 'primary',
        },
        {
          title: 'طلب عرض سعر',
          href: '/contact?type=quote',
          description: 'احصل على عرض سعر مخصص',
          category: 'main',
          importance: 'secondary',
        },
      ];
    }
  });

  return allLinks;
  }, []);

  // تجهيز الروابط ذات الصلة
  useEffect(() => {
    // 1. البحث عن الصفحة الحالية
    let links: RelatedLink[] = [];
    
    // 2. محاولة العثور على تطابق مباشر
    if (allLinks[currentPath]) {
      links = allLinks[currentPath];
    } else {
      // 3. البحث عن تطابق جزئي للمسارات الفرعية
      const parentPaths = Object.keys(allLinks).filter(path => 
        currentPath.startsWith(path) && path !== '/'
      );
      
      if (parentPaths.length > 0) {
        // أخذ أطول مسار متطابق
        const bestMatch = parentPaths.reduce((a, b) => a.length > b.length ? a : b);
        links = allLinks[bestMatch];
      } else {
        // 4. استخدام روابط الصفحة الرئيسية كاحتياطي
        links = allLinks['/'];
      }
    }
    
    // 5. استثناء الرابط الحالي نفسه
    links = links.filter(link => link.href !== currentPath);
    
    // 6. تحديد أقصى عدد من الروابط
    setRelatedLinks(links.slice(0, maxLinks));
  }, [currentPath, maxLinks, allLinks]);

  if (relatedLinks.length === 0) {
    return null;
  }

  return (
    <div className={`bg-beige-light p-6 rounded-lg shadow-sm ${className}`}>
      <h3 className="text-lg font-bold text-brown-dark mb-4">{title}</h3>
      <ul className="space-y-3">
        {relatedLinks.map((link, index) => (
          <li key={index}>
            <Link 
              href={link.href} 
              className="group flex items-start hover:text-gold-primary transition-colors duration-300"
            >
              <ChevronLeft className="w-4 h-4 mt-1 flex-shrink-0 text-gold-primary group-hover:translate-x-[-2px] transition-transform" />
              <div className="flex-1">
                <span className="font-medium text-brown-dark group-hover:text-gold-primary">{link.title}</span>
                {showDescription && link.description && (
                  <p className="text-sm text-[#C8B58A] mt-1">{link.description}</p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
