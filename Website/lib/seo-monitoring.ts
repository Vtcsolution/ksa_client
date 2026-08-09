/**
 * SEO Monitoring and Analytics Configuration
 */

export const seoMonitoring = {
  // Google Analytics 4
  googleAnalytics: {
    measurementId: 'G-XXXXXXXXXX', // Replace with your GA4 ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // Google Tag Manager
  googleTagManager: {
    gtmId: 'GTM-XXXXXXX', // Replace with your GTM ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // Facebook Pixel
  facebookPixel: {
    pixelId: 'XXXXXXXXXXXXXXX', // Replace with your Pixel ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // Snapchat Pixel
  snapchatPixel: {
    pixelId: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX', // Replace with your Snapchat Pixel ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // TikTok Pixel
  tiktokPixel: {
    pixelId: 'XXXXXXXXXXXXXXXXXXXX', // Replace with your TikTok Pixel ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // Microsoft Clarity
  microsoftClarity: {
    clarityId: 'XXXXXXXXXX', // Replace with your Clarity ID
    enabled: process.env.NODE_ENV === 'production',
  },

  // Hot Jar
  hotjar: {
    hjid: 'XXXXXXX', // Replace with your Hotjar ID
    hjsv: 6,
    enabled: process.env.NODE_ENV === 'production',
  },
};

// Core Web Vitals tracking
export const trackWebVitals = (metric: any) => {
  if (seoMonitoring.googleAnalytics.enabled) {
    // Send to Google Analytics
    window.gtag?.('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
};

// Page view tracking
export const trackPageView = (url: string, title: string) => {
  if (seoMonitoring.googleAnalytics.enabled) {
    const pageData: Record<string, any> = {
      page_path: url,
      page_title: title,
    };
    window.gtag?.('config', seoMonitoring.googleAnalytics.measurementId, pageData);
  }

  if (seoMonitoring.facebookPixel.enabled) {
    window.fbq?.('track', 'PageView');
  }
};

// Event tracking
export const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
  if (seoMonitoring.googleAnalytics.enabled) {
    // استخدام كائن فارغ إذا كانت البيانات غير معرفة
    const data: Record<string, any> = eventData || {};
    window.gtag?.('event', eventName, data);
  }

  if (seoMonitoring.facebookPixel.enabled) {
    const data: Record<string, any> = eventData || {};
    window.fbq?.('trackCustom', eventName, data);
  }
};

// Conversion tracking
export const trackConversion = (conversionType: 'contact' | 'booking' | 'quote', value?: number) => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    value: value,
    currency: 'SAR',
  });

  if (seoMonitoring.facebookPixel.enabled) {
    // إنشاء كائن بيانات معد مسبقًا
    const leadData: Record<string, any> = {
      content_name: conversionType,
      currency: 'SAR',
    };
    
    // إضافة القيمة فقط إذا كانت معرفة
    if (value !== undefined) {
      leadData.value = value;
    }
    
    window.fbq?.('track', 'Lead', leadData);
  }
};

// SEO Health Check
export const seoHealthCheck = () => {
  const checks = {
    hasTitle: !!document.title,
    hasMetaDescription: !!document.querySelector('meta[name="description"]'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasOGTags: !!document.querySelector('meta[property="og:title"]'),
    hasTwitterCard: !!document.querySelector('meta[name="twitter:card"]'),
    hasStructuredData: !!document.querySelector('script[type="application/ld+json"]'),
    hasH1: !!document.querySelector('h1'),
    hasAltTags: Array.from(document.querySelectorAll('img')).every((img) => img.hasAttribute('alt')),
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const score = (passed / total) * 100;

  console.log(`SEO Health Score: ${score.toFixed(0)}%`, checks);

  return { score, checks };
};

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: Record<string, any>) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
