// SEO Configuration
export const siteConfig = {
  name: 'Omnira Valet',
  description: 'شركة سعودية رائدة في خدمات صف السيارات الاحترافية (Valet Parking) والإدارة الذكية للمواقف. نساهم في تحقيق رؤية المملكة 2030 من خلال حلول متطورة لقطاع الضيافة والسياحة في جميع مدن المملكة.',
  url: 'https://omniravalet.com',
  ogImage: 'https://omniravalet.com/og-image.jpg',
  links: {
    facebook: 'https://www.facebook.com/omniravalet/',
    twitter: 'https://x.com/elorepariss',
    tiktok: 'https://www.tiktok.com/@omniravalet',
    youtube: 'https://www.youtube.com/@Omniravalet',
  },
  creator: 'Omnira Valet',
  registrationNumber: '7051975600',
  address: {
    streetAddress: 'مركز الملك عبدالله المالي (KAFD)، المنطقة 4، مبنى 4.07، الدور 7',
    addressLocality: 'الرياض',
    postalCode: '13519',
    addressCountry: 'SA',
  },
  contact: {
    phone: '+966551962033',
    email: 'info@omniravalet.com',
    supportEmail: 'info@omniravalet.com',
  },
  openingHours: 'Mo-Su 00:00-24:00',
  priceRange: '$$',
  languages: ['ar'],
  defaultLanguage: 'ar',
};

export const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteConfig.url}/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: siteConfig.name,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
    },
  },
  inLanguage: 'ar-SA',
};

export const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${siteConfig.url}/#organization`,
  name: siteConfig.name,
  alternateName: 'Omnira Valet',
  description: siteConfig.description,
  url: siteConfig.url,
  logo: `${siteConfig.url}/logo.png`,
  image: siteConfig.ogImage,
  telephone: siteConfig.contact.phone,
  email: siteConfig.contact.email,
  priceRange: siteConfig.priceRange,
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    opens: '00:00',
    closes: '23:59',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.streetAddress,
    addressLocality: siteConfig.address.addressLocality,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.addressCountry,
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: '24.7649',
    longitude: '46.6390',
  },
  areaServed: [
    { '@type': 'City', name: 'الرياض' },
    { '@type': 'City', name: 'جدة' },
    { '@type': 'City', name: 'الدمام' },
    { '@type': 'City', name: 'مكة المكرمة' },
    { '@type': 'City', name: 'المدينة المنورة' },
    { '@type': 'Country', name: 'المملكة العربية السعودية' },
  ],
  sameAs: [
    siteConfig.links.facebook,
    siteConfig.links.twitter,
    siteConfig.links.tiktok,
    siteConfig.links.youtube,
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'خدمات صف السيارات',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'خدمات الفاليه باركينج',
          description: 'خدمة صف السيارات الاحترافية للفنادق والمطاعم والفعاليات',
        },
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'إدارة وتشغيل المواقف',
          description: 'حلول متكاملة لإدارة وتشغيل مواقف السيارات',
        },
      },
    ],
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '200',
    bestRating: '5',
    worstRating: '1',
  },
};

export const jsonLdBreadcrumb = (items: { name: string; item: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteConfig.url}${item.item}`,
  })),
});

export const generateServiceSchema = (service: {
  name: string;
  description: string;
  url: string;
  image?: string;
  priceRange?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: service.name,
  name: service.name,
  description: service.description,
  url: `${siteConfig.url}${service.url}`,
  image: service.image || siteConfig.ogImage,
  provider: {
    '@type': 'Organization',
    name: siteConfig.name,
    url: siteConfig.url,
  },
  areaServed: {
    '@type': 'Country',
    name: 'المملكة العربية السعودية',
  },
  availableChannel: {
    '@type': 'ServiceChannel',
    serviceUrl: `${siteConfig.url}/contact`,
    servicePhone: siteConfig.contact.phone,
  },
  priceRange: service.priceRange || siteConfig.priceRange,
  offers: {
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    priceSpecification: {
      '@type': 'PriceSpecification',
      priceCurrency: 'SAR',
    },
  },
});

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
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

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.title,
  description: article.description,
  url: `${siteConfig.url}${article.url}`,
  image: article.image || siteConfig.ogImage,
  datePublished: article.datePublished || new Date().toISOString(),
  dateModified: article.dateModified || new Date().toISOString(),
  author: {
    '@type': 'Organization',
    name: siteConfig.name,
  },
  publisher: {
    '@type': 'Organization',
    name: siteConfig.name,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo.png`,
    },
  },
  inLanguage: 'ar-SA',
});
