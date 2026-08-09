/**
 * Open Graph Images Configuration
 * صور مخصصة لكل صفحة تظهر في محركات البحث ومواقع التواصل
 * صور مبرندة محلياً (Omnira Valet) — 1200x630
 */

const OG_BASE = 'https://omniravalet.com/images/og';

export const ogImages = {
  // الصفحة الرئيسية
  home: {
    url: `${OG_BASE}/home.jpg`,
    alt: 'خدمات صف السيارات الاحترافية - أومنيرا فاليه',
    title: 'Omnira Valet | خدمات صف السيارات',
  },

  // صفحة من نحن
  about: {
    url: `${OG_BASE}/about.jpg`,
    alt: 'فريق أومنيرا فاليه المحترف - قصة نجاح سعودية',
    title: 'من نحن - أومنيرا فاليه',
  },

  // صفحة الخدمات
  services: {
    url: `${OG_BASE}/services.jpg`,
    alt: 'خدماتنا المتميزة في صف وإدارة السيارات',
    title: 'خدمات أومنيرا فاليه الشاملة',
  },

  // صفحة الأسعار
  pricing: {
    url: `${OG_BASE}/pricing.jpg`,
    alt: 'باقات أومنيرا فاليه المرنة - أسعار تنافسية',
    title: 'الأسعار والباقات',
  },

  // صفحة التواصل
  contact: {
    url: `${OG_BASE}/contact.jpg`,
    alt: 'تواصل معنا - نحن هنا لخدمتك',
    title: 'اتصل بنا',
  },

  // صفحة المواقع
  locations: {
    url: `${OG_BASE}/locations.jpg`,
    alt: 'مدن المملكة - نخدم جميع أنحاء السعودية',
    title: 'المدن التي نخدمها',
  },

  // صفحات الخدمات الفردية
  valetParking: {
    url: `${OG_BASE}/valetParking.jpg`,
    alt: 'خدمات الفاليه باركينج الاحترافية',
    title: 'الفاليه باركينج',
  },

  parkingManagement: {
    url: `${OG_BASE}/parkingManagement.jpg`,
    alt: 'إدارة وتشغيل المواقف بتقنيات ذكية',
    title: 'إدارة المواقف',
  },

  advancedTechnology: {
    url: `${OG_BASE}/advancedTechnology.jpg`,
    alt: 'التقنيات المتقدمة لإدارة المواقف',
    title: 'التقنيات المتقدمة',
  },

  professionalOrganizers: {
    url: `${OG_BASE}/professionalOrganizers.jpg`,
    alt: 'منظمين محترفين مدربين',
    title: 'المنظمين المحترفين',
  },

  consultation: {
    url: `${OG_BASE}/consultation.jpg`,
    alt: 'استشارات متخصصة في إدارة المواقف',
    title: 'الاستشارات',
  },

  golfCart: {
    url: `${OG_BASE}/golfCart.jpg`,
    alt: 'خدمة الجولف كارت للتنقل الداخلي',
    title: 'جولف كارت',
  },

  supportServices: {
    url: `${OG_BASE}/supportServices.jpg`,
    alt: 'خدمات مساندة متكاملة',
    title: 'الخدمات المساندة',
  },

  carWash: {
    url: `${OG_BASE}/carWash.jpg`,
    alt: 'خدمة غسيل السيارات الاحترافية',
    title: 'غسيل السيارات',
  },

  hotels: {
    url: `${OG_BASE}/hotels.jpg`,
    alt: 'حلول صف السيارات للفنادق الفاخرة',
    title: 'خدمات الفنادق',
  },

  restaurants: {
    url: `${OG_BASE}/restaurants.jpg`,
    alt: 'خدمات صف السيارات للمطاعم',
    title: 'خدمات المطاعم',
  },

  malls: {
    url: `${OG_BASE}/malls.jpg`,
    alt: 'إدارة مواقف المراكز التجارية',
    title: 'المراكز التجارية',
  },

  events: {
    url: `${OG_BASE}/events.jpg`,
    alt: 'خدمات صف السيارات للفعاليات',
    title: 'الفعاليات',
  },

  hospitals: {
    url: `${OG_BASE}/hospitals.jpg`,
    alt: 'خدمات مواقف المستشفيات',
    title: 'المستشفيات',
  },

  corporate: {
    url: `${OG_BASE}/corporate.jpg`,
    alt: 'حلول مواقف الشركات',
    title: 'الشركات',
  },

  vip: {
    url: `${OG_BASE}/vip.jpg`,
    alt: 'خدمة VIP الفاخرة',
    title: 'VIP',
  },
};

// Helper function to get OG image for a page
export function getOGImage(pageKey: keyof typeof ogImages) {
  const image = ogImages[pageKey];
  return {
    url: image.url,
    width: 1200,
    height: 630,
    alt: image.alt,
    type: 'image/jpeg',
  };
}

// Generate full Open Graph metadata
export function generateOGMetadata(pageKey: keyof typeof ogImages, customTitle?: string) {
  const image = ogImages[pageKey];

  return {
    title: customTitle || image.title,
    images: [
      {
        url: image.url,
        width: 1200,
        height: 630,
        alt: image.alt,
        type: 'image/jpeg',
      },
    ],
  };
}
