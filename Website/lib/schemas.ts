// Local Business Schema للسعودية
export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://omniravalet.com/#business',
  name: 'Omnira Valet',
  alternateName: 'Omnira Valet',
  description: 'شركة أومنيرا فاليه الرائدة في تقديم خدمات الفاليه باركينج وإدارة مواقف السيارات في المملكة العربية السعودية. نوفر حلولاً احترافية للفنادق، المطاعم، الفعاليات، والمنشآت التجارية.',
  
  url: 'https://omniravalet.com',
  logo: 'https://omniravalet.com/logo.png',
  image: [
    'https://omniravalet.com/images/omnira-hero.jpg',
    'https://omniravalet.com/images/valet-service.jpg',
    'https://omniravalet.com/images/professional-team.jpg'
  ],

  // معلومات التواصل
  telephone: '+966551962033',
  email: 'info@omniravalet.com',
  
  // العنوان الرئيسي في السعودية
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'مركز الملك عبدالله المالي (KAFD)، المنطقة 4، مبنى 4.07، الدور 7',
    addressLocality: 'الرياض',
    addressRegion: 'الرياض',
    postalCode: '13519',
    addressCountry: 'SA'
  },

  // منطقة الخدمة
  areaServed: [
    {
      '@type': 'City',
      name: 'الرياض',
      '@id': 'https://www.wikidata.org/wiki/Q3692'
    },
    {
      '@type': 'City',
      name: 'جدة',
      '@id': 'https://www.wikidata.org/wiki/Q374365'
    },
    {
      '@type': 'City',
      name: 'الدمام',
      '@id': 'https://www.wikidata.org/wiki/Q184452'
    },
    {
      '@type': 'City',
      name: 'مكة المكرمة',
      '@id': 'https://www.wikidata.org/wiki/Q5806'
    },
    {
      '@type': 'City',
      name: 'المدينة المنورة',
      '@id': 'https://www.wikidata.org/wiki/Q35484'
    },
    {
      '@type': 'Country',
      name: 'المملكة العربية السعودية',
      '@id': 'https://www.wikidata.org/wiki/Q851'
    }
  ],

  // الإحداثيات الجغرافية (الرياض)
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 24.7649,
    longitude: 46.6390
  },

  // ساعات العمل
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ],
      opens: '00:00',
      closes: '23:59'
    }
  ],

  // الخدمات المقدمة
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'خدمات أومنيرا فاليه',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'خدمات الفاليه باركينج',
          description: 'خدمة فاليه باركينج احترافية للفنادق والمطاعم والفعاليات',
          provider: {
            '@id': 'https://omniravalet.com/#business'
          }
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'إدارة مواقف السيارات',
          description: 'حلول شاملة لإدارة المواقف للمراكز التجارية والمنشآت الكبرى',
          provider: {
            '@id': 'https://omniravalet.com/#business'
          }
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'صف السيارات للفعاليات',
          description: 'خدمات متخصصة للمؤتمرات والحفلات والفعاليات الكبرى',
          provider: {
            '@id': 'https://omniravalet.com/#business'
          }
        }
      }
    ]
  },

  // التقييمات
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '250',
    bestRating: '5',
    worstRating: '1'
  },

  // معلومات إضافية
  priceRange: '$$-$$$',
  paymentAccepted: 'Cash, Credit Card, Invoice',
  currenciesAccepted: 'SAR',
  
  // روابط التواصل الاجتماعي
  sameAs: [
    'https://www.facebook.com/omniravalet/',
    'https://x.com/elorepariss',
    'https://www.tiktok.com/@omniravalet',
    'https://www.youtube.com/@Omniravalet'
  ],

  // معلومات الشركة
  foundingDate: '2020',
  legalName: 'Omnira Valet',
  taxID: '7051975600',
  
  // الكلمات المفتاحية
  keywords: 'فاليه باركينج, valet parking, صف سيارات, إدارة مواقف, خدمات الفنادق, فاليه الرياض, valet Saudi Arabia'
};

// Organization Schema
export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://omniravalet.com/#organization',
  name: 'Omnira Valet',
  alternateName: 'Omnira Valet',
  url: 'https://omniravalet.com',
  logo: 'https://omniravalet.com/logo.png',
  
  contactPoint: [
    {
      '@type': 'ContactPoint',
      telephone: '+966551962033',
      contactType: 'Customer Service',
      areaServed: 'SA',
      availableLanguage: ['Arabic', 'English']
    },
    {
      '@type': 'ContactPoint',
      telephone: '+966551962033',
      contactType: 'Sales',
      areaServed: 'SA',
      availableLanguage: ['Arabic', 'English']
    }
  ],

  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Riyadh',
    addressRegion: 'Riyadh',
    addressCountry: 'SA'
  },

  sameAs: [
    'https://www.facebook.com/omniravalet/',
    'https://x.com/elorepariss',
    'https://www.tiktok.com/@omniravalet',
    'https://www.youtube.com/@Omniravalet'
  ]
};

// Service Schema
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  serviceType: 'Valet Parking Service',
  provider: {
    '@id': 'https://omniravalet.com/#business'
  },
  areaServed: {
    '@type': 'Country',
    name: 'Saudi Arabia'
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'خدمات الفاليه باركينج',
    itemListElement: [
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'فاليه باركينج للفنادق',
          description: 'خدمة 24/7 للفنادق الفاخرة'
        }
      },
      {
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: 'فاليه باركينج للمطاعم',
          description: 'خدمة احترافية للمطاعم الراقية'
        }
      }
    ]
  }
};

// BreadcrumbList Schema Generator
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };
}

// مخطط الأسئلة الشائعة
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

// مخطط لصفحة المقال
export function generateArticleSchema(article: {
  headline: string;
  description: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  publisher?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    image: article.image,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Organization',
      name: article.author || 'Omnira Valet'
    },
    publisher: {
      '@type': 'Organization',
      name: article.publisher || 'Omnira Valet',
      logo: {
        '@type': 'ImageObject',
        url: 'https://omniravalet.com/logo.png'
      }
    }
  };
}

// مخطط المراجعات
export function generateReviewSchema(review: {
  name: string;
  reviewBody: string;
  ratingValue: number;
  author: string;
  datePublished?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Review',
    reviewBody: review.reviewBody,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.ratingValue,
      bestRating: '5',
      worstRating: '1'
    },
    name: review.name,
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.datePublished || new Date().toISOString().split('T')[0]
  };
}

// مخطط المنتج
export function generateProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price?: string;
  priceCurrency?: string;
  availability?: string;
  category?: string;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Omnira Valet'
    },
    category: product.category,
    offers: product.price ? {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.priceCurrency || 'SAR',
      availability: product.availability || 'https://schema.org/InStock',
      url: 'https://omniravalet.com/services',
      seller: {
        '@type': 'Organization',
        name: 'Omnira Valet'
      }
    } : undefined
  };
}
