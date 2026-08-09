'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';

/**
 * تحسين أداء التصفح من خلال تحميل مسبق للصفحات الهامة
 * وإضافة الارتباطات والتعليمات الهامة لمحركات البحث
 */
const PrefetchLinks = () => {
  const router = useRouter();

  useEffect(() => {
    // تحميل مسبق للصفحات الرئيسية بعد تحميل الصفحة الحالية
    const prefetchTimer = setTimeout(() => {
      // الصفحات الأكثر زيارة
      router.prefetch('/about');
      router.prefetch('/services');
      router.prefetch('/contact');
      router.prefetch('/pricing');
      router.prefetch('/locations');
      
      // صفحات الخدمات الأكثر طلباً
      router.prefetch('/services/valet-parking');
      router.prefetch('/services/hotels');
      router.prefetch('/services/restaurants');
      router.prefetch('/services/events');
    }, 1500); // انتظار 1.5 ثانية فقط بعد تحميل الصفحة

    return () => clearTimeout(prefetchTimer);
  }, [router]);

  return (
    <>
      {/* روابط DNS للخدمات الخارجية لتسريع التحميل */}
      <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
      <link rel="dns-prefetch" href="https://images.unsplash.com" />
      <link rel="dns-prefetch" href="https://player.vimeo.com" />
      
      {/* تعليمات لمحركات البحث */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link rel="alternate" hrefLang="ar" href="https://omniravalet.com" />
      <link rel="canonical" href="https://omniravalet.com" />
    </>
  );
};

export default PrefetchLinks;
