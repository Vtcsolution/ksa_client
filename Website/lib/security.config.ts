/**
 * إعدادات الأمان للتطبيق
 * يحتوي هذا الملف على التكوينات اللازمة لتعزيز أمان الموقع وحماية البيانات
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * إعدادات HTTPS وشهادة SSL
 */
export const sslConfig = {
  enforceHttps: true,
  minTlsVersion: 'TLSv1.2',
  hstsMaxAge: 31536000, // سنة واحدة بالثواني
  includeSubDomains: true,
  preload: true,
};

/**
 * إعدادات سياسة أمان المحتوى (CSP)
 */
export const contentSecurityPolicy = {
  // المصادر الافتراضية
  defaultSrc: ["'self'"],
  
  // مصادر البرمجة
  scriptSrc: [
    "'self'",
    "'unsafe-inline'", // مطلوب لبعض المكتبات
    "'unsafe-eval'", // مطلوب لبعض المكتبات
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://cdn.jsdelivr.net',
  ],
  
  // مصادر التنسيق
  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],
  
  // مصادر الصور
  imgSrc: [
    "'self'",
    'data:',
    'https://www.google-analytics.com',
    'https://i.vimeocdn.com',
    'https://images.unsplash.com',
    'https://cdn.pixabay.com',
  ],
  
  // مصادر الخطوط
  fontSrc: [
    "'self'",
    'https://fonts.gstatic.com',
  ],
  
  // مصادر الاتصال
  connectSrc: [
    "'self'",
    'https://www.google-analytics.com',
  ],
  
  // مصادر الوسائط
  mediaSrc: [
    "'self'",
    'https://player.vimeo.com',
  ],
  
  // مصادر الإطارات
  frameSrc: [
    "'self'",
    'https://player.vimeo.com',
  ],
  
  // منع الإطارات من تضمين المحتوى
  frameAncestors: ["'none'"],
  
  // مصادر الكائنات
  objectSrc: ["'none'"],
  
  // مصادر التنزيل
  manifestSrc: ["'self'"],
  
  // سياسة الإبلاغ عن الانتهاكات
  reportUri: '/api/csp-report',
  
  // قيود إضافية
  blockAllMixedContent: true,
  upgradeInsecureRequests: true,
};

/**
 * تحويل إعدادات CSP إلى نص
 */
export function generateCSPString(): string {
  return Object.entries(contentSecurityPolicy)
    .filter(([key, value]) => key !== 'reportUri' && key !== 'blockAllMixedContent' && key !== 'upgradeInsecureRequests')
    .map(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey} ${value.join(' ')}`;
      }
      return '';
    })
    .filter(Boolean)
    .concat(contentSecurityPolicy.blockAllMixedContent ? ['block-all-mixed-content'] : [])
    .concat(contentSecurityPolicy.upgradeInsecureRequests ? ['upgrade-insecure-requests'] : [])
    .concat(contentSecurityPolicy.reportUri ? [`report-uri ${contentSecurityPolicy.reportUri}`] : [])
    .join('; ');
}

/**
 * إعدادات Feature-Policy / Permissions-Policy
 */
export const permissionsPolicy = {
  geolocation: ['self'],
  microphone: [],
  camera: [],
  payment: [],
  usb: [],
  fullscreen: ['self'],
  displayCapture: ['self'],
};

/**
 * تحويل إعدادات Permissions-Policy إلى نص
 */
export function generatePermissionsPolicyString(): string {
  return Object.entries(permissionsPolicy)
    .map(([key, value]) => {
      if (value.length === 0) {
        return `${key}=()`;
      }
      return `${key}=(${value.join(' ')})`;
    })
    .join(', ');
}

/**
 * إضافة رؤوس الأمان للاستجابة
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // HTTPS والتشفير
  response.headers.set(
    'Strict-Transport-Security',
    `max-age=${sslConfig.hstsMaxAge}; includeSubDomains; preload`
  );
  
  // منع تضمين الصفحة في إطار
  response.headers.set('X-Frame-Options', 'DENY');
  
  // منع تخمين نوع MIME
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // تفعيل حماية XSS المدمجة في المتصفح
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // التحكم في مصادر المحتوى
  response.headers.set('Content-Security-Policy', generateCSPString());
  
  // سياسة الإحالة
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // سياسة الأذونات
  response.headers.set('Permissions-Policy', generatePermissionsPolicyString());
  
  // منع استخدام الموقع كبروكسي
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  
  return response;
}

/**
 * التحقق من إذا كان الطلب يستخدم HTTPS
 */
export function isSecureRequest(request: NextRequest): boolean {
  const proto = request.headers.get('x-forwarded-proto') || '';
  const host = request.headers.get('host') || '';
  
  return proto === 'https' || host.includes('localhost');
}

/**
 * إعادة توجيه الطلبات غير الآمنة إلى HTTPS
 */
export function redirectToHttps(request: NextRequest): NextResponse | null {
  if (!sslConfig.enforceHttps) return null;
  
  if (!isSecureRequest(request)) {
    const url = new URL(request.url);
    url.protocol = 'https:';
    
    return NextResponse.redirect(url, 301);
  }
  
  return null;
}

/**
 * إنشاء نص نهج الأمان للموقع
 */
export function generateSecurityPolicyText(): string {
  return `
# سياسة الأمان لموقع أومنيرا

## الغرض
توضح هذه الوثيقة الإجراءات والسياسات المتبعة لضمان أمان وخصوصية بيانات المستخدمين على موقعنا.

## سياسة حماية البيانات
- نحن نستخدم بروتوكول HTTPS المشفر لجميع الاتصالات
- نحن لا نخزن معلومات الدفع على خوادمنا
- يتم تشفير جميع البيانات الحساسة المخزنة
- نحن لا نشارك بياناتك مع أطراف ثالثة دون موافقتك

## التدابير الفنية
- تشفير البيانات أثناء النقل باستخدام TLS 1.2 أو أعلى
- تحديثات أمنية منتظمة لجميع الخدمات والمكونات
- مراقبة أمنية 24/7
- اختبارات اختراق منتظمة

## الإبلاغ عن الثغرات الأمنية
إذا اكتشفت ثغرة أمنية في موقعنا، يرجى الإبلاغ عنها على info@omniravalet.com
  `;
}
