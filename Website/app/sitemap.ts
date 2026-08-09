import { MetadataRoute } from 'next';
import { staticArticles } from '@/lib/static-content';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://omniravalet.com';
  const currentDate = new Date();
  const lastMonth = new Date(currentDate);
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  // تاريخ التحديث للصفحات الرئيسية
  const homeLastMod = currentDate;
  const servicesLastMod = currentDate;
  const aboutLastMod = new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 15);

  // الصفحات الرئيسية
  const mainPages = [
    {
      url: baseUrl,
      lastModified: homeLastMod,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: aboutLastMod,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: servicesLastMod,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: lastMonth,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: lastMonth,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/sitemap`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: lastMonth,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: lastMonth,
      changeFrequency: 'yearly' as const,
      priority: 0.5,
    },
  ];

  // صفحات الخدمات
  const services = [
    { slug: 'parking-management', lastMod: currentDate },
    { slug: 'valet-parking', lastMod: currentDate },
    { slug: 'advanced-technology', lastMod: currentDate },
    { slug: 'professional-organizers', lastMod: lastMonth },
    { slug: 'consultation', lastMod: lastMonth },
    { slug: 'golf-cart', lastMod: lastMonth },
    { slug: 'support-services', lastMod: lastMonth },
    { slug: 'car-wash', lastMod: lastMonth },
  ];

  const servicePages = services.map((service) => ({
    url: `${baseUrl}/services/${service.slug}`,
    lastModified: service.lastMod,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  // صفحات المدن
  const locations = [
    { slug: 'riyadh', lastMod: currentDate },
    { slug: 'jeddah', lastMod: currentDate },
    { slug: 'dammam', lastMod: lastMonth },
    { slug: 'makkah', lastMod: lastMonth },
    { slug: 'madinah', lastMod: lastMonth },
  ];

  const locationPages = locations.map((location) => ({
    url: `${baseUrl}/locations/${location.slug}`,
    lastModified: location.lastMod,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // صفحات قطاعات العملاء
  const sectors = [
    { slug: 'hotels', lastMod: currentDate },
    { slug: 'restaurants', lastMod: currentDate },
    { slug: 'malls', lastMod: lastMonth },
    { slug: 'events', lastMod: currentDate },
    { slug: 'hospitals', lastMod: lastMonth },
    { slug: 'corporate', lastMod: lastMonth },
    { slug: 'vip', lastMod: currentDate },
  ];
  
  const sectorPages = sectors.map((sector) => ({
    url: `${baseUrl}/services/${sector.slug}`,
    lastModified: sector.lastMod,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  
  
  const blogPages = [
    { url: `${baseUrl}/portfolio`, lastModified: currentDate, changeFrequency: 'monthly' as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: currentDate, changeFrequency: 'weekly' as const, priority: 0.7 },
    ...staticArticles.map((a) => ({
      url: `${baseUrl}/blog/${a.slug}`,
      lastModified: new Date(a.publishDate),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  return [
    ...mainPages,
    ...servicePages,
    ...locationPages,
    ...sectorPages,
    ...blogPages,
  ];
}
