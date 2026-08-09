/**
 * بيانات هيكلية متقدمة لتحسين السيو
 * تتوافق مع معايير Schema.org لتحسين ظهور الموقع في محركات البحث
 */

import { siteConfig } from './seo-config';

// مخطط متعدد اللغات للموقع
export const multilanguageSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  alternateName: 'Omnira Valet',
  description: siteConfig.description,
  url: siteConfig.url,
  inLanguage: ['ar-SA'],
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// مخطط للخريطة التفاعلية وبيانات الموقع الجغرافي
export const geoLocationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Place',
  name: 'مقر شركة أومنيرا فاليه',
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    postalCode: siteConfig.address.postalCode,
    addressCountry: 'Saudi Arabia',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '24.7649',
    longitude: '46.6390',
  },
  hasMap: 'https://www.google.com/maps/search/?api=1&query=King+Abdullah+Financial+District+Riyadh',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
};

// مخطط للتقييمات والمراجعات
export const generateReviewSchema = (data: {
  name: string;
  itemReviewed: string;
  author: string;
  reviewBody: string;
  ratingValue: number;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  name: data.name,
  itemReviewed: {
    '@type': 'Organization',
    name: data.itemReviewed,
  },
  author: {
    '@type': 'Person',
    name: data.author,
  },
  reviewBody: data.reviewBody,
  reviewRating: {
    '@type': 'Rating',
    ratingValue: data.ratingValue,
    bestRating: '5',
    worstRating: '1',
  },
});

// مخطط للأسئلة الشائعة المعزز
export const enhancedFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

// مخطط للأحداث والفعاليات
export const generateEventSchema = (event: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  image?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: event.name,
  description: event.description,
  startDate: event.startDate,
  endDate: event.endDate,
  location: {
    '@type': 'Place',
    name: event.location,
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'Saudi Arabia',
    },
  },
  image: event.image || siteConfig.ogImage,
  organizer: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
  },
});

// مخطط للتخطيط التنقل للموقع
export const siteNavigationSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'SiteNavigationElement',
      position: 1,
      name: 'الرئيسية',
      description: 'الصفحة الرئيسية لموقع أومنيرا فاليه',
      url: `${siteConfig.url}/`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 2,
      name: 'من نحن',
      description: 'تعرف على شركة أومنيرا فاليه',
      url: `${siteConfig.url}/about`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 3,
      name: 'خدماتنا',
      description: 'خدمات صف السيارات وإدارة المواقف',
      url: `${siteConfig.url}/services`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 4,
      name: 'الأسعار',
      description: 'باقات وأسعار خدمات أومنيرا فاليه',
      url: `${siteConfig.url}/pricing`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 5,
      name: 'المواقع',
      description: 'المدن التي تخدمها أومنيرا فاليه',
      url: `${siteConfig.url}/locations`,
    },
    {
      '@type': 'SiteNavigationElement',
      position: 6,
      name: 'اتصل بنا',
      description: 'تواصل مع فريق أومنيرا فاليه',
      url: `${siteConfig.url}/contact`,
    },
  ],
};

// مخطط للعرض التجاري
export const generateOfferSchema = (offer: {
  name: string;
  price: number;
  priceCurrency: string;
  description: string;
  availability: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Offer',
  name: offer.name,
  price: offer.price,
  priceCurrency: offer.priceCurrency,
  description: offer.description,
  availability: offer.availability,
  url: `${siteConfig.url}${offer.url}`,
  seller: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
  },
});

// تعريف كائن للتصدير الافتراضي
const advancedSchemas = {
  multilanguageSiteSchema,
  geoLocationSchema,
  generateReviewSchema,
  enhancedFAQSchema,
  generateEventSchema,
  siteNavigationSchema,
  generateOfferSchema,
};

export default advancedSchemas;
