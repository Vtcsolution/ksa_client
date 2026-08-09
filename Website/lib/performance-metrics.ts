'use client';

/**
 * حل لقياس وتحسين أداء الصفحات من خلال Core Web Vitals
 * مهم لتحسين السيو وترتيب الموقع في جوجل
 */

export function reportWebVitals(metric: {
  id: string;
  name: string;
  startTime: number;
  value: number;
  label: 'web-vital' | 'custom';
}) {
  // تجميع القياسات لإرسالها إلى Google Analytics أو أي نظام تحليلات آخر
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', metric.name, {
      event_category: 'web-vital',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // سجل قياسات الأداء في وحدة التحكم أثناء التطوير
  if (process.env.NODE_ENV === 'development') {
    console.log(`📊 ${metric.name}: ${metric.value}`);
  }
}

// تحسين تحميل الصور عبر استراتيجية تحميل كسول
export function optimizedImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // استخدام CDN لتحسين الصور
  if (src.startsWith('https://images.unsplash.com')) {
    return `${src}&w=${width}&q=${quality || 75}&auto=format`;
  }
  
  // تحسين الصور الداخلية
  if (src.startsWith('/')) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  return src;
}

// تتبع تفاعلات المستخدمين لتحسين السيو
export function trackUserInteraction(element: string, action: string) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', 'user_interaction', {
      element,
      action,
      page_path: window.location.pathname,
    });
  }
}

// تحسين تحميل الخطوط
export function optimizeFontLoading() {
  if (typeof window === 'undefined') return;
  
  // تحميل الخطوط بشكل استباقي
  const fontLinks = [
    { href: '/fonts/Cairo-Regular.ttf', type: 'font/ttf', crossOrigin: 'anonymous' },
    { href: '/fonts/Cairo-Bold.ttf', type: 'font/ttf', crossOrigin: 'anonymous' },
  ];
  
  fontLinks.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.href = font.href;
    link.type = font.type;
    link.crossOrigin = font.crossOrigin;
    document.head.appendChild(link);
  });
}

// إضافة البيانات المنظمة للصفحة
export function addStructuredData(data: Record<string, any>) {
  if (typeof window === 'undefined') return;
  
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}

// واجهة لنافذة المتصفح مع إضافة gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params: Record<string, any>
    ) => void;
  }
}

// تعريفات للأنواع الخاصة بمقياس الأداء
interface PerformanceEntryLCP extends PerformanceEntry {
  renderTime: number;
  loadTime: number;
}

interface PerformanceEntryFID extends PerformanceEntry {
  processingStart: number;
}

interface PerformanceEntryCLS extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

/**
 * مراقبة مقاييس الأداء الرئيسية (Core Web Vitals)
 * هذه الوظيفة تراقب وتسجل مقاييس الأداء الرئيسية للصفحة
 */
export function monitorCoreWebVitals() {
  if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;
  
  try {
    // مراقبة LCP - Largest Contentful Paint (أكبر عرض للمحتوى)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1] as any; // استخدام any للتعامل مع الخصائص غير المعرفة
        reportWebVitals({
          id: 'LCP',
          name: 'LCP',
          startTime: lastEntry.startTime,
          value: lastEntry.renderTime || lastEntry.loadTime,
          label: 'web-vital'
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // مراقبة FID - First Input Delay (زمن تأخير أول إدخال)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as any; // استخدام any للتعامل مع الخصائص غير المعرفة
        reportWebVitals({
          id: 'FID',
          name: 'FID',
          startTime: fidEntry.startTime,
          value: fidEntry.processingStart - fidEntry.startTime,
          label: 'web-vital'
        });
      });
    }).observe({ type: 'first-input', buffered: true });

    // مراقبة CLS - Cumulative Layout Shift (التغير التراكمي للتخطيط)
    new PerformanceObserver((entryList) => {
      let cumulativeScore = 0;
      
      for (const entry of entryList.getEntries()) {
        // تحويل نوع المدخل للتعامل مع الخصائص غير المعرفة
        const layoutShiftEntry = entry as unknown as {
          hadRecentInput: boolean;
          value: number;
        };
        
        if (!layoutShiftEntry.hadRecentInput) {
          cumulativeScore += layoutShiftEntry.value;
        }
      }
      
      reportWebVitals({
        id: 'CLS',
        name: 'CLS',
        startTime: 0,
        value: cumulativeScore,
        label: 'web-vital'
      });
    }).observe({ type: 'layout-shift', buffered: true });
    
  } catch (error) {
    console.error('PerformanceObserver غير مدعوم:', error);
  }
}

/**
 * تحسين تحميل الروابط بشكل مسبق
 * @param routes المسارات التي يجب تحميلها مسبقًا
 */
export function prefetchRoutes(routes: string[]) {
  if (typeof window === 'undefined' || !('requestIdleCallback' in window)) return;
  
  // استخدام requestIdleCallback لتجنب إعاقة العرض الرئيسي
  if (window.requestIdleCallback) {
    window.requestIdleCallback(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    });
  } else {
    // بديل للمتصفحات التي لا تدعم requestIdleCallback
    setTimeout(() => {
      routes.forEach(route => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        link.as = 'document';
        document.head.appendChild(link);
      });
    }, 1000);
  }
}

/**
 * التحميل المتأخر للسكربتات غير الضرورية
 * @param src مصدر السكربت
 * @param id معرف السكربت
 */
export function lazyLoadScript(src: string, id?: string) {
  if (typeof window === 'undefined') return;
  
  // التحقق من عدم وجود السكربت بالفعل
  if (id && document.getElementById(id)) return;
  
  // إنشاء عنصر سكربت جديد
  const script = document.createElement('script');
  script.src = src;
  script.defer = true;
  if (id) script.id = id;
  
  // مراقبة متى وصل المستخدم إلى نهاية الصفحة
  const callback = () => {
    document.body.appendChild(script);
    // إزالة المستمعين بعد التحميل
    window.removeEventListener('scroll', scrollHandler);
  };
  
  // تحميل السكربت عند التمرير لمسافة معينة
  const scrollHandler = () => {
    if (window.scrollY > window.innerHeight * 0.5) {
      callback();
    }
  };
  
  window.addEventListener('scroll', scrollHandler, { passive: true });
  
  // تحميل السكربت بعد تحميل الصفحة بالكامل
  if (window.requestIdleCallback) {
    window.requestIdleCallback(callback, { timeout: 3000 });
  } else {
    setTimeout(callback, 3000);
  }
}

/**
 * قياس توقيت الفعل الأول للمستخدم (Time To First Interaction)
 */
export function measureTTFI() {
  if (typeof window === 'undefined') return;
  
  let hasInteracted = false;
  const startTime = performance.now();
  
  const markInteraction = () => {
    if (!hasInteracted) {
      hasInteracted = true;
      const ttfi = performance.now() - startTime;
      
      // تسجيل الوقت
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'TTFI', {
          event_category: 'Performance',
          value: Math.round(ttfi),
          non_interaction: true,
        });
      }
      
      // إزالة مستمعي الحدث بعد التفاعل الأول
      ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
        document.removeEventListener(eventType, markInteraction);
      });
    }
  };
  
  // إضافة مستمعي الأحداث لقياس التفاعل الأول
  ['click', 'keydown', 'scroll', 'touchstart'].forEach(eventType => {
    document.addEventListener(eventType, markInteraction, { passive: true, once: false });
  });
  
  // إذا لم يتفاعل المستخدم خلال 10 ثواني
  setTimeout(() => {
    if (!hasInteracted) {
      // تسجيل عدم تفاعل المستخدم
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'no_interaction', {
          event_category: 'Performance',
          non_interaction: true,
        });
      }
    }
  }, 10000);
}

// تصدير الوظائف الرئيسية
const performanceMetrics = {
  reportWebVitals,
  optimizedImageLoader,
  trackUserInteraction,
  optimizeFontLoading,
  addStructuredData,
  monitorCoreWebVitals,
  prefetchRoutes,
  lazyLoadScript,
  measureTTFI
};

export default performanceMetrics;
