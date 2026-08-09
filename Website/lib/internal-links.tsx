/**
 * نظام الروابط الداخلية - يساعد في تحسين بنية الروابط وتحسين السيو
 * هذا الملف يعمل كمرجع مركزي لجميع الروابط الداخلية في الموقع
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

// تحديد فئات المحتوى الرئيسية
export enum ContentCategory {
  HOME = 'home',
  SERVICES = 'services',
  PRICING = 'pricing',
  LOCATIONS = 'locations',
  ABOUT = 'about',
  CONTACT = 'contact',
}

// تعريف أنواع البيانات لتحسين التوافق مع TypeScript
interface LinkInfo {
  href: string;
  title: string;
  description: string;
}

// أنواع الصفحات الرئيسية
export type MainPageKey = 'home' | 'about' | 'services' | 'pricing' | 'locations' | 'contact';

// أنواع صفحات الخدمات
export type ServiceKey = 'valetParking' | 'parkingManagement' | 'hotels' | 'restaurants' | 'events' | 'technology';

// أنواع المدن
export type CityKey = 'riyadh' | 'jeddah' | 'dammam' | 'makkah' | 'madinah';


// معلومات عن روابط الصفحات الرئيسية
export const mainPageLinks: Record<MainPageKey, LinkInfo> = {
  home: { href: '/', title: 'الرئيسية', description: 'الصفحة الرئيسية لشركة أومنيرا فاليه' },
  about: { href: '/about', title: 'من نحن', description: 'تعرف على شركة أومنيرا فاليه وخدماتها في مجال صف السيارات' },
  services: { href: '/services', title: 'خدماتنا', description: 'خدمات صف السيارات والفاليه باركينج من أومنيرا فاليه' },
  pricing: { href: '/pricing', title: 'الأسعار والباقات', description: 'باقات وأسعار خدمات الفاليه باركينج وإدارة المواقف' },
  locations: { href: '/locations', title: 'المدن والمناطق', description: 'خدماتنا متوفرة في جميع مدن المملكة' },
  contact: { href: '/contact', title: 'اتصل بنا', description: 'تواصل معنا للحصول على خدماتنا أو استفسارات' },
};

// روابط صفحات الخدمات
export const serviceLinks: Record<ServiceKey, LinkInfo> = {
  valetParking: { href: '/services/valet-parking', title: 'خدمة الفاليه باركينج', description: 'خدمة صف السيارات الاحترافية من أومنيرا فاليه' },
  parkingManagement: { href: '/services/parking-management', title: 'إدارة المواقف', description: 'حلول شاملة لإدارة مواقف السيارات والتحكم بها' },
  hotels: { href: '/services/hotels', title: 'خدمات الفنادق', description: 'خدمات فاليه باركينج للفنادق والمنتجعات' },
  restaurants: { href: '/services/restaurants', title: 'خدمات المطاعم', description: 'خدمات فاليه باركينج للمطاعم والمقاهي' },
  events: { href: '/services/events', title: 'الفعاليات والمناسبات', description: 'خدمات صف السيارات للمؤتمرات والحفلات والفعاليات' },
  technology: { href: '/services/advanced-technology', title: 'التقنيات المتقدمة', description: 'أحدث التقنيات في إدارة مواقف السيارات' },
};

// روابط المدن الرئيسية
export const cityLinks: Record<CityKey, LinkInfo> = {
  riyadh: { href: '/locations/riyadh', title: 'الرياض', description: 'خدمات صف السيارات في الرياض' },
  jeddah: { href: '/locations/jeddah', title: 'جدة', description: 'خدمات صف السيارات في جدة' },
  dammam: { href: '/locations/dammam', title: 'الدمام', description: 'خدمات صف السيارات في الدمام' },
  makkah: { href: '/locations/makkah', title: 'مكة المكرمة', description: 'خدمات صف السيارات في مكة المكرمة' },
  madinah: { href: '/locations/madinah', title: 'المدينة المنورة', description: 'خدمات صف السيارات في المدينة المنورة' },
};


/**
 * مكون InternalLink - يستخدم لإنشاء روابط داخلية متناسقة مع تحسين السيو
 * @param href مسار الرابط
 * @param title عنوان الرابط
 * @param className الأنماط الإضافية
 * @param activeClassName أنماط الحالة النشطة
 * @param isActive حالة تنشيط الرابط
 * @param children محتوى الرابط
 * @param onClick معالج حدث النقر
 * @param rel علاقة الرابط
 */
interface InternalLinkProps {
  href: string;
  title?: string;
  className?: string;
  activeClassName?: string;
  isActive?: boolean;
  children?: React.ReactNode;
  onClick?: () => void;
  rel?: string;
}

export const InternalLink: React.FC<InternalLinkProps> = ({
  href,
  title,
  className,
  activeClassName = '',
  isActive = false,
  children,
  onClick,
  rel = '',
}) => {
  return (
    <Link 
      href={href}
      title={title}
      className={cn(
        className,
        isActive && activeClassName
      )}
      onClick={onClick}
      rel={rel}
    >
      {children}
    </Link>
  );
};

/**
 * مكون RelatedLinks - يعرض روابط ذات صلة بالمحتوى الحالي
 * @param currentCategory فئة المحتوى الحالي
 * @param currentPath المسار الحالي
 * @param count عدد الروابط المطلوبة (الافتراضي: 3)
 */
interface RelatedLinksProps {
  currentCategory: ContentCategory;
  currentPath: string;
  count?: number;
  className?: string;
  title?: string;
}

export const RelatedLinks: React.FC<RelatedLinksProps> = ({
  currentCategory,
  currentPath,
  count = 3,
  className,
  title = 'روابط ذات صلة',
}) => {
  // اختيار الروابط المناسبة حسب الفئة
  const getRelatedLinks = () => {
    let allLinks: LinkInfo[] = [];
    
    switch (currentCategory) {
      case ContentCategory.SERVICES:
        allLinks = Object.values(serviceLinks);
        break;
      case ContentCategory.LOCATIONS:
        allLinks = Object.values(cityLinks);
        break;
      default:
        allLinks = Object.values(mainPageLinks);
    }
    
    // استبعاد الرابط الحالي
    const filteredLinks = allLinks.filter(link => link.href !== currentPath);
    
    // إرجاع العدد المطلوب
    return filteredLinks.slice(0, count);
  };
  
  const links = getRelatedLinks();
  
  if (links.length === 0) return null;
  
  return (
    <div className={className}>
      <h3 className="text-lg font-bold mb-3">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <InternalLink
              href={link.href}
              title={link.title}
              className="text-brown-dark hover:text-gold-primary"
            >
              {link.title}
            </InternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
};

/**
 * دالة لإنشاء مسارات التنقل (Breadcrumbs)
 * @param path المسار الحالي
 */
export const generateBreadcrumbs = (path: string) => {
  if (path === '/') {
    return [{ title: 'الرئيسية', href: '/' }];
  }
  
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs = [{ title: 'الرئيسية', href: '/' }];
  let currentPath = '';
  
  segments.forEach((segment) => {
    currentPath += `/${segment}`;
    
    // البحث عن عنوان مناسب للجزء الحالي
    let title = segment;
    
    // خدمات
    if (segment === 'services') {
      title = 'خدماتنا';
    } 
    // صفحة خدمة محددة
    else if (currentPath.includes('/services/')) {
      // تحويل مسار الخدمة إلى مفتاح للوصول إلى القائمة
      const serviceKey = Object.keys(serviceLinks).find(key => 
        serviceLinks[key as ServiceKey].href.endsWith(segment)
      );
      
      if (serviceKey) {
        title = serviceLinks[serviceKey as ServiceKey].title;
      }
    }
    // المدن
    else if (segment === 'locations') {
      title = 'المدن والمناطق';
    }
    // مدينة محددة
    else if (currentPath.includes('/locations/')) {
      // تحويل مسار المدينة إلى مفتاح للوصول إلى القائمة
      const cityKey = Object.keys(cityLinks).find(key => 
        cityLinks[key as CityKey].href.endsWith(segment)
      );
      
      if (cityKey) {
        title = cityLinks[cityKey as CityKey].title;
      }
    }
    // صفحات رئيسية أخرى
    else {
      // تحويل المسار إلى مفتاح للوصول إلى القائمة
      const pageKey = Object.keys(mainPageLinks).find(key => 
        mainPageLinks[key as MainPageKey].href === `/${segment}`
      );
      
      if (pageKey) {
        title = mainPageLinks[pageKey as MainPageKey].title;
      }
    }
    
    breadcrumbs.push({ title, href: currentPath });
  });
  
  return breadcrumbs;
};

/**
 * مكون الروابط ذات الصلة بالقائمة الجانبية
 * @param category فئة المحتوى الحالي
 * @param currentPath المسار الحالي
 */
export const SidebarLinks: React.FC<{ category: ContentCategory; currentPath: string }> = ({
  category,
  currentPath,
}) => {
  let links: {href: string, title: string}[] = [];
  let title = 'روابط مفيدة';
  
  switch (category) {
    case ContentCategory.SERVICES:
      links = Object.values(serviceLinks);
      title = 'خدماتنا';
      break;
    case ContentCategory.LOCATIONS:
      links = Object.values(cityLinks);
      title = 'مدننا';
      break;
    default:
      links = Object.values(mainPageLinks);
      title = 'صفحات الموقع';
  }
  
  return (
    <div className="bg-beige-light p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-4 text-brown-dark">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <InternalLink
              href={link.href}
              title={link.title}
              isActive={currentPath === link.href}
              className="py-2 block text-[#F5ECDB] hover:text-gold-primary transition-colors"
              activeClassName="text-gold-primary font-bold"
            >
              {link.title}
            </InternalLink>
          </li>
        ))}
      </ul>
    </div>
  );
};
