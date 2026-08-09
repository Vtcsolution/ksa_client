'use client';

/**
 * مساعد لتحسين تحميل موارد الموقع وتحسين أدائه
 */

// تحميل الخطوط بشكل مسبق
export function preloadFonts() {
  if (typeof window === 'undefined') return;
  
  const fontFiles = [
    '/fonts/Cairo-Regular.ttf',
    '/fonts/Cairo-Medium.ttf',
    '/fonts/Cairo-SemiBold.ttf',
    '/fonts/Cairo-Bold.ttf',
    '/fonts/Arial-Regular.ttf',
    '/fonts/Arial-Bold.ttf',
  ];
  
  fontFiles.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/ttf';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
}

// تحميل الصور بشكل كسول
export function setupLazyLoading() {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  // إنشاء المراقب
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const image = entry.target as HTMLImageElement;
        
        // استبدال مصدر الصورة بالمصدر الفعلي
        if (image.dataset.src) {
          image.src = image.dataset.src;
          delete image.dataset.src;
        }
        
        // إزالة المراقبة بعد التحميل
        observer.unobserve(image);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });
  
  // مراقبة جميع الصور ذات الخاصية data-src
  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
}

// تسجيل Service Worker
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker تم تسجيل:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker خطأ في تسجيل:', error);
      });
  });
}

// تحميل تحليلات جوجل بشكل غير متزامن
export function loadGoogleAnalytics(measurementId: string) {
  if (typeof window === 'undefined') return;
  
  // إنشاء عناصر السكريبت
  const script1 = document.createElement('script');
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  
  const script2 = document.createElement('script');
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${measurementId}', { 'anonymize_ip': true });
  `;
  
  // إضافة السكريبتات للصفحة
  document.head.appendChild(script1);
  document.head.appendChild(script2);
}

// تحميل مسبق للصفحات الأكثر احتمالاً للزيارة
export function prefetchLikelyPages() {
  if (typeof window === 'undefined') return;
  
  // الصفحات الشائعة التي يحتمل زيارتها
  const likelyPages = [
    '/about',
    '/services',
    '/contact',
    '/services/valet-parking',
    '/services/parking-management',
  ];
  
  // إنشاء روابط التحميل المسبق
  likelyPages.forEach(page => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = page;
    document.head.appendChild(link);
  });
}

// الكشف عن نوع الاتصال وتكييف المحتوى
export function adaptContentToConnection() {
  if (typeof window === 'undefined' || !('connection' in navigator)) return;
  
  const connection = (navigator as any).connection;
  
  if (connection.saveData) {
    // وضع توفير البيانات مفعل، تحميل الصور بدقة منخفضة
    document.body.classList.add('save-data');
  }
  
  if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
    // اتصال بطيء، تقليل جودة الصور وتعطيل الرسوم المتحركة
    document.body.classList.add('slow-connection');
  }
}

// تحسين تجربة التفاعل
export function enhanceUserExperience() {
  if (typeof window === 'undefined') return;
  
  // بطاقة الأداء الأساسية
  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        // إرسال قياسات الأداء الأساسية إلى تحليلات جوجل
        const gtag = (window as any).gtag as undefined | ((...args: any[]) => void);
        if (typeof gtag === 'function' && (entry.name === 'CLS' || entry.name === 'FID' || entry.name === 'LCP')) {
          gtag('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: entry.name,
            value: Math.round(entry.name === 'CLS' ? entry.value * 1000 : entry.value),
            non_interaction: true,
          });
        }
      });
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) {
    console.error('PerformanceObserver غير مدعوم', e);
  }
}

// تهيئة جميع التحسينات
export function initializeOptimizations(options = {
  analytics: true,
  serviceWorker: true,
  lazyLoading: true,
  prefetching: true,
  adaptiveLoading: true,
  measurementId: 'G-XXXXXXXXXX'
}) {
  if (typeof window !== 'undefined') {
    preloadFonts();
    
    if (options.serviceWorker) registerServiceWorker();
    if (options.lazyLoading) setupLazyLoading();
    if (options.prefetching) prefetchLikelyPages();
    if (options.adaptiveLoading) adaptContentToConnection();
    if (options.analytics && options.measurementId) loadGoogleAnalytics(options.measurementId);
    
    enhanceUserExperience();
  }
}

// تعريف الكائن قبل التصدير لتجنب تحذير ESLint
const resourceLoader = {
  preloadFonts,
  setupLazyLoading,
  registerServiceWorker,
  loadGoogleAnalytics,
  prefetchLikelyPages,
  adaptContentToConnection,
  enhanceUserExperience,
  initializeOptimizations
};

export default resourceLoader;
