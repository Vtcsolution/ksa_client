/**
 * استراتيجيات التخزين المؤقت وتحسين الأداء
 * هذا الملف يحتوي على مجموعة من الوظائف والإعدادات لتحسين سرعة الموقع
 * من خلال استراتيجيات التخزين المؤقت المختلفة.
 */

import { NextResponse } from 'next/server';
import type { NextRequest, NextFetchEvent } from 'next/server';

// أنواع الصفحات التي يمكن تخزينها مؤقتاً
export enum CacheablePageType {
  STATIC = 'STATIC', // الصفحات الثابتة التي نادراً ما تتغير
  DYNAMIC = 'DYNAMIC', // الصفحات المتغيرة بشكل متوسط
  API = 'API', // طلبات API
}

// نوع رأس التخزين المؤقت
export type CacheControlHeaders = {
  'Cache-Control': string;
  'CDN-Cache-Control'?: string;
  'Vercel-CDN-Cache-Control'?: string;
  'Surrogate-Control'?: string;
  'stale-while-revalidate'?: string;
  'stale-if-error'?: string;
};

// إعدادات التخزين المؤقت للصفحات المختلفة
export const CACHE_TIMES = {
  STATIC: {
    BROWSER: 60 * 60, // ساعة واحدة بالثواني
    CDN: 60 * 60 * 24, // يوم واحد بالثواني
    ISR: 60 * 60 * 24, // يوم واحد بالثواني
  },
  DYNAMIC: {
    BROWSER: 60, // دقيقة واحدة بالثواني
    CDN: 60 * 5, // 5 دقائق بالثواني
    ISR: 60 * 30, // 30 دقيقة بالثواني
  },
  API: {
    BROWSER: 0, // لا تخزين مؤقت
    CDN: 60, // دقيقة واحدة بالثواني
    ISR: 60 * 10, // 10 دقائق بالثواني
  },
};

/**
 * إنشاء رؤوس التحكم في التخزين المؤقت
 * @param pageType نوع الصفحة
 * @param customBrowserCache مدة التخزين المؤقت في المتصفح (بالثواني)
 * @param customCdnCache مدة التخزين المؤقت في CDN (بالثواني)
 * @param isrRevalidate مدة إعادة التحقق من الصفحة (بالثواني)
 */
export function createCacheHeaders(
  pageType: CacheablePageType,
  customBrowserCache?: number,
  customCdnCache?: number,
  isrRevalidate?: number
): CacheControlHeaders {
  // استخدام الاسم المحدد كمفتاح للوصول الآمن للخصائص
  const pageTypeKey = pageType.toString() as keyof typeof CACHE_TIMES;
  const cacheSettings = CACHE_TIMES[pageTypeKey];
  const browserCache = customBrowserCache ?? cacheSettings.BROWSER;
  const cdnCache = customCdnCache ?? cacheSettings.CDN;
  const isrTime = isrRevalidate ?? cacheSettings.ISR;

  if (browserCache <= 0 && cdnCache <= 0) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
    };
  }

  const cacheHeader: CacheControlHeaders = {
    'Cache-Control': browserCache > 0 
      ? `public, max-age=${browserCache}, s-maxage=${cdnCache}, stale-while-revalidate=${isrTime}` 
      : `no-cache, no-store, must-revalidate, max-age=0, s-maxage=${cdnCache}, stale-while-revalidate=${isrTime}`,
    'CDN-Cache-Control': `public, max-age=${cdnCache}, stale-while-revalidate=${isrTime}`,
    'Vercel-CDN-Cache-Control': `public, max-age=${cdnCache}, stale-while-revalidate=${isrTime}`,
    'Surrogate-Control': `public, max-age=${cdnCache}, stale-while-revalidate=${isrTime}`,
  };

  return cacheHeader;
}

/**
 * إضافة رؤوس التخزين المؤقت للاستجابة
 * @param response الاستجابة
 * @param cacheHeaders رؤوس التخزين المؤقت
 */
export function appendCacheHeaders(
  response: NextResponse,
  cacheHeaders: CacheControlHeaders
): NextResponse {
  Object.entries(cacheHeaders).forEach(([key, value]) => {
    if (value) {
      response.headers.set(key, value);
    }
  });
  
  return response;
}

/**
 * دالة لتطبيق استراتيجية التخزين المؤقت على الاستجابة
 * @param response الاستجابة
 * @param pageType نوع الصفحة
 * @param customBrowserCache مدة التخزين المؤقت في المتصفح (بالثواني)
 * @param customCdnCache مدة التخزين المؤقت في CDN (بالثواني)
 * @param isrRevalidate مدة إعادة التحقق من الصفحة (بالثواني)
 */
export function applyCacheStrategy(
  response: NextResponse,
  pageType: CacheablePageType,
  customBrowserCache?: number,
  customCdnCache?: number,
  isrRevalidate?: number
): NextResponse {
  const cacheHeaders = createCacheHeaders(
    pageType,
    customBrowserCache,
    customCdnCache,
    isrRevalidate
  );
  
  return appendCacheHeaders(response, cacheHeaders);
}

/**
 * دالة لتحديد نوع الصفحة بناءً على المسار
 * @param pathname مسار الصفحة
 */
export function getPageTypeFromPath(pathname: string): CacheablePageType {
  // صفحات ثابتة
  const staticPaths = [
    '/',
    '/about',
    '/services',
    '/locations',
    '/pricing',
    '/contact',
    '/terms',
    '/privacy',
  ];
  
  // صفحات API
  if (pathname.startsWith('/api/')) {
    return CacheablePageType.API;
  }
  
  // صفحات ثابتة
  if (staticPaths.includes(pathname)) {
    return CacheablePageType.STATIC;
  }
  
  // أي صفحة أخرى تعتبر ديناميكية
  return CacheablePageType.DYNAMIC;
}

/**
 * دالة middleware لتطبيق استراتيجية التخزين المؤقت على الطلبات
 * @param request طلب الشبكة
 * @param event حدث الجلب
 */
export function cacheMiddleware(request: NextRequest, event: NextFetchEvent) {
  // تجاهل الطلبات غير GET
  if (request.method !== 'GET') {
    return NextResponse.next();
  }
  
  // تجاهل طلبات المستخدمين المسجلين
  if (request.cookies.has('auth')) {
    return NextResponse.next();
  }
  
  const url = new URL(request.url);
  const pageType = getPageTypeFromPath(url.pathname);
  
  // استخدام استراتيجية التخزين المؤقت المناسبة
  event.waitUntil((async () => {
    const response = NextResponse.next();
    
    return applyCacheStrategy(response, pageType);
  })());
  
  return NextResponse.next();
}

/**
 * ضبط رؤوس HTTP لتحسين الأداء وتسريع تحميل الصفحات
 * @param response الاستجابة
 */
export function applyPerformanceHeaders(response: NextResponse): NextResponse {
  // تفعيل ضغط الملفات
  response.headers.set('Content-Encoding', 'gzip, deflate, br');
  
  // تفعيل HTTP/2 Server Push
  response.headers.set('Link', '</styles/main.css>; rel=preload; as=style, </scripts/main.js>; rel=preload; as=script');
  
  // تحسين أمان الاتصال
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // منع تخمين نوع MIME
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  return response;
}

/**
 * استراتيجية تحميل الموارد تتعلق بأولويات تحميل الأصول
 * @param resources موارد الصفحة المراد تحميلها
 */
export function optimizeResourceLoading(resources: string[]): { preload: string[], prefetch: string[] } {
  const criticalResources = ['main.css', 'fonts', 'critical.js'];
  const preload: string[] = [];
  const prefetch: string[] = [];
  
  resources.forEach((resource) => {
    if (criticalResources.some(critical => resource.includes(critical))) {
      preload.push(resource);
    } else {
      prefetch.push(resource);
    }
  });
  
  return { preload, prefetch };
}

/**
 * إنشاء إعدادات Nginx للتخزين المؤقت
 * يمكن استخدام هذه الإعدادات في ملف nginx.conf
 */
export function generateNginxCacheConfig(): string {
  return `
# Cache Configuration for Omnira Website

# Cache Zone Definition
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=OMNIRA_CACHE:10m max_size=10g inactive=60m;

# Cache Settings
proxy_cache OMNIRA_CACHE;
proxy_cache_valid 200 302 10m;
proxy_cache_valid 404 1m;
proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;
proxy_cache_background_update on;
proxy_cache_lock on;

# Browser Caching
location ~* \\.(?:jpg|jpeg|gif|png|ico|svg|webp)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

location ~* \\.(?:css|js)$ {
    expires 7d;
    add_header Cache-Control "public, no-transform";
}

location ~* \\.(?:ttf|otf|eot|woff|woff2)$ {
    expires 30d;
    add_header Cache-Control "public, no-transform";
}

# API Endpoints - No Browser Caching
location /api/ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    expires 0;
}

# GZIP Compression
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
  `;
}

/**
 * إنشاء ملف Vercel.json لتكوين التخزين المؤقت
 */
export function generateVercelCacheConfig(): object {
  return {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          {
            "key": "Strict-Transport-Security",
            "value": "max-age=31536000; includeSubDomains; preload"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      },
      {
        "source": "/static/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/_next/static/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/images/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=604800, stale-while-revalidate=86400"
          }
        ]
      },
      {
        "source": "/api/(.*)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  };
}
